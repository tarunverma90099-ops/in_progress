import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Student, Class, AttendanceRecord, StudentAttendance } from '@/models';

// GET attendance records
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');

    let query: Record<string, unknown> = {};
    if (studentId) query.studentId = studentId;
    if (classId) query.classId = classId;
    if (date) query.date = date;

    const records = await AttendanceRecord.find(query);

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Mark attendance
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { classId, date, attendanceData } = body;

    // attendanceData is an array of { studentId, status: 'Present' | 'Absent' | 'Leave' }

    if (!classId || !date || !attendanceData || !Array.isArray(attendanceData)) {
      return NextResponse.json(
        { error: 'Class ID, date, and attendance data are required' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      attendanceData.map(async (record: { studentId: string; status: string }) => {
        const { studentId, status } = record;

        // Update or create attendance record
        const attendanceRecord = await AttendanceRecord.findOneAndUpdate(
          { studentId, classId, date },
          { status },
          { new: true, upsert: true }
        );

        // Update student's total attendance stats
        const studentAttendance = await StudentAttendance.findOneAndUpdate(
          { studentId, subject: (await Class.findById(classId))?.name || '' },
          {
            $inc: {
              total: 1,
              ...(status === 'Present' ? { attended: 1 } : {})
            },
            $push: {
              history: { date, status }
            }
          },
          { new: true, upsert: true }
        );

        // Update student's attendance in the class
        if (status === 'Present') {
          await Student.findByIdAndUpdate(studentId, { $inc: { attended: 1, total: 1 } });
        } else {
          await Student.findByIdAndUpdate(studentId, { $inc: { total: 1 } });
        }

        return { attendanceRecord, studentAttendance };
      })
    );

    // Update class session history
    const presentCount = attendanceData.filter((r: { status: string }) => r.status === 'Present').length;
    await Class.findByIdAndUpdate(classId, {
      $push: {
        sessionHistory: { date, present: presentCount }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      results,
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
