import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/models';
import { HttpError, badRequest, emailFilter, ok, readJson, route } from '@/lib/http';

// A real bcrypt hash of a value nobody can supply, used to keep the failure path
// as costly as the success path. Must be a syntactically valid hash.
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.5RxjkhCJJ3ZqFMhBsMz9d3sJZ0Aq';

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

  // Case-insensitive lookup: stored addresses are not guaranteed to be
  // normalised (see emailFilter), and an exact match would reject valid logins.
  const user = await User.findOne({ email: emailFilter(email) });

  // Always run a comparison so response timing does not leak account existence.
  // A stored hash can be missing or malformed on legacy rows, and bcrypt.compare
  // throws on a non-string second argument, so guard the type before comparing.
  const storedHash = typeof user?.password === 'string' ? user.password : '';
  const passwordMatches = storedHash
    ? await bcrypt.compare(password, storedHash)
    : await bcrypt.compare(password, DUMMY_HASH).then(() => false);

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
