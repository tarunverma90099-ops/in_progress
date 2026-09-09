import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import {
  User,
  Faculty,
  Class,
  Student,
  LeaveRequest,
  AttendanceRecord,
  StudentAttendance,
  Session,
} from '@/models';

// Deterministic pseudo-random in [0, 1) so seeds are reproducible
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function toDateString(d: Date) {
  return d.toISOString().split('T')[0];
}

// Build the list of weekdays going back `days` days from today (today included)
function getWeekdayDates(days: number) {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    dates.push(toDateString(d));
  }
  return dates;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Faculty.deleteMany({}),
      Class.deleteMany({}),
      Student.deleteMany({}),
      LeaveRequest.deleteMany({}),
      AttendanceRecord.deleteMany({}),
      StudentAttendance.deleteMany({}),
      Session.deleteMany({}),
    ]);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create admin user
    await User.create({
      email: 'admin@college.edu',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    });

    // Create teacher users
    const teacher1 = await User.create({
      email: 'sweta.choubey@college.edu',
      password: hashedPassword,
      name: 'Dr. Sweta Choubey',
      role: 'teacher',
      department: 'Basic Science and Humanities',
    });

    const teacher2 = await User.create({
      email: 'prashant.sahu@college.edu',
      password: hashedPassword,
      name: 'Prof. Prashant Sahu',
      role: 'teacher',
      department: 'Environmental Chemistry',
    });

    const teacher3 = await User.create({
      email: 'shashi.kindo@college.edu',
      password: hashedPassword,
      name: 'Dr. Shashi Bala Kindo',
      role: 'teacher',
      department: 'Environmental Chemistry',
    });

    // Create faculty profiles
    await Faculty.create([
      {
        userId: teacher1._id,
        name: 'Dr. Sweta Choubey',
        email: 'sweta.choubey@college.edu',
        department: 'Basic Science and Humanities',
        status: 'active',
        photo: '/faculty-placeholder.svg',
        subjects: ['Digital Circuits', 'Embedded System'],
        attendance: '99%',
        lastAttendance: {
          subject: 'Digital Circuits',
          year: '1st Year',
          branch: 'ET&T',
          timestamp: toDateString(new Date()) + ' 10:30 AM',
        },
      },
      {
        userId: teacher2._id,
        name: 'Prof. Prashant Sahu',
        email: 'prashant.sahu@college.edu',
        department: 'Environmental Chemistry',
        status: 'leave',
        photo: '/faculty-placeholder.svg',
        subjects: ['Environmental Chemistry'],
        attendance: '78%',
        lastAttendance: {
          subject: 'Environmental Chemistry',
          year: '1st Year',
          branch: 'CSE DS',
          timestamp: toDateString(new Date()) + ' 02:45 PM',
        },
      },
      {
        userId: teacher3._id,
        name: 'Dr. Shashi Bala Kindo',
        email: 'shashi.kindo@college.edu',
        department: 'Environmental Chemistry',
        status: 'active',
        photo: '/faculty-placeholder.svg',
        subjects: ['Linear Algebra', 'Probability & Statistics'],
        attendance: '88%',
        lastAttendance: {
          subject: 'Case Study',
          year: '1st Year',
          branch: 'CSE',
          timestamp: toDateString(new Date()) + ' 11:15 AM',
        },
      },
    ]);

    // Create student users
    const students = await User.create([
      { email: 'nitish@student.edu', password: hashedPassword, name: 'Nitish', role: 'student', rollNo: '101' },
      { email: 'tilak@student.edu', password: hashedPassword, name: 'Tilak', role: 'student', rollNo: '102' },
      { email: 'mukesh@student.edu', password: hashedPassword, name: 'Mukesh', role: 'student', rollNo: '103' },
      { email: 'prakhar@student.edu', password: hashedPassword, name: 'Prakhar', role: 'student', rollNo: '104' },
      { email: 'anitesh@student.edu', password: hashedPassword, name: 'Anitesh', role: 'student', rollNo: '105' },
      { email: 'tarun@student.edu', password: hashedPassword, name: 'Tarun', role: 'student', rollNo: '201' },
      { email: 'khilesh@student.edu', password: hashedPassword, name: 'Khilesh', role: 'student', rollNo: '202' },
    ]);

    // Create classes
    const class1 = await Class.create({
      name: 'Digital Circuits',
      teacherId: teacher1._id,
      capacity: 60,
      enrollmentOpen: true,
      totalStudents: 0,
      sessionHistory: [],
    });

    const class2 = await Class.create({
      name: 'Embedded System',
      teacherId: teacher1._id,
      capacity: 60,
      enrollmentOpen: true,
      totalStudents: 0,
      sessionHistory: [],
    });

    // Enroll students in classes
    const enrollments = await Student.create([
      { userId: students[0]._id, classId: class1._id, name: 'Nitish', rollNo: 101, email: 'nitish@student.edu', attended: 0, total: 0 },
      { userId: students[1]._id, classId: class1._id, name: 'Tilak', rollNo: 102, email: 'tilak@student.edu', attended: 0, total: 0 },
      { userId: students[2]._id, classId: class1._id, name: 'Mukesh', rollNo: 103, email: 'mukesh@student.edu', attended: 0, total: 0 },
      { userId: students[3]._id, classId: class1._id, name: 'Prakhar', rollNo: 104, email: 'prakhar@student.edu', attended: 0, total: 0 },
      { userId: students[4]._id, classId: class1._id, name: 'Anitesh', rollNo: 105, email: 'anitesh@student.edu', attended: 0, total: 0 },
      { userId: students[5]._id, classId: class2._id, name: 'Tarun', rollNo: 201, email: 'tarun@student.edu', attended: 0, total: 0 },
      { userId: students[1]._id, classId: class2._id, name: 'Tilak', rollNo: 202, email: 'tilak@student.edu', attended: 0, total: 0 },
      { userId: students[0]._id, classId: class2._id, name: 'Nitish', rollNo: 203, email: 'nitish@student.edu', attended: 0, total: 0 },
      { userId: students[2]._id, classId: class2._id, name: 'Mukesh', rollNo: 204, email: 'mukesh@student.edu', attended: 0, total: 0 },
      { userId: students[6]._id, classId: class2._id, name: 'Khilesh', rollNo: 205, email: 'khilesh@student.edu', attended: 0, total: 0 },
    ]);

    await Class.findByIdAndUpdate(class1._id, { totalStudents: 5 });
    await Class.findByIdAndUpdate(class2._id, { totalStudents: 5 });

    // ---------------- Generate attendance history ----------------
    // ~6 weeks of weekday classes with a deterministic attendance pattern.
    const dates = getWeekdayDates(42);

    const class1Roster = enrollments.filter((s: { classId: { toString(): string } }) => String(s.classId) === String(class1._id));
    const class2Roster = enrollments.filter((s: { classId: { toString(): string } }) => String(s.classId) === String(class2._id));

    const historyFor = (rollNo: number, dateIndex: number, classSalt: number) => {
      const r = seededRandom(rollNo * 31 + dateIndex * 17 + classSalt);
      if (r < 0.04) return 'Leave';
      if (r < 0.18) return 'Absent';
      return 'Present';
    };

    const sessionHistory1: { date: string; present: number }[] = [];
    const sessionHistory2: { date: string; present: number }[] = [];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];

      const records1 = class1Roster.map((s: { _id: string; rollNo: number }) => ({
        studentId: s._id,
        classId: class1._id,
        date,
        status: historyFor(s.rollNo, i, 7) as 'Present' | 'Absent' | 'Leave',
      }));
      const records2 = class2Roster.map((s: { _id: string; rollNo: number }) => ({
        studentId: s._id,
        classId: class2._id,
        date,
        status: historyFor(s.rollNo, i, 13) as 'Present' | 'Absent' | 'Leave',
      }));

      await AttendanceRecord.insertMany([...records1, ...records2]);

      sessionHistory1.push({
        date,
        present: records1.filter((r: { status: string }) => r.status === 'Present').length,
      });
      sessionHistory2.push({
        date,
        present: records2.filter((r: { status: string }) => r.status === 'Present').length,
      });
    }

    await Class.findByIdAndUpdate(class1._id, { sessionHistory: sessionHistory1 });
    await Class.findByIdAndUpdate(class2._id, { sessionHistory: sessionHistory2 });

    // Sync aggregate counters (Student docs + StudentAttendance) with the records
    for (const student of enrollments) {
      const records = await AttendanceRecord.find({ studentId: student._id });
      const attended = records.filter((r: { status: string }) => r.status === 'Present').length;
      const total = records.length;

      await Student.findByIdAndUpdate(student._id, { attended, total });

      const cls = String(student.classId) === String(class1._id) ? class1 : class2;
      const history = records
        .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))
        .map((r) => ({ date: r.date, status: r.status }));

      await StudentAttendance.create({
        studentId: student._id,
        subject: cls.name,
        attended,
        total,
        history,
      });
    }

    // ---------------- Leave requests ----------------
    const today = toDateString(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);

    await LeaveRequest.create([
      {
        studentId: students[3]._id,
        studentName: 'Prakhar',
        rollNo: 104,
        subject: 'Digital Circuits',
        date: toDateString(tomorrow),
        reason: 'Medical check-up',
        status: 'Pending',
        classId: class1._id,
        teacherId: teacher1._id,
      },
      {
        studentId: students[5]._id,
        studentName: 'Tarun',
        rollNo: 201,
        subject: 'Embedded System',
        date: toDateString(tomorrow),
        reason: 'Family function',
        status: 'Pending',
        classId: class2._id,
        teacherId: teacher1._id,
      },
      {
        studentId: students[1]._id,
        studentName: 'Tilak',
        rollNo: 202,
        subject: 'Embedded System',
        date: today,
        reason: 'Personal work',
        status: 'Approved',
        classId: class2._id,
        teacherId: teacher1._id,
      },
      {
        studentId: students[6]._id,
        studentName: 'Khilesh',
        rollNo: 205,
        subject: 'Embedded System',
        date: toDateString(yesterday),
        reason: 'Not feeling well',
        status: 'Rejected',
        classId: class2._id,
        teacherId: teacher1._id,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        admin: { email: 'admin@college.edu', password: 'password123' },
        teachers: [
          { email: 'sweta.choubey@college.edu', password: 'password123' },
          { email: 'prashant.sahu@college.edu', password: 'password123' },
          { email: 'shashi.kindo@college.edu', password: 'password123' },
        ],
        students: [
          { email: 'nitish@student.edu', password: 'password123' },
          { email: 'tarun@student.edu', password: 'password123' },
        ],
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
