import { NextRequest } from 'next/server';
import { Class, Student, User } from '@/models';
import { badRequest, conflict, emailFilter, notFound, objectId, ok, readJson, route } from '@/lib/http';
import { syncEnrolledCount } from '@/lib/attendance';

/** GET /api/students?classId=... | ?userId=... — class roster or a user's enrollments. */
export const GET = route('Get students', async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const classId = params.get('classId');
  const userId = params.get('userId');

  if (!classId && !userId) {
    throw badRequest('Class ID or user ID is required');
  }

  const query = classId
    ? { classId: objectId(classId, 'class ID') }
    : { userId: objectId(userId, 'user ID') };

  const students = await Student.find(query).sort({ rollNo: 1 }).lean();

  // Single lookup for all referenced classes instead of one query per student.
  const classIds = [...new Set(students.map((s) => String(s.classId)))];
  const classes = await Class.find({ _id: { $in: classIds } })
    .select('name teacherId')
    .lean();
  const classById = new Map(classes.map((c) => [String(c._id), c]));

  return ok({
    students: students.map((student) => {
      const cls = classById.get(String(student.classId));
      return {
        ...student,
        class: cls ? { _id: cls._id, name: cls.name, teacherId: cls.teacherId } : null,
      };
    }),
  });
});

/** POST /api/students — teacher/admin enrolls a student into a class. */
export const POST = route('Add student', async (request: NextRequest) => {
  const body = await readJson<{
    classId?: string;
    name?: string;
    rollNo?: string | number;
    email?: string;
  }>(request);

  const classId = objectId(body.classId, 'class ID');
  const name = String(body.name ?? '').trim();
  const email = body.email ? String(body.email).trim().toLowerCase() : undefined;

  if (!name) throw badRequest('Student name is required');

  const rollNo = Number.parseInt(String(body.rollNo ?? ''), 10);
  if (!Number.isFinite(rollNo) || rollNo <= 0) {
    throw badRequest('Roll number must be a positive number');
  }

  const cls = await Class.findById(classId);
  if (!cls) throw notFound('Class not found');

  if (await Student.exists({ classId, rollNo })) {
    throw conflict('A student with this roll number is already enrolled in this class');
  }

  // Link to the login account when one exists so the student can scan QR codes.
  const linkedUser = email
    ? await User.findOne({ email: emailFilter(email), role: 'student' }).select('_id')
    : null;
  if (linkedUser && (await Student.exists({ classId, userId: linkedUser._id }))) {
    throw conflict('This student account is already enrolled in this class');
  }

  const enrolledCount = await syncEnrolledCount(classId);
  if (enrolledCount >= cls.capacity) {
    throw conflict('This course is full');
  }

  const student = await Student.create({
    userId: linkedUser?._id ?? null,
    classId,
    name,
    rollNo,
    email,
    attended: 0,
    total: 0,
  });

  await syncEnrolledCount(classId);

  return ok({ student }, 201);
});
