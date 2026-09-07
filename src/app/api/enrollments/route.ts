import { NextRequest } from 'next/server';
import { Class, Student, User } from '@/models';
import { badRequest, conflict, forbidden, notFound, objectId, ok, readJson, route } from '@/lib/http';
import { syncEnrolledCount } from '@/lib/attendance';

/**
 * GET /api/enrollments?userId=...
 *
 * Returns the courses a student is enrolled in plus the courses still open for
 * registration, so the student dashboard can render both lists in one request.
 */
export const GET = route('Get enrollments', async (request: NextRequest) => {
  const userId = objectId(request.nextUrl.searchParams.get('userId'), 'user ID');

  const enrollments = await Student.find({ userId }).sort({ createdAt: -1 }).lean();
  const enrolledClassIds = enrollments.map((e) => e.classId);

  const classes = await Class.find({}).sort({ name: 1 }).lean();
  const enrolledIdSet = new Set(enrolledClassIds.map(String));

  const teacherIds = [...new Set(classes.map((c) => String(c.teacherId)))];
  const teachers = await User.find({ _id: { $in: teacherIds } }).select('name').lean();
  const teacherNames = new Map(teachers.map((t) => [String(t._id), t.name]));

  const decorate = (cls: (typeof classes)[number]) => ({
    _id: cls._id,
    name: cls.name,
    teacherId: cls.teacherId,
    teacherName: teacherNames.get(String(cls.teacherId)) ?? 'Unknown',
    capacity: cls.capacity,
    enrolled: cls.totalStudents,
    seatsLeft: Math.max(0, (cls.capacity ?? 0) - (cls.totalStudents ?? 0)),
    enrollmentOpen: cls.enrollmentOpen !== false,
  });

  return ok({
    enrollments: enrollments.map((e) => {
      const cls = classes.find((c) => String(c._id) === String(e.classId));
      return { ...e, class: cls ? decorate(cls) : null };
    }),
    availableCourses: classes
      .filter((c) => !enrolledIdSet.has(String(c._id)))
      .map(decorate)
      .filter((c) => c.enrollmentOpen && c.seatsLeft > 0),
  });
});

/**
 * POST /api/enrollments  { userId, classId, rollNo? }
 *
 * Registers a student account into a course. Only enrolled students can later
 * have attendance recorded for that course, so this is the single gate.
 */
export const POST = route('Create enrollment', async (request: NextRequest) => {
  const body = await readJson<{ userId?: string; classId?: string; rollNo?: string | number }>(
    request
  );
  const userId = objectId(body.userId, 'user ID');
  const classId = objectId(body.classId, 'class ID');

  const [user, cls] = await Promise.all([User.findById(userId), Class.findById(classId)]);

  if (!user) throw notFound('User account not found');
  if (user.role !== 'student') throw forbidden('Only student accounts can enroll in a course');
  if (!cls) throw notFound('Course not found');
  if (cls.enrollmentOpen === false) throw forbidden('Registration is closed for this course');

  if (await Student.exists({ classId, userId })) {
    throw conflict('You are already registered for this course');
  }

  // Recount rather than trusting the denormalised counter before capacity checks.
  const enrolledCount = await syncEnrolledCount(classId);
  if (enrolledCount >= cls.capacity) {
    throw conflict('This course is full');
  }

  const rollNo = await resolveRollNo(classId, body.rollNo ?? user.rollNo);

  const enrollment = await Student.create({
    userId,
    classId,
    name: user.name,
    rollNo,
    email: user.email,
    attended: 0,
    total: 0,
  });

  await syncEnrolledCount(classId);

  return ok({ message: `Registered for ${cls.name}`, enrollment }, 201);
});

/** DELETE /api/enrollments?userId=...&classId=... — withdraw from a course. */
export const DELETE = route('Delete enrollment', async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const userId = objectId(params.get('userId'), 'user ID');
  const classId = objectId(params.get('classId'), 'class ID');

  const removed = await Student.findOneAndDelete({ userId, classId });
  if (!removed) throw notFound('Enrollment not found');

  await syncEnrolledCount(classId);
  return ok({ message: 'Withdrawn from course' });
});

/** Use the requested roll number when free, otherwise allocate the next one. */
async function resolveRollNo(classId: string, requested: unknown): Promise<number> {
  const parsed = Number.parseInt(String(requested ?? ''), 10);

  if (Number.isFinite(parsed) && parsed > 0) {
    if (!(await Student.exists({ classId, rollNo: parsed }))) return parsed;
    throw badRequest(`Roll number ${parsed} is already taken in this course`);
  }

  const highest = await Student.findOne({ classId }).sort({ rollNo: -1 }).select('rollNo').lean();
  return (highest?.rollNo ?? 0) + 1;
}
