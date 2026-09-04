import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Student, Class, User } from '@/models';

// GET students for a class, or all enrollments of a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const userId = searchParams.get('userId');

    if (!classId && !userId) {
      return NextResponse.json(
        { error: 'Class ID or user ID is required' },
        { status: 400 }
      );
    }

    const query: Record<string, unknown> = classId ? { classId } : { userId };

    const students = await Student.find(query).sort({ rollNo: 1 });

    // Attach class info (name, teacher) so clients can show subject names
    const studentsWithClass = await Promise.all(
      students.map(async (student) => {
        const cls = await Class.findById(student.classId).select('name teacherId');
        return {
          ...student.toObject(),
          class: cls
            ? { _id: cls._id, name: cls.name, teacherId: cls.teacherId }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      students: studentsWithClass,
    });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new student to a class
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { classId, name, rollNo, email } = body;

    if (!classId || !name || !rollNo) {
      return NextResponse.json(
        { error: 'Class ID, name, and roll number are required' },
        { status: 400 }
      );
    }

    // Check if class exists
    const cls = await Class.findById(classId);
    if (!cls) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    const rollNoNumber = parseInt(String(rollNo), 10);
    if (Number.isNaN(rollNoNumber)) {
      return NextResponse.json(
        { error: 'Roll number must be a number' },
        { status: 400 }
      );
    }

    // Check if student with same roll number exists in this class
    const existingStudent = await Student.findOne({ classId, rollNo: rollNoNumber });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this roll number already exists in this class' },
        { status: 409 }
      );
    }

    // Link to an existing user account when one with this email exists
    let linkedUserId: string | null = null;
    if (email) {
      const linkedUser = await User.findOne({ email: email.toLowerCase() });
      if (linkedUser) linkedUserId = linkedUser._id as string;
    }

    const newStudent = await Student.create({
      userId: linkedUserId,
      classId,
      name,
      rollNo: rollNoNumber,
      email,
      attended: 0,
      total: 0,
    });

    // Update total students count in class
    await Class.findByIdAndUpdate(classId, {
      $inc: { totalStudents: 1 }
    });

    return NextResponse.json({
      success: true,
      student: newStudent,
    });
  } catch (error) {
    console.error('Add student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
