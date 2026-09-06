import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { AttendanceRecord, Session, Student } from '@/models';
import { HttpError, badRequest, notFound, objectId, ok, readJson, route, todayStr } from '@/lib/http';
import {
  recordSessionHistory,
  requireClass,
  requireEnrollment,
  upsertAttendance,
} from '@/lib/attendance';

type Ctx = { params: Promise<{ id: string }> };

async function loadSession(ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await Session.findById(objectId(id, 'session ID'));
  if (!session) throw notFound('Session not found');
  return session;
}

/** GET /api/sessions/:id — live session state including who has scanned in. */
export const GET = route('Get session', async (_request: NextRequest, ctx: Ctx) => {
  const session = await loadSession(ctx);

  if (session.isActive && session.sessionExpiresAt < new Date()) {
    session.isActive = false;
    await session.save();
  }

  const scannedStudentDetails = await Student.find({
    classId: session.classId,
    userId: { $in: session.scannedStudents },
  })
    .select('name rollNo userId')
    .lean();

  return ok({ session: { ...session.toObject(), scannedStudentDetails } });
});

/**
 * PUT /api/sessions/:id
 *  { studentId }      -> QR check-in (only for students enrolled in the class)
 *  { action: 'end' }  -> finalize: scanned students Present, the rest Absent
 */
export const PUT = route('Update session', async (request: NextRequest, ctx: Ctx) => {
  const body = await readJson<{ studentId?: string; action?: string }>(request);
  const session = await loadSession(ctx);
  const classId = String(session.classId);

  if (body.action === 'end') {
    return endSession(session, classId);
  }

  if (!body.studentId) {
    throw badRequest('Provide a studentId to check in, or action "end" to finish the session');
  }

  return checkIn(session, classId, objectId(body.studentId, 'student ID'));
});

/** DELETE /api/sessions/:id — discard a session without finalizing attendance. */
export const DELETE = route('Delete session', async (_request: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const deleted = await Session.findByIdAndDelete(objectId(id, 'session ID'));
  if (!deleted) throw notFound('Session not found');
  return ok({ message: 'Session discarded' });
});

async function checkIn(
  session: mongoose.Document & {
    classId: mongoose.Types.ObjectId;
    isActive: boolean;
    sessionExpiresAt: Date;
    scannedStudents: mongoose.Types.ObjectId[];
  },
  classId: string,
  studentUserId: string
) {
  if (!session.isActive) {
    throw new HttpError(410, 'This session has ended');
  }
  if (session.sessionExpiresAt < new Date()) {
    session.isActive = false;
    await session.save();
    throw new HttpError(410, 'This session has expired');
  }

  // Enrollment gate: only students registered for this course may check in.
  const enrollment = await requireEnrollment(studentUserId, classId);
  const cls = await requireClass(classId);

  const alreadyScanned = session.scannedStudents.some((s) => String(s) === studentUserId);
  if (alreadyScanned) {
    return ok({ message: 'Attendance already marked', alreadyMarked: true });
  }

  session.scannedStudents.push(new mongoose.Types.ObjectId(studentUserId));
  await session.save();

  await upsertAttendance({
    enrollmentId: String(enrollment._id),
    classId,
    subject: cls.name,
    date: todayStr(),
    status: 'Present',
  });

  return ok({
    message: 'Attendance marked successfully',
    course: cls.name,
    student: { _id: enrollment._id, name: enrollment.name, rollNo: enrollment.rollNo },
  });
}

async function endSession(
  session: mongoose.Document & { classId: mongoose.Types.ObjectId; isActive: boolean; scannedStudents: mongoose.Types.ObjectId[] },
  classId: string
) {
  const cls = await requireClass(classId);
  const roster = await Student.find({ classId });
  const date = todayStr();
  const scanned = new Set(session.scannedStudents.map(String));

  let presentCount = 0;
  for (const student of roster) {
    const isPresent = student.userId ? scanned.has(String(student.userId)) : false;
    if (isPresent) presentCount += 1;

    // Never overwrite an approved Leave that was already recorded for today.
    const existing = await AttendanceRecord.findOne({ studentId: student._id, classId, date });
    if (existing?.status === 'Leave') continue;

    await upsertAttendance({
      enrollmentId: String(student._id),
      classId,
      subject: cls.name,
      date,
      status: isPresent ? 'Present' : 'Absent',
    });
  }

  await recordSessionHistory(classId, date, presentCount);

  session.isActive = false;
  await session.save();

  return ok({
    message: 'Session ended and attendance finalized',
    presentCount,
    totalStudents: roster.length,
  });
}
