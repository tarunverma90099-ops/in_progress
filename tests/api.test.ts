/**
 * End-to-end checks for the attendance API route handlers.
 *
 * Run with:  npm test
 *
 * The handlers are imported directly and driven with real Request objects,
 * backed by the in-memory model store in ./memory-models.
 */
import assert from 'node:assert/strict';
import { AttendanceRecord, Class, Session, Student, User, resetAll } from './memory-models';

import { POST as register } from '../src/app/api/auth/register/route';
import { GET as getEnrollments, POST as enroll, DELETE as withdraw } from '../src/app/api/enrollments/route';
import { POST as markAttendance, GET as getAttendance } from '../src/app/api/attendance/route';
import { POST as createSession } from '../src/app/api/sessions/route';
import { PUT as updateSession } from '../src/app/api/sessions/[id]/route';
import { POST as createLeave } from '../src/app/api/leave-requests/route';
import { PUT as updateLeave } from '../src/app/api/leave-requests/[id]/route';

// Route handlers accept a NextRequest (and optionally a params context); the
// harness drives them with plain Requests, so the signature is widened here.
type Handler = (req: never, ctx: never) => Promise<Response>;
const h = (fn: unknown) => fn as Handler;

const BASE = 'http://localhost:3000';

const post = (handler: Handler, path: string, body: unknown, ctx?: unknown) =>
  call(handler, new Request(`${BASE}${path}`, { method: 'POST', body: JSON.stringify(body) }), ctx);

const put = (handler: Handler, path: string, body: unknown, ctx?: unknown) =>
  call(handler, new Request(`${BASE}${path}`, { method: 'PUT', body: JSON.stringify(body) }), ctx);

const get = (handler: Handler, path: string, ctx?: unknown) =>
  call(handler, new Request(`${BASE}${path}`), ctx);

const del = (handler: Handler, path: string, ctx?: unknown) =>
  call(handler, new Request(`${BASE}${path}`, { method: 'DELETE' }), ctx);

async function call(handler: Handler, request: Request, ctx?: unknown) {
  // Next's NextRequest adds nextUrl; the routes only need that plus json().
  Object.defineProperty(request, 'nextUrl', { value: new URL(request.url), configurable: true });
  const response = await handler(request as never, ctx as never);
  return { status: response.status, body: await response.json() };
}

const routeCtx = (id: string) => ({ params: Promise.resolve({ id }) });

// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;
const tests: [string, () => Promise<void>][] = [];
const test = (name: string, fn: () => Promise<void>) => tests.push([name, fn]);

process.env.JWT_SECRET = 'test-secret';

/** Seed a teacher, a course and two student accounts. */
async function seed() {
  resetAll();
  const teacher = await User.create({ name: 'Prof X', email: 't@c.edu', role: 'teacher' });
  const cls = await Class.create({ name: 'Digital Circuits', teacherId: teacher._id, capacity: 2 });
  const alice = await User.create({ name: 'Alice', email: 'a@c.edu', role: 'student', rollNo: '101' });
  const bob = await User.create({ name: 'Bob', email: 'b@c.edu', role: 'student', rollNo: '102' });
  return { teacher, cls, alice, bob };
}

// --- Registration ----------------------------------------------------------

test('registration rejects a short password', async () => {
  resetAll();
  const res = await post(h(register), '/api/auth/register', {
    name: 'Alice',
    email: 'a@c.edu',
    password: 'short',
    role: 'student',
    rollNo: '101',
  });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /at least 8/);
});

test('registration rejects a student without a roll number', async () => {
  resetAll();
  const res = await post(h(register), '/api/auth/register', {
    name: 'Alice',
    email: 'a@c.edu',
    password: 'password123',
    role: 'student',
  });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /Roll number/);
});

test('registration creates a student and rejects a duplicate email', async () => {
  resetAll();
  const body = {
    name: 'Alice',
    email: 'Alice@C.edu',
    password: 'password123',
    role: 'student',
    rollNo: '101',
  };
  const first = await post(h(register), '/api/auth/register', body);
  assert.equal(first.status, 201);
  assert.equal(first.body.user.email, 'alice@c.edu', 'email is normalised to lowercase');

  const second = await post(h(register), '/api/auth/register', body);
  assert.equal(second.status, 409);
});

