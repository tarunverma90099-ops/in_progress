import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { LeaveRequest } from '@/models';

// GET all leave requests
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const teacherId = searchParams.get('teacherId');
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');

    let query: Record<string, unknown> = {};
    if (studentId) query.studentId = studentId;
    if (teacherId) query.teacherId = teacherId;
    if (classId) query.classId = classId;
    if (status && status !== 'All') query.status = status;

    const leaveRequests = await LeaveRequest.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      leaveRequests,
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new leave request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { studentId, studentName, rollNo, subject, date, reason, classId, teacherId } = body;

    if (!studentId || !studentName || !rollNo || !subject || !date || !reason || !classId || !teacherId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newLeaveRequest = await LeaveRequest.create({
      studentId,
      studentName,
      rollNo,
      subject,
      date,
      reason,
      classId,
      teacherId,
      status: 'Pending',
    });

    return NextResponse.json({
      success: true,
      leaveRequest: newLeaveRequest,
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
