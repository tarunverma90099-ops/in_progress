import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models';
import { badRequest, conflict, emailFilter, ok, readJson, route } from '@/lib/http';

const ROLES = ['student', 'teacher', 'admin'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  rollNo?: string;
  department?: string;
  phone?: string;
}

export const POST = route('Registration', async (request: NextRequest) => {
  const body = await readJson<RegisterBody>(request);
  const email = String(body.email ?? '').trim().toLowerCase();
  const name = String(body.name ?? '').trim();
  const password = String(body.password ?? '');
  const role = String(body.role ?? '').trim();

  if (!email || !password || !name || !role) {
    throw badRequest('Email, password, name, and role are required');
  }
  if (!EMAIL_RE.test(email)) {
    throw badRequest('Enter a valid email address');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    throw badRequest(`Role must be one of: ${ROLES.join(', ')}`);
  }

  const rollNo = body.rollNo ? String(body.rollNo).trim() : undefined;
  if (role === 'student' && !rollNo) {
    throw badRequest('Roll number is required for students');
  }

  // Case-insensitive so 'A@b.c' cannot shadow an existing 'a@b.c' account.
  if (await User.exists({ email: emailFilter(email) })) {
    throw conflict('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    name,
    role,
    rollNo,
    department: body.department?.trim() || undefined,
    phone: body.phone?.trim() || undefined,
  });

  return ok(
    {
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        rollNo: newUser.rollNo,
      },
    },
    201
  );
});
