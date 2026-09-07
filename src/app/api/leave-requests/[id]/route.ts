import { NextRequest } from 'next/server';
import { LeaveRequest } from '@/models';
import { badRequest, notFound, objectId, ok, readJson, route } from '@/lib/http';
import { requireClass, requireEnrollment, upsertAttendance } from '@/lib/attendance';

type Ctx = { params: Promise<{ id: string }> };
const STATUSES = ['Pending', 'Approved', 'Rejected'];

/** PUT /api/leave-requests/:id — approve or reject a request. */
export const PUT = route('Update leave request', async (request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const { status } = await readJson<{ status?: string }>(request);

  if (!status || !STATUSES.includes(status)) {
    throw badRequest(`Status must be one of: ${STATUSES.join(', ')}`);
  }

  const leaveRequest = await LeaveRequest.findByIdAndUpdate(
    objectId(id, 'leave request ID'),
    { status },
    { new: true }
  );
  if (!leaveRequest) throw notFound('Leave request not found');

  // Approving a leave writes it straight into that day's attendance.
  if (status === 'Approved') {
    const classId = String(leaveRequest.classId);
    const enrollment = await requireEnrollment(String(leaveRequest.studentId), classId);
    const cls = await requireClass(classId);

    await upsertAttendance({
      enrollmentId: String(enrollment._id),
      classId,
      subject: cls.name,
      date: leaveRequest.date,
      status: 'Leave',
    });
  }

  return ok({ leaveRequest });
});

/** DELETE /api/leave-requests/:id */
export const DELETE = route('Delete leave request', async (_request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const deleted = await LeaveRequest.findByIdAndDelete(objectId(id, 'leave request ID'));
  if (!deleted) throw notFound('Leave request not found');
  return ok({ message: 'Leave request deleted successfully' });
});
