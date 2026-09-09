import { NextRequest } from 'next/server';
import { AttendanceRecord, Student } from '@/models';
import { notFound, objectId, ok, readJson, route } from '@/lib/http';
import { syncEnrolledCount } from '@/lib/attendance';

type Ctx = { params: Promise<{ id: string }> };

// Fields a client may change; counters and links are server-owned.
const EDITABLE = ['name', 'email', 'rollNo'] as const;

/** PUT /api/students/:id — update an enrollment's editable fields. */
export const PUT = route('Update student', async (request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await readJson<Record<string, unknown>>(request);

  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const student = await Student.findByIdAndUpdate(
    objectId(id, 'student ID'),
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!student) throw notFound('Student not found');
  return ok({ student });
});

/** DELETE /api/students/:id — remove an enrollment and its attendance records. */
export const DELETE = route('Delete student', async (_request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const student = await Student.findByIdAndDelete(objectId(id, 'student ID'));
  if (!student) throw notFound('Student not found');

  await AttendanceRecord.deleteMany({ studentId: student._id });
  await syncEnrolledCount(String(student.classId));

  return ok({ message: 'Student removed from class' });
});
