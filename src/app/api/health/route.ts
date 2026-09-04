import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    return Response.json({
      ok: true,
      database: 'mongodb',
      readyState: mongoose.connection.readyState,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return Response.json({ ok: false, error: 'Database not reachable' }, { status: 500 });
  }
}
