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

    const records = await AttendanceRecord.find(query).sort({ date: 1 });

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
// Body: { classId, date, attendanceData: [{ studentId, status: 'Present' | 'Absent' | 'Leave' }] }
// Re-marking an existing (studentId, classId, date) record adjusts the aggregate
// stats by the difference between the old and new status instead of double counting.
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

    const cls = await Class.findById(classId);
    if (!cls) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    const subject = cls.name;
    const normalizedDate = new Date(date).toISOString().split('T')[0];

    const results = await Promise.all(
      attendanceData.map(async (record: { studentId: string; status: string }) => {
        const { studentId, status } = record;

        if (!['Present', 'Absent', 'Leave'].includes(status)) {
          throw new Error(`Invalid status "${status}" for student ${studentId}`);
        }

        const existing = await AttendanceRecord.findOne({ studentId, classId, date: normalizedDate });

        // Deltas so re-marking never double counts
        const wasPresent = existing?.status === 'Present' ? 1 : 0;
        const isPresent = status === 'Present' ? 1 : 0;
        const attendedDelta = isPresent - wasPresent;

        const attendanceRecord = await AttendanceRecord.findOneAndUpdate(
          { studentId, classId, date: normalizedDate },
          { status },
          { returnDocument: 'after', upsert: true }
        );

        // Only apply aggregate deltas the first time a record is created
        let updatedStudent: unknown = null;
        if (!existing) {
          await StudentAttendance.findOneAndUpdate(
            { studentId, subject },
            {
              $inc: {
                total: 1,
                ...(isPresent ? { attended: 1 } : {}),
              },
              $push: {
                history: { date: normalizedDate, status },
              },
            },
            { returnDocument: 'after', upsert: true }
          );

          updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { $inc: { attended: attendedDelta, total: 1 } },
            { returnDocument: 'after' }
          );
        } else if (attendedDelta !== 0) {
          // Record existed and status flipped — adjust aggregates
          await StudentAttendance.findOneAndUpdate(
            { studentId, subject },
            {
              $inc: { attended: attendedDelta },
              $set: { 'history.$[elem].status': status },
            },
            {
              returnDocument: 'after',
              arrayFilters: [{ 'elem.date': normalizedDate }],
            }
          );

          updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { $inc: { attended: attendedDelta } },
            { returnDocument: 'after' }
          );
        } else {
          updatedStudent = await Student.findById(studentId);
        }

        return { attendanceRecord, student: updatedStudent };
      })
    );

    // If the whole class was marked in one go, reflect it in the class session history
    const enrolledCount = await Student.countDocuments({ classId });
    if (attendanceData.length >= enrolledCount && enrolledCount > 0) {
      const presentCount = attendanceData.filter(
        (r: { status: string }) => r.status === 'Present'
      ).length;

      const cls2 = await Class.findById(classId);
      const existingEntry = cls2?.sessionHistory?.find((s: { date: string }) => s.date === normalizedDate);

      if (existingEntry) {
        await Class.updateOne(
          { classId, 'sessionHistory.date': normalizedDate },
          { $set: { 'sessionHistory.$.present': presentCount } }
        );
      } else {
        await Class.findByIdAndUpdate(classId, {
          $push: { sessionHistory: { date: normalizedDate, present: presentCount } },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      results,
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.startsWith('Invalid status') ? 400 : 500;
    return NextResponse.json(
      { error: status === 400 ? message : 'Internal server error' },
      { status }
    );
  }
}
