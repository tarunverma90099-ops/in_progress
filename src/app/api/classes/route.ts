import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Class, Student } from '@/models';

// GET all classes for a teacher
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    let query: Record<string, unknown> = {};
    if (teacherId) {
      query.teacherId = teacherId;
    }

    const classes = await Class.find(query).sort({ createdAt: -1 });

    // Get students count for each class
    const classesWithStudents = await Promise.all(
      classes.map(async (cls) => {
        const students = await Student.find({ classId: cls._id });
        return {
          ...cls.toObject(),
          students,
        };
      })
    );

    return NextResponse.json({
      success: true,
      classes: classesWithStudents,
    });
  } catch (error) {
    console.error('Get classes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new class
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, teacherId, totalStudents } = body;

    if (!name || !teacherId) {
      return NextResponse.json(
        { error: 'Name and teacherId are required' },
        { status: 400 }
      );
    }

    // Check if class already exists for this teacher
    const existingClass = await Class.findOne({ name, teacherId });
    if (existingClass) {
      return NextResponse.json(
        { error: 'Class with this name already exists' },
        { status: 409 }
      );
    }

    const newClass = await Class.create({
      name,
      teacherId,
      totalStudents: totalStudents || 40,
      sessionHistory: [],
    });

    return NextResponse.json({
      success: true,
      class: newClass,
    });
  } catch (error) {
    console.error('Create class error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
