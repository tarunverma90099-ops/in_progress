import { NextRequest } from 'next/server';
import { Class, Student } from '@/models';
import { badRequest, conflict, objectId, ok, readJson, route } from '@/lib/http';

/** GET /api/classes?teacherId=... — classes with their rosters attached. */
export const GET = route('Get classes', async (request: NextRequest) => {
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  const query = teacherId ? { teacherId: objectId(teacherId, 'teacher ID') } : {};

  const classes = await Class.find(query).sort({ createdAt: -1 }).lean();

  // One roster query for every class instead of N sequential queries.
  const students = await Student.find({ classId: { $in: classes.map((c) => c._id) } })
    .sort({ rollNo: 1 })
    .lean();

  const byClass = new Map<string, typeof students>();
  for (const student of students) {
    const key = String(student.classId);
    const list = byClass.get(key) ?? [];
    list.push(student);
    byClass.set(key, list);
  }

  return ok({
    classes: classes.map((cls) => ({
      ...cls,
      students: byClass.get(String(cls._id)) ?? [],
    })),
  });
});

/** POST /api/classes — create a course. */
export const POST = route('Create class', async (request: NextRequest) => {
  const body = await readJson<{ name?: string; teacherId?: string; capacity?: number }>(request);

  const name = String(body.name ?? '').trim();
  const teacherId = objectId(body.teacherId, 'teacher ID');
  if (!name) throw badRequest('Class name is required');

  const capacity = body.capacity === undefined ? 60 : Number(body.capacity);
  if (!Number.isFinite(capacity) || capacity < 1) {
    throw badRequest('Capacity must be a positive number');
  }

  if (await Class.exists({ name, teacherId })) {
    throw conflict('A class with this name already exists for this teacher');
  }

  const created = await Class.create({
    name,
    teacherId,
    capacity,
    totalStudents: 0,
    enrollmentOpen: true,
    sessionHistory: [],
  });

  return ok({ class: created }, 201);
});
