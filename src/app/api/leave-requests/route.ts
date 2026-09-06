import { NextRequest } from 'next/server';
import { LeaveRequest } from '@/models';
import { badRequest, objectId, ok, readJson, route, toDateStr } from '@/lib/http';
import { requireClass, requireEnrollment } from '@/lib/attendance';

const STATUSES = ['Pending', 'Approved', 'Rejected'];

/** GET /api/leave-requests?studentId=&teacherId=&classId=&status= */
export const GET = route('Get leave requests', async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const query: Record<string, unknown> = {};

  const studentId = params.get('studentId');
  const teacherId = params.get('teacherId');
  const classId = params.get('classId');
  const status = params.get('status');

  if (studentId) query.studentId = objectId(studentId, 'student ID');
  if (teacherId) query.teacherId = objectId(teacherId, 'teacher ID');
  if (classId) query.classId = objectId(classId, 'class ID');
  if (status && status !== 'All') {
    if (!STATUSES.includes(status)) throw badRequest(`Status must be one of: ${STATUSES.join(', ')}`);
    query.status = status;
  }

  const leaveRequests = await LeaveRequest.find(query).sort({ createdAt: -1 }).lean();
  return ok({ leaveRequests });
});

/**
 * POST /api/leave-requests
 * Only a student enrolled in the course may raise a leave request for it.
 */
export const POST = route('Create leave request', async (request: NextRequest) => {
  const body = await readJson<{
    studentId?: string;
    classId?: string;
    date?: string;
    reason?: string;
  }>(request);

  const studentId = objectId(body.studentId, 'student ID');
  const classId = objectId(body.classId, 'class ID');
  const reason = String(body.reason ?? '').trim();

  if (!reason) throw badRequest('A reason is required');
  if (!body.date) throw badRequest('A date is required');
  const date = toDateStr(body.date);

  // Enrollment gate — the student must belong to this course.
  const enrollment = await requireEnrollment(studentId, classId);
  const cls = await requireClass(classId);

  const duplicate = await LeaveRequest.findOne({
    studentId,
    classId,
    date,
    status: { $ne: 'Rejected' },
  });
  if (duplicate) {
    return ok({ message: 'A leave request for this date already exists', leaveRequest: duplicate });
  }

  const leaveRequest = await LeaveRequest.create({
    studentId,
    studentName: enrollment.name,
    rollNo: enrollment.rollNo,
    subject: cls.name,
    date,
    reason,
    classId,
    teacherId: cls.teacherId,
    status: 'Pending',
  });

  return ok({ leaveRequest }, 201);
});