// --- Course enrollment -----------------------------------------------------

test('a student registering for a course keeps their own roll number', async () => {
  const { cls, alice } = await seed(); // alice.rollNo === '101'
  const res = await post(h(enroll), '/api/enrollments', {
    userId: alice._id,
    classId: cls._id,
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.enrollment.rollNo, 101);
  assert.equal((await Class.findById(cls._id))!.totalStudents, 1);
});

test('a student without a roll number gets the next free one', async () => {
  const { cls } = await seed();
  const dan = await User.create({ name: 'Dan', email: 'd@c.edu', role: 'student' });
  const res = await post(h(enroll), '/api/enrollments', { userId: dan._id, classId: cls._id });
  assert.equal(res.status, 201);
  assert.equal(res.body.enrollment.rollNo, 1);
});

test('a roll number already taken in the course is rejected', async () => {
  const { cls, alice, bob } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  const res = await post(h(enroll), '/api/enrollments', {
    userId: bob._id,
    classId: cls._id,
    rollNo: 101,
  });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /already taken/);
});

test('a student cannot register for the same course twice', async () => {
  const { cls, alice } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  const res = await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  assert.equal(res.status, 409);
  assert.match(res.body.error, /already registered/);
});

test('registration is refused once the course is full', async () => {
  const { cls, alice, bob } = await seed(); // capacity 2
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  await post(h(enroll), '/api/enrollments', { userId: bob._id, classId: cls._id });

  const carol = await User.create({ name: 'Carol', email: 'c@c.edu', role: 'student' });
  const res = await post(h(enroll), '/api/enrollments', { userId: carol._id, classId: cls._id });
  assert.equal(res.status, 409);
  assert.match(res.body.error, /full/);
});

test('a teacher account cannot enroll as a student', async () => {
  const { cls, teacher } = await seed();
  const res = await post(h(enroll), '/api/enrollments', {
    userId: teacher._id,
    classId: cls._id,
  });
  assert.equal(res.status, 403);
});

test('registration is refused when enrollment is closed', async () => {
  const { cls, alice } = await seed();
  await Class.updateOne({ _id: cls._id }, { $set: { enrollmentOpen: false } });
  const res = await post(h(enroll), '/api/enrollments', {
    userId: alice._id,
    classId: cls._id,
  });
  assert.equal(res.status, 403);
});

