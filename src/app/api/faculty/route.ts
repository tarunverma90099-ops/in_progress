import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { Faculty, User } from '@/models';

// GET all faculty members
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const filterBy = searchParams.get('filterBy') || 'name';

    let query: Record<string, unknown> = {};
    
    if (search) {
      if (filterBy === 'name') {
        query.name = { $regex: search, $options: 'i' };
      } else if (filterBy === 'department') {
        query.department = { $regex: search, $options: 'i' };
      }
    }

    const faculty = await Faculty.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      faculty,
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new faculty
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, email, department, status, photo } = body;

    if (!name || !email || !department) {
      return NextResponse.json(
        { error: 'Name, email, and department are required' },
        { status: 400 }
      );
    }

    // Check for duplicate email at the faculty level
    const existingFaculty = await Faculty.findOne({ email: email.toLowerCase() });
    if (existingFaculty) {
      return NextResponse.json(
        { error: 'Faculty with this email already exists' },
        { status: 409 }
      );
    }

    // Create (or reuse) a user account for the faculty
    const defaultPassword = 'faculty123'; // Default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: 'teacher',
        department,
      });
    }

    // Create faculty profile
    const newFaculty = await Faculty.create({
      userId: user._id,
      name,
      email: email.toLowerCase(),
      department,
      status: status || 'active',
      photo: photo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0mpEAFXv-iIa50q5rA2L6nnHGy_akXDFyQQ&s',
      subjects: [],
      attendance: '100%',
    });

    return NextResponse.json({
      success: true,
      faculty: newFaculty,
    });
  } catch (error) {
    console.error('Add faculty error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
