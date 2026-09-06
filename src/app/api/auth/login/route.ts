import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/models';
import { HttpError, badRequest, ok, readJson, route } from '@/lib/http';

interface LoginBody {
  email?: string;
  password?: string;
  role?: string;
}

export const POST = route('Login', async (request: NextRequest) => {
  const body = await readJson<LoginBody>(request);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const role = String(body.role ?? '').trim();

  if (!email || !password || !role) {
    throw badRequest('Email, password, and role are required');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new HttpError(503, 'JWT_SECRET is not configured. Add it to .env.local.');
  }

  const user = await User.findOne({ email });

  // Always compare against a hash so timing does not leak account existence.
  const passwordMatches = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi');

  if (!user || !passwordMatches) {
    throw new HttpError(401, 'Invalid email or password');
  }

  if (user.role !== role) {
    throw new HttpError(403, `This account is not registered as a ${role}`);
  }

  const token = jwt.sign(
    { userId: String(user._id), email: user.email, role: user.role, name: user.name },
    jwtSecret,
    { expiresIn: '7d' }
  );

  return ok({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      rollNo: user.rollNo,
      profileImage: user.profileImage,
    },
  });
});
