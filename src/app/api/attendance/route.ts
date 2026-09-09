import { NextRequest } from 'next/server';
import { AttendanceRecord, Student } from '@/models';
import { badRequest, objectId, ok, readJson, route, toDateStr } from '@/lib/http';
import {
  ATTENDANCE_STATUSES,
  bulkUpsertAttendance,
  isAttendanceStatus,
  recordSessionHistory,
  requireClass,
  resolveEnrollments,
} from '@/lib/attendance';

/**
 * GET /api/attendance?studentId=&classId=&date=
 *
 * `studentId` accepts a comma-separated list so a dashboard can load every
 * enrollment's history in one request instead of one request per course.
 */
export const GET = route('Get attendance', async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const query: Record<string, unknown> = {};

  const studentId = params.get('studentId');
  const classId = params.get('classId');
  const date = params.get('date');

  if (studentId) {
    const ids = studentId
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .map((id) => objectId(id, 'student ID'));

    if (ids.length === 0) throw badRequest('Invalid student ID');
    query.studentId = ids.length === 1 ? ids[0] : { $in: ids };
  }
  if (classId) query.classId = objectId(classId, 'class ID');
  if (date) query.date = toDateStr(date);

  if (Object.keys(query).length === 0) {
    throw badRequest('Provide at least one of studentId, classId or date');
  }

  const records = await AttendanceRecord.find(query).sort({ date: 1 }).lean();
  return ok({ records });
});

interface MarkBody {
  classId?: string;
  date?: string;
  attendanceData?: { studentId?: string; status?: string }[];
}

/**
 * POST /api/attendance
 * Body: { classId, date, attendanceData: [{ studentId, status }] }
 *
 * `studentId` may be an enrollment id or a user id; either way the student must
 * be enrolled in `classId` or the whole request is rejected. Re-marking an
 * existing record adjusts aggregates by the delta instead of double counting.
 */
export const POST = route('Mark attendance', async (request: NextRequest) => {
  const body = await readJson<MarkBody>(request);
  const classId = objectId(body.classId, 'class ID');

  if (!body.date || !Array.isArray(body.attendanceData) || body.attendanceData.length === 0) {
    throw badRequest('Class ID, date, and a non-empty attendance list are required');
  }

  const date = toDateStr(body.date);

  // Validate the payload before touching the database.
  const refs = body.attendanceData.map((entry) => {
    const studentRef = objectId(entry.studentId, 'student ID');
    if (!isAttendanceStatus(entry.status)) {
      throw badRequest(`Status must be one of: ${ATTENDANCE_STATUSES.join(', ')}`);
    }
    return { studentRef, status: entry.status };
  });

  if (new Set(refs.map((r) => r.studentRef)).size !== refs.length) {
    throw badRequest('Duplicate student in attendance list');
  }

  // Authorise every student up front: one unenrolled student rejects the batch,
  // so a partially-applied roster can never be written.
  const [cls, byRef] = await Promise.all([
    requireClass(classId),
    resolveEnrollments(
      refs.map((r) => r.studentRef),
      classId
    ),
  ]);

  const entries = refs.map(({ studentRef, status }) => ({
    enrollment: byRef.get(studentRef)!,
    status,
  }));

  // Guard against two references (enrollment id + user id) for the same student.
  if (new Set(entries.map((e) => String(e.enrollment._id))).size !== entries.length) {
    throw badRequest('Duplicate student in attendance list');
  }

  await bulkUpsertAttendance({
    entries: entries.map((e) => ({ enrollmentId: String(e.enrollment._id), status: e.status })),
    classId,
    subject: cls.name,
    date,
  });

  const results = entries.map(({ enrollment, status }) => ({
    studentId: enrollment._id,
    rollNo: enrollment.rollNo,
    status,
  }));

  // Once the whole roster is marked, reflect the day in the class history.
  const enrolledCount = await Student.countDocuments({ classId });
  if (enrolledCount > 0 && entries.length >= enrolledCount) {
    const presentCount = entries.filter((e) => e.status === 'Present').length;
    await recordSessionHistory(classId, date, presentCount);
  }

  return ok({ message: 'Attendance recorded', date, results });
});
