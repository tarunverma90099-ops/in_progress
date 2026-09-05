import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, password, name, role, rollNo, department, phone } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      rollNo,
      department,
      phone,
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
