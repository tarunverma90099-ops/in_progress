import { AttendanceRecord, Class, Student, StudentAttendance } from '@/models';
import { forbidden, notFound } from '@/lib/http';

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Leave'];

export function isAttendanceStatus(value: unknown): value is AttendanceStatus {
  return ATTENDANCE_STATUSES.includes(value as AttendanceStatus);
}

/**
 * Resolve the enrollment (Student doc) that authorises attendance for a class.
 *
 * `studentRef` may be either the enrollment `_id` or the login `userId`.
 * Attendance can only ever be recorded through an existing enrollment, which is
 * what restricts marking to students enrolled in that specific course.
 */
export async function requireEnrollment(studentRef: string, classId: string) {
  const enrollment = await Student.findOne({
    classId,
    $or: [{ _id: studentRef }, { userId: studentRef }],
  });

  if (!enrollment) {
    throw forbidden('This student is not enrolled in this course');
  }
  return enrollment;
}

export async function requireClass(classId: string) {
  const cls = await Class.findById(classId);
  if (!cls) throw notFound('Class not found');
  return cls;
}

/**
 * Record (or re-record) one student's attendance for a class on a date and keep
 * the `Student` and `StudentAttendance` aggregates consistent.
 *
 * Idempotent: re-marking the same status is a no-op, and flipping a status
 * adjusts the counters by the delta instead of double counting.
 */
export async function upsertAttendance(params: {
  enrollmentId: string;
  classId: string;
  subject: string;
  date: string;
  status: AttendanceStatus;
}) {
  const { enrollmentId, classId, subject, date, status } = params;

  const existing = await AttendanceRecord.findOne({ studentId: enrollmentId, classId, date });

  if (existing && existing.status === status) {
    return { record: existing, changed: false };
  }

  const isPresent = status === 'Present' ? 1 : 0;
  const wasPresent = existing?.status === 'Present' ? 1 : 0;
  const attendedDelta = isPresent - wasPresent;

  const record = await AttendanceRecord.findOneAndUpdate(
    { studentId: enrollmentId, classId, date },
    { status },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (existing) {
    if (attendedDelta !== 0) {
      await Promise.all([
        StudentAttendance.updateOne(
          { studentId: enrollmentId, subject },
          { $inc: { attended: attendedDelta }, $set: { 'history.$[elem].status': status } },
          { arrayFilters: [{ 'elem.date': date }] }
        ),
        Student.updateOne({ _id: enrollmentId }, { $inc: { attended: attendedDelta } }),
      ]);
    } else {
      await StudentAttendance.updateOne(
        { studentId: enrollmentId, subject },
        { $set: { 'history.$[elem].status': status } },
        { arrayFilters: [{ 'elem.date': date }] }
      );
    }
  } else {
    await Promise.all([
      StudentAttendance.findOneAndUpdate(
        { studentId: enrollmentId, subject },
        {
          $inc: { total: 1, attended: isPresent },
          $push: { history: { date, status } },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ),
      Student.updateOne({ _id: enrollmentId }, { $inc: { attended: isPresent, total: 1 } }),
    ]);
  }

  return { record, changed: true };
}

/** Write the present-count for a date into the class session history. */
export async function recordSessionHistory(classId: string, date: string, present: number) {
  const updated = await Class.updateOne(
    { _id: classId, 'sessionHistory.date': date },
    { $set: { 'sessionHistory.$.present': present } }
  );

  if (updated.matchedCount === 0) {
    await Class.updateOne({ _id: classId }, { $push: { sessionHistory: { date, present } } });
  }
}

/** Keep the denormalised enrolled-student counter in sync with reality. */
export async function syncEnrolledCount(classId: string) {
  const enrolledCount = await Student.countDocuments({ classId });
  await Class.updateOne({ _id: classId }, { $set: { totalStudents: enrolledCount } });
  return enrolledCount;
}
