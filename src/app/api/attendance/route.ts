import { NextRequest } from 'next/server';
import { AttendanceRecord, Student } from '@/models';
import { badRequest, objectId, ok, readJson, route, toDateStr } from '@/lib/http';
import {
  ATTENDANCE_STATUSES,
  isAttendanceStatus,
  recordSessionHistory,
  requireClass,
  requireEnrollment,
  upsertAttendance,
} from '@/lib/attendance';

/** GET /api/attendance?studentId=&classId=&date= */
export const GET = route('Get attendance', async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const query: Record<string, unknown> = {};

  const studentId = params.get('studentId');
  const classId = params.get('classId');
  const date = params.get('date');

  if (studentId) query.studentId = objectId(studentId, 'student ID');
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
  const cls = await requireClass(classId);

  // Validate + authorise everything before writing anything.
  const entries = await Promise.all(
    body.attendanceData.map(async (entry) => {
      const studentRef = objectId(entry.studentId, 'student ID');
      if (!isAttendanceStatus(entry.status)) {
        throw badRequest(`Status must be one of: ${ATTENDANCE_STATUSES.join(', ')}`);
      }
      const enrollment = await requireEnrollment(studentRef, classId);
      return { enrollment, status: entry.status };
    })
  );

  const seen = new Set<string>();
  for (const { enrollment } of entries) {
    const key = String(enrollment._id);
    if (seen.has(key)) throw badRequest('Duplicate student in attendance list');
    seen.add(key);
  }

  const results = [];
  for (const { enrollment, status } of entries) {
    const { record } = await upsertAttendance({
      enrollmentId: String(enrollment._id),
      classId,
      subject: cls.name,
      date,
      status,
    });
    results.push({ studentId: enrollment._id, rollNo: enrollment.rollNo, status: record.status });
  }

  // Once the whole roster is marked, reflect the day in the class history.
  const enrolledCount = await Student.countDocuments({ classId });
  if (enrolledCount > 0 && entries.length >= enrolledCount) {
    const presentCount = entries.filter((e) => e.status === 'Present').length;
    await recordSessionHistory(classId, date, presentCount);
  }

  return ok({ message: 'Attendance recorded', date, results });
});
