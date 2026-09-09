import { NextRequest } from 'next/server';
import { AttendanceRecord, Class, Session, Student } from '@/models';
import { notFound, objectId, ok, readJson, route } from '@/lib/http';

type Ctx = { params: Promise<{ id: string }> };

// Only these fields may be changed through the API.
const EDITABLE = ['name', 'capacity', 'enrollmentOpen'] as const;

/** GET /api/classes/:id — a class plus its roster. */
export const GET = route('Get class', async (_request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const classId = objectId(id, 'class ID');

  const cls = await Class.findById(classId).lean();
  if (!cls) throw notFound('Class not found');

  const students = await Student.find({ classId }).sort({ rollNo: 1 }).lean();
  return ok({ class: { ...cls, students } });
});

/** PUT /api/classes/:id — update editable class settings. */
export const PUT = route('Update class', async (request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await readJson<Record<string, unknown>>(request);

  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const cls = await Class.findByIdAndUpdate(
    objectId(id, 'class ID'),
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!cls) throw notFound('Class not found');
  return ok({ class: cls });
});

/** DELETE /api/classes/:id — remove a class and everything hanging off it. */
export const DELETE = route('Delete class', async (_request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const classId = objectId(id, 'class ID');

  const cls = await Class.findByIdAndDelete(classId);
  if (!cls) throw notFound('Class not found');

  await Promise.all([
    Student.deleteMany({ classId }),
    AttendanceRecord.deleteMany({ classId }),
    Session.deleteMany({ classId }),
  ]);

  return ok({ message: 'Class deleted successfully' });
});
