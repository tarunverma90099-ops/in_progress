import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { User, Faculty, Class, Student, LeaveRequest } from '@/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Faculty.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await LeaveRequest.deleteMany({});

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create admin user
    const admin = await User.create({
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
        photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0mpEAFXv-iIa50q5rA2L6nnHGy_akXDFyQQ&s',
        subjects: ['Environmental Chemistry'],
        attendance: '99%',
        lastAttendance: {
          subject: 'Environmental Chemistry',
          year: '1st Year',
          branch: 'ET&T',
          timestamp: '2026-09-10 10:30 AM',
        },
      },
      {
        userId: teacher2._id,
        name: 'Prof. Prashant Sahu',
        email: 'prashant.sahu@college.edu',
        department: 'Environmental Chemistry',
        status: 'leave',
        photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0mpEAFXv-iIa50q5rA2L6nnHGy_akXDFyQQ&s',
        subjects: ['Environmental Chemistry'],
        attendance: '78%',
        lastAttendance: {
          subject: 'Environmental Chemistry',
          year: '1st Year',
          branch: 'CSE DS',
          timestamp: '2026-09-10 02:45 PM',
        },
      },
      {
        userId: teacher3._id,
        name: 'Dr. Shashi Bala Kindo',
        email: 'shashi.kindo@college.edu',
        department: 'Environmental Chemistry',
        status: 'active',
        photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0mpEAFXv-iIa50q5rA2L6nnHGy_akXDFyQQ&s',
        subjects: ['Linear Algebra', 'Probability & Statistics'],
        attendance: '88%',
        lastAttendance: {
          subject: 'Case Study',
          year: '1st Year',
          branch: 'CSE',
          timestamp: '2025-09-22 11:15 AM',
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
      totalStudents: 40,
      sessionHistory: [
        { date: '2025-09-20', present: 35 },
        { date: '2025-09-22', present: 38 },
        { date: '2025-09-23', present: 32 },
        { date: '2025-09-24', present: 36 },
        { date: '2025-09-25', present: 37 },
      ],
    });

    const class2 = await Class.create({
      name: 'Embedded System',
      teacherId: teacher1._id,
      totalStudents: 35,
      sessionHistory: [
        { date: '2025-09-20', present: 30 },
        { date: '2025-09-22', present: 33 },
        { date: '2025-09-23', present: 28 },
        { date: '2025-09-24', present: 31 },
        { date: '2025-09-25', present: 34 },
      ],
    });

    // Create students in classes
    await Student.create([
      { userId: students[0]._id, classId: class1._id, name: 'Nitish', rollNo: 101, email: 'nitish@student.edu', attended: 18, total: 20 },
      { userId: students[1]._id, classId: class1._id, name: 'Tilak', rollNo: 102, email: 'tilak@student.edu', attended: 14, total: 20 },
      { userId: students[2]._id, classId: class1._id, name: 'Mukesh', rollNo: 103, email: 'mukesh@student.edu', attended: 20, total: 20 },
      { userId: students[3]._id, classId: class1._id, name: 'Prakhar', rollNo: 104, email: 'prakhar@student.edu', attended: 9, total: 20 },
      { userId: students[4]._id, classId: class1._id, name: 'Anitesh', rollNo: 105, email: 'anitesh@student.edu', attended: 16, total: 20 },
      { userId: students[5]._id, classId: class2._id, name: 'Tarun', rollNo: 201, email: 'tarun@student.edu', attended: 15, total: 20 },
      { userId: students[1]._id, classId: class2._id, name: 'Tilak', rollNo: 202, email: 'tilak@student.edu', attended: 19, total: 20 },
      { userId: students[0]._id, classId: class2._id, name: 'Nitish', rollNo: 203, email: 'nitish@student.edu', attended: 14, total: 20 },
      { userId: students[2]._id, classId: class2._id, name: 'Mukesh', rollNo: 204, email: 'mukesh@student.edu', attended: 17, total: 20 },
      { userId: students[4]._id, classId: class2._id, name: 'Anitesh', rollNo: 205, email: 'anitesh@student.edu', attended: 18, total: 20 },
    ]);

    // Create leave requests
    await LeaveRequest.create([
      {
        studentId: students[3]._id,
        studentName: 'Prakhar',
        rollNo: 104,
        subject: 'BEE',
        date: '2025-09-29',
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
        date: '2025-09-26',
        reason: 'Family function',
        status: 'Pending',
        classId: class2._id,
        teacherId: teacher1._id,
      },
      {
        studentId: students[1]._id,
        studentName: 'Tilak',
        rollNo: 204,
        subject: 'Embedded System',
        date: '2025-09-23',
        reason: 'Personal work',
        status: 'Approved',
        classId: class2._id,
        teacherId: teacher1._id,
      },
      {
        studentId: students[6]._id,
        studentName: 'Khilesh',
        rollNo: 201,
        subject: 'Embedded System',
        date: '2025-09-22',
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
