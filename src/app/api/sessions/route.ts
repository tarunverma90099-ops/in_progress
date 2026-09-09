import { NextRequest } from 'next/server';
import { Class, Session } from '@/models';
import { badRequest, forbidden, notFound, objectId, ok, readJson, route } from '@/lib/http';

const DEFAULT_DURATION_MS = 10 * 60 * 1000;
const MAX_DURATION_MS = 6 * 60 * 60 * 1000;

/** GET /api/sessions?classId=&teacherId= */
export const GET = route('Get sessions', async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const query: Record<string, unknown> = {};

  const classId = params.get('classId');
  const teacherId = params.get('teacherId');
  if (classId) query.classId = objectId(classId, 'class ID');
  if (teacherId) query.teacherId = objectId(teacherId, 'teacher ID');

  const sessions = await Session.find(query).sort({ createdAt: -1 }).limit(100).lean();
  return ok({ sessions });
});

/** POST /api/sessions — open a live attendance session for a class. */
export const POST = route('Create session', async (request: NextRequest) => {
  const body = await readJson<{ classId?: string; teacherId?: string; duration?: number }>(request);

  const classId = objectId(body.classId, 'class ID');
  const teacherId = objectId(body.teacherId, 'teacher ID');

  const duration = body.duration === undefined ? DEFAULT_DURATION_MS : Number(body.duration);
  if (!Number.isFinite(duration) || duration <= 0 || duration > MAX_DURATION_MS) {
    throw badRequest('Duration must be between 1ms and 6 hours');
  }

  const cls = await Class.findById(classId).select('teacherId');
  if (!cls) throw notFound('Class not found');
  if (String(cls.teacherId) !== teacherId) {
    throw forbidden('Only the teacher who owns this class can start a session');
  }

  // Never leave two live sessions competing for the same class.
  await Session.updateMany({ classId, isActive: true }, { $set: { isActive: false } });

  const session = await Session.create({
    classId,
    teacherId,
    sessionExpiresAt: new Date(Date.now() + duration),
    isActive: true,
    scannedStudents: [],
  });

  return ok({ session }, 201);
});