test('enrollment listing separates enrolled from available courses', async () => {
  const { cls, alice } = await seed();
  const other = await Class.create({ name: 'Embedded Systems', teacherId: (await User.findOne({ role: 'teacher' }))!._id });

  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  const res = await get(h(getEnrollments), `/api/enrollments?userId=${alice._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.enrollments.length, 1);
  assert.equal(res.body.enrollments[0].class.name, 'Digital Circuits');
  assert.deepEqual(
    res.body.availableCourses.map((c: { _id: string }) => c._id),
    [other._id]
  );
});

test('withdrawing frees a seat', async () => {
  const { cls, alice } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  const res = await del(h(withdraw), `/api/enrollments?userId=${alice._id}&classId=${cls._id}`);
  assert.equal(res.status, 200);
  assert.equal((await Class.findById(cls._id))!.totalStudents, 0);
});

test('invalid ids return 400 rather than crashing', async () => {
  await seed();
  const res = await post(h(enroll), '/api/enrollments', { userId: 'nope', classId: 'nope' });
  assert.equal(res.status, 400);
});

// --- Attendance is gated on enrollment --------------------------------------

test('attendance is rejected for a student who is not enrolled', async () => {
  const { cls, alice, bob } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });

  const res = await post(h(markAttendance), '/api/attendance', {
    classId: cls._id,
    date: '2026-03-02',
    attendanceData: [{ studentId: bob._id, status: 'Present' }],
  });
  assert.equal(res.status, 403);
  assert.match(res.body.error, /not enrolled/);
});

test('one unenrolled student rejects the whole batch (no partial writes)', async () => {
  const { cls, alice, bob } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });

  const res = await post(h(markAttendance), '/api/attendance', {
    classId: cls._id,
    date: '2026-03-02',
    attendanceData: [
      { studentId: alice._id, status: 'Present' },
      { studentId: bob._id, status: 'Present' },
    ],
  });
  assert.equal(res.status, 403);
  assert.equal(AttendanceRecord.docs.length, 0, 'nothing was written');
});

test('attendance is recorded for enrolled students and is idempotent', async () => {
  const { cls, alice } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  const payload = {
    classId: cls._id,
    date: '2026-03-02',
    attendanceData: [{ studentId: alice._id, status: 'Present' }],
  };

  assert.equal((await post(h(markAttendance), '/api/attendance', payload)).status, 200);
  assert.equal((await post(h(markAttendance), '/api/attendance', payload)).status, 200);

  const enrollment = await Student.findOne({ userId: alice._id, classId: cls._id });
  assert.equal(enrollment!.attended, 1, 'marking twice does not double count');
  assert.equal(enrollment!.total, 1);
  assert.equal(AttendanceRecord.docs.length, 1);
});

test('flipping Present to Absent adjusts the counters by the delta', async () => {
  const { cls, alice } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });

  await post(h(markAttendance), '/api/attendance', {
    classId: cls._id,
    date: '2026-03-02',
    attendanceData: [{ studentId: alice._id, status: 'Present' }],
  });
  await post(h(markAttendance), '/api/attendance', {
    classId: cls._id,
    date: '2026-03-02',
    attendanceData: [{ studentId: alice._id, status: 'Absent' }],
  });

  const enrollment = await Student.findOne({ userId: alice._id, classId: cls._id });
  assert.equal(enrollment!.attended, 0);
  assert.equal(enrollment!.total, 1, 'total is not incremented again');
});

test('an unknown attendance status is rejected', async () => {
  const { cls, alice } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  const res = await post(h(markAttendance), '/api/attendance', {
    classId: cls._id,
    date: '2026-03-02',
    attendanceData: [{ studentId: alice._id, status: 'Vacation' }],
  });
  assert.equal(res.status, 400);
});

test('a duplicate student in one batch is rejected', async () => {
  const { cls, alice } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  const res = await post(h(markAttendance), '/api/attendance', {
    classId: cls._id,
    date: '2026-03-02',
    attendanceData: [
      { studentId: alice._id, status: 'Present' },
      { studentId: alice._id, status: 'Absent' },
    ],
  });
  assert.equal(res.status, 400);
});

test('attendance query without any filter is rejected', async () => {
  await seed();
  const res = await get(h(getAttendance), '/api/attendance');
  assert.equal(res.status, 400);
});

// --- QR sessions ------------------------------------------------------------

test('only the owning teacher can start a session', async () => {
  const { cls } = await seed();
  const other = await User.create({ name: 'Other', email: 'o@c.edu', role: 'teacher' });
  const res = await post(h(createSession), '/api/sessions', {
    classId: cls._id,
    teacherId: other._id,
  });
  assert.equal(res.status, 403);
});

test('QR check-in is refused for a student not enrolled in that course', async () => {
  const { cls, teacher, bob } = await seed();
  const created = await post(h(createSession), '/api/sessions', {
    classId: cls._id,
    teacherId: teacher._id,
  });
  const sessionId = created.body.session._id;

  const res = await put(h(updateSession), `/api/sessions/${sessionId}`, { studentId: bob._id }, routeCtx(sessionId));
  assert.equal(res.status, 403);
  assert.match(res.body.error, /not enrolled/);
});

test('QR check-in marks an enrolled student present exactly once', async () => {
  const { cls, teacher, alice } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });

  const created = await post(h(createSession), '/api/sessions', {
    classId: cls._id,
    teacherId: teacher._id,
  });
  const sessionId = created.body.session._id;

  const first = await put(h(updateSession), `/api/sessions/${sessionId}`, { studentId: alice._id }, routeCtx(sessionId));
  assert.equal(first.status, 200);
  assert.equal(first.body.alreadyMarked, undefined);

  const second = await put(h(updateSession), `/api/sessions/${sessionId}`, { studentId: alice._id }, routeCtx(sessionId));
  assert.equal(second.body.alreadyMarked, true);

  const enrollment = await Student.findOne({ userId: alice._id, classId: cls._id });
  assert.equal(enrollment!.attended, 1);
});

test('check-in is refused after the session expires', async () => {
  const { cls, teacher, alice } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });

  const created = await post(h(createSession), '/api/sessions', {
    classId: cls._id,
    teacherId: teacher._id,
    duration: 1000,
  });
  const sessionId = created.body.session._id;
  await Session.updateOne({ _id: sessionId }, { $set: { sessionExpiresAt: new Date(Date.now() - 1000) } });

  const res = await put(h(updateSession), `/api/sessions/${sessionId}`, { studentId: alice._id }, routeCtx(sessionId));
  assert.equal(res.status, 410);
});

test('ending a session marks the scanned present and the rest absent', async () => {
  const { cls, teacher, alice, bob } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });
  await post(h(enroll), '/api/enrollments', { userId: bob._id, classId: cls._id });

  const created = await post(h(createSession), '/api/sessions', {
    classId: cls._id,
    teacherId: teacher._id,
  });
  const sessionId = created.body.session._id;
  await put(h(updateSession), `/api/sessions/${sessionId}`, { studentId: alice._id }, routeCtx(sessionId));

  const ended = await put(h(updateSession), `/api/sessions/${sessionId}`, { action: 'end' }, routeCtx(sessionId));
  assert.equal(ended.body.presentCount, 1);
  assert.equal(ended.body.totalStudents, 2);

  const aliceRow = await Student.findOne({ userId: alice._id, classId: cls._id });
  const bobRow = await Student.findOne({ userId: bob._id, classId: cls._id });
  assert.equal(aliceRow!.attended, 1);
  assert.equal(bobRow!.attended, 0);
  assert.equal(bobRow!.total, 1, 'absent students still count towards the total');

  const cls2 = await Class.findById(cls._id);
  assert.equal((cls2!.sessionHistory as { present: number }[])[0].present, 1);
});

test('starting a new session deactivates the previous one', async () => {
  const { cls, teacher } = await seed();
  const first = await post(h(createSession), '/api/sessions', { classId: cls._id, teacherId: teacher._id });
  await post(h(createSession), '/api/sessions', { classId: cls._id, teacherId: teacher._id });

  const stale = await Session.findById(first.body.session._id);
  assert.equal(stale!.isActive, false);
});

// --- Leave requests ---------------------------------------------------------

test('a leave request requires enrollment in the course', async () => {
  const { cls, bob } = await seed();
  const res = await post(h(createLeave), '/api/leave-requests', {
    studentId: bob._id,
    classId: cls._id,
    date: '2026-03-02',
    reason: 'Sick',
  });
  assert.equal(res.status, 403);
});

test('approving a leave writes a Leave attendance record', async () => {
  const { cls, alice } = await seed();
  await post(h(enroll), '/api/enrollments', { userId: alice._id, classId: cls._id });

  const created = await post(h(createLeave), '/api/leave-requests', {
    studentId: alice._id,
    classId: cls._id,
    date: '2026-03-02',
    reason: 'Sick',
  });
  assert.equal(created.status, 201);

  const id = created.body.leaveRequest._id;
  const approved = await put(h(updateLeave), `/api/leave-requests/${id}`, { status: 'Approved' }, routeCtx(id));
  assert.equal(approved.status, 200);

  const record = await AttendanceRecord.findOne({ classId: cls._id, date: '2026-03-02' });
  assert.equal(record!.status, 'Leave');
});

// ---------------------------------------------------------------------------

(async () => {
  for (const [name, fn] of tests) {
    try {
      await fn();
      passed += 1;
      console.log(`  \x1b[32mPASS\x1b[0m ${name}`);
    } catch (error) {
      failed += 1;
      console.log(`  \x1b[31mFAIL\x1b[0m ${name}`);
      console.log(`       ${error instanceof Error ? error.message.split('\n')[0] : error}`);
    }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
