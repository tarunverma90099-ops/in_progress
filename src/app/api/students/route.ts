import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Student, Class } from '@/models';

// GET all students for a class
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const students = await Student.find({ classId }).sort({ rollNo: 1 });

    return NextResponse.json({
      success: true,
      students,
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

    // Check if student with same roll number exists in this class
    const existingStudent = await Student.findOne({ classId, rollNo });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this roll number already exists in this class' },
        { status: 409 }
      );
    }

    const newStudent = await Student.create({
      userId: cls.teacherId, // Temporary, should be linked to actual user
      classId,
      name,
      rollNo: parseInt(rollNo),
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
