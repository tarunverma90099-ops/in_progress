import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Session } from '@/models';

// GET all active sessions
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    let query: Record<string, unknown> = {};
    if (classId) query.classId = classId;
    if (teacherId) query.teacherId = teacherId;

    const sessions = await Session.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new session
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { classId, teacherId, duration } = body;

    if (!classId || !teacherId) {
      return NextResponse.json(
        { error: 'Class ID and teacher ID are required' },
        { status: 400 }
      );
    }

    const sessionDuration = duration || 10 * 60 * 1000; // Default 10 minutes

    const newSession = await Session.create({
      classId,
      teacherId,
      sessionExpiresAt: new Date(Date.now() + sessionDuration),
      isActive: true,
      scannedStudents: [],
    });

    return NextResponse.json({
      success: true,
      session: newSession,
    });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
