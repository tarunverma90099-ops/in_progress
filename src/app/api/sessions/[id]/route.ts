import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { Session, Class, Student, AttendanceRecord, StudentAttendance } from '@/models';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// GET single session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const session = await Session.findById(id);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Auto-expire if past the end time
    if (session.isActive && session.sessionExpiresAt < new Date()) {
      session.isActive = false;
      await session.save();
    }

    // Resolve scanned student details for live display
    const scanned = await Student.find({ userId: { $in: session.scannedStudents } })
      .select('name rollNo userId');

    return NextResponse.json({
      success: true,
      session: {
        ...session.toObject(),
        scannedStudentDetails: scanned,
      },
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update session
// Body { studentId } -> mark this student present (QR check-in)
// Body { action: 'end' } -> finalize: scanned students Present, everyone else Absent
// Any other body -> generic update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // ---- QR check-in ----
    if (body.studentId && body.action !== 'end') {
      if (!session.isActive) {
        return NextResponse.json(
          { error: 'This session has ended' },
          { status: 410 }
        );
      }
      if (session.sessionExpiresAt < new Date()) {
        session.isActive = false;
        await session.save();
        return NextResponse.json(
          { error: 'This session has expired' },
          { status: 410 }
        );
      }

      const studentUserId = body.studentId;

      // The scanning user must be enrolled in the session's class
      const student = await Student.findOne({
        userId: studentUserId,
        classId: session.classId,
      });

      if (!student) {
        return NextResponse.json(
          { error: 'You are not enrolled in this class' },
          { status: 403 }
        );
      }

      if (session.scannedStudents.some((s: mongoose.Types.ObjectId) => s.toString() === String(studentUserId))) {
        return NextResponse.json(
          { success: true, message: 'Attendance already marked', alreadyMarked: true, session },
        );
      }

      session.scannedStudents.push(studentUserId);
      await session.save();

      // Mark attendance immediately
      const date = todayStr();
      const existing = await AttendanceRecord.findOne({
        studentId: student._id,
        classId: session.classId,
        date,
      });

      if (!existing) {
        await AttendanceRecord.create({
          studentId: student._id,
          classId: session.classId,
          date,
          status: 'Present',
        });

        const cls = await Class.findById(session.classId);
        await StudentAttendance.findOneAndUpdate(
          { studentId: student._id, subject: cls?.name || '' },
          {
            $inc: { total: 1, attended: 1 },
            $push: { history: { date, status: 'Present' } },
          },
          { returnDocument: 'after', upsert: true }
        );

        await Student.findByIdAndUpdate(student._id, {
          $inc: { attended: 1, total: 1 },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Attendance marked successfully',
        session,
        student: { _id: student._id, name: student.name, rollNo: student.rollNo },
      });
    }

    // ---- End session & finalize attendance ----
    if (body.action === 'end') {
      const cls = await Class.findById(session.classId);
      if (!cls) {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        );
      }

      const roster = await Student.find({ classId: session.classId });
      const date = todayStr();
      const scannedSet = new Set(session.scannedStudents.map((s: mongoose.Types.ObjectId) => s.toString()));

      let presentCount = 0;

      for (const student of roster) {
        const wasScanned = scannedSet.has(String(student.userId));
        const existing = await AttendanceRecord.findOne({
          studentId: student._id,
          classId: session.classId,
          date,
        });

        const status: 'Present' | 'Absent' = wasScanned ? 'Present' : 'Absent';
        if (wasScanned) presentCount += 1;

        if (!existing) {
          await AttendanceRecord.create({
            studentId: student._id,
            classId: session.classId,
            date,
            status,
          });

          await StudentAttendance.findOneAndUpdate(
            { studentId: student._id, subject: cls.name },
            {
              $inc: { total: 1, ...(status === 'Present' ? { attended: 1 } : {}) },
              $push: { history: { date, status } },
            },
            { returnDocument: 'after', upsert: true }
          );

          await Student.findByIdAndUpdate(student._id, {
            $inc: {
              total: 1,
              ...(status === 'Present' ? { attended: 1 } : {}),
            },
          });
        } else if (existing.status !== status) {
          // Adjust aggregates if a prior record (e.g. manual entry) conflicts
          const delta = status === 'Present' ? 1 : -1;
          await AttendanceRecord.updateOne({ _id: existing._id }, { status });
          await StudentAttendance.findOneAndUpdate(
            { studentId: student._id, subject: cls.name },
            {
              $inc: { attended: delta },
              $set: { 'history.$[elem].status': status },
            },
            { returnDocument: 'after', arrayFilters: [{ 'elem.date': date }] }
          );
          await Student.findByIdAndUpdate(student._id, { $inc: { attended: delta } });
        }
      }

      // Update class session history
      const existingEntry = cls.sessionHistory?.find((s: { date: string }) => s.date === date);
      if (existingEntry) {
        await Class.updateOne(
          { _id: cls._id, 'sessionHistory.date': date },
          { $set: { 'sessionHistory.$.present': presentCount } }
        );
      } else {
        await Class.findByIdAndUpdate(cls._id, {
          $push: { sessionHistory: { date, present: presentCount } },
        });
      }

      session.isActive = false;
      await session.save();

      return NextResponse.json({
        success: true,
        message: 'Session ended and attendance finalized',
        presentCount,
        totalStudents: roster.length,
        session,
      });
    }

    // ---- Generic update ----
    const updatedSession = await Session.findByIdAndUpdate(
      id,
      { $set: body },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - End (remove) session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const deletedSession = await Session.findByIdAndDelete(id);

    if (!deletedSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session ended successfully',
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
