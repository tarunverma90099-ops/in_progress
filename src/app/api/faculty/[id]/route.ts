import { NextRequest } from 'next/server';
import { Faculty, User } from '@/models';
import { notFound, objectId, ok, readJson, route } from '@/lib/http';

type Ctx = { params: Promise<{ id: string }> };

const EDITABLE = ['name', 'department', 'status', 'photo', 'subjects', 'attendance'] as const;

/** GET /api/faculty/:id */
export const GET = route('Get faculty', async (_request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const faculty = await Faculty.findById(objectId(id, 'faculty ID')).lean();
  if (!faculty) throw notFound('Faculty not found');
  return ok({ faculty });
});

/** PUT /api/faculty/:id */
export const PUT = route('Update faculty', async (request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await readJson<Record<string, unknown>>(request);

  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const faculty = await Faculty.findByIdAndUpdate(
    objectId(id, 'faculty ID'),
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!faculty) throw notFound('Faculty not found');
  return ok({ faculty });
});

/** DELETE /api/faculty/:id — also removes the login when no profile still uses it. */
export const DELETE = route('Delete faculty', async (_request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const faculty = await Faculty.findByIdAndDelete(objectId(id, 'faculty ID'));
  if (!faculty) throw notFound('Faculty not found');

  if (faculty.userId && !(await Faculty.exists({ userId: faculty.userId }))) {
    await User.findByIdAndDelete(faculty.userId);
  }

  return ok({ message: 'Faculty deleted successfully' });
});
