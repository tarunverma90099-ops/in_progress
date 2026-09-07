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

/**
 * Resolve many students to their enrollments in one query.
 *
 * Each reference may be an enrollment `_id` or a login `userId`. Any reference
 * that does not resolve means that student is not enrolled in the course, and
 * the caller is expected to reject the whole batch.
 */
export async function resolveEnrollments(studentRefs: string[], classId: string) {
  const enrollments = await Student.find({
    classId,
    $or: [{ _id: { $in: studentRefs } }, { userId: { $in: studentRefs } }],
  });

  const byRef = new Map<string, (typeof enrollments)[number]>();
  for (const enrollment of enrollments) {
    byRef.set(String(enrollment._id), enrollment);
    if (enrollment.userId) byRef.set(String(enrollment.userId), enrollment);
  }

  const missing = studentRefs.filter((ref) => !byRef.has(ref));
  if (missing.length > 0) {
    throw forbidden(
      missing.length === 1
        ? 'This student is not enrolled in this course'
        : `${missing.length} of these students are not enrolled in this course`
    );
  }

  return byRef;
}

interface BulkEntry {
  enrollmentId: string;
  status: AttendanceStatus;
}

/**
 * Apply many attendance marks for one class/date using bulk writes.
 *
 * Equivalent to calling `upsertAttendance` per student, but issues a fixed
 * number of round trips (one read + three bulk writes) instead of ~4 per
 * student, which matters for a full-class roster.
 */
export async function bulkUpsertAttendance(params: {
  entries: BulkEntry[];
  classId: string;
  subject: string;
  date: string;
}) {
  const { entries, classId, subject, date } = params;
  if (entries.length === 0) return { changed: 0 };

  const existingRecords = await AttendanceRecord.find({
    classId,
    date,
    studentId: { $in: entries.map((e) => e.enrollmentId) },
  })
    .select('studentId status')
    .lean();

  const previousStatus = new Map(
    existingRecords.map((r) => [String(r.studentId), r.status as AttendanceStatus])
  );

  // The bulkWrite op types are generic over each model's document shape; these
  // updates use $inc/$push/arrayFilters, which the generic signature narrows
  // more tightly than is useful here, so the op lists are assembled untyped and
  // handed to bulkWrite at the call site.
  const recordOps: Record<string, unknown>[] = [];
  const studentOps: Record<string, unknown>[] = [];
  const aggregateOps: Record<string, unknown>[] = [];

  for (const { enrollmentId, status } of entries) {
    const previous = previousStatus.get(enrollmentId);
    if (previous === status) continue; // already recorded — nothing to do

    const isPresent = status === 'Present' ? 1 : 0;
    const attendedDelta = isPresent - (previous === 'Present' ? 1 : 0);

    recordOps.push({
      updateOne: {
        filter: { studentId: enrollmentId, classId, date },
        update: { $set: { status } },
        upsert: true,
      },
    });

    if (previous === undefined) {
      // First record for this student on this date: grow both counters.
      studentOps.push({
        updateOne: {
          filter: { _id: enrollmentId },
          update: { $inc: { attended: isPresent, total: 1 } },
        },
      });
      aggregateOps.push({
        updateOne: {
          filter: { studentId: enrollmentId, subject },
          update: {
            $inc: { total: 1, attended: isPresent },
            $push: { history: { date, status } },
          },
          upsert: true,
        },
      });
    } else {
      // Correcting an existing mark: only shift `attended`, never `total`.
      if (attendedDelta !== 0) {
        studentOps.push({
          updateOne: {
            filter: { _id: enrollmentId },
            update: { $inc: { attended: attendedDelta } },
          },
        });
      }
      aggregateOps.push({
        updateOne: {
          filter: { studentId: enrollmentId, subject },
          update: {
            ...(attendedDelta !== 0 ? { $inc: { attended: attendedDelta } } : {}),
            $set: { 'history.$[elem].status': status },
          },
          arrayFilters: [{ 'elem.date': date }],
        },
      });
    }
  }

  if (recordOps.length === 0) return { changed: 0 };

  type BulkOps = Parameters<typeof AttendanceRecord.bulkWrite>[0];
  await Promise.all([
    AttendanceRecord.bulkWrite(recordOps as unknown as BulkOps),
    studentOps.length ? Student.bulkWrite(studentOps as unknown as BulkOps) : null,
    aggregateOps.length ? StudentAttendance.bulkWrite(aggregateOps as unknown as BulkOps) : null,
  ]);

  return { changed: recordOps.length };
}
