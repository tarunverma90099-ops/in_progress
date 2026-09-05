import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check role
    if (user.role !== role) {
      return NextResponse.json(
        { error: `This account is not registered as a ${role}` },
        { status: 403 }
      );
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured. Add it to .env.local.');
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, name: user.name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not configured')) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Database unavailable. Check MONGODB_URI and that MongoDB is running.' },
      { status: 503 }
    );
  }
}
