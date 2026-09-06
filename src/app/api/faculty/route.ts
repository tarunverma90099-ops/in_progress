import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { Faculty, User } from '@/models';
import { badRequest, conflict, ok, readJson, route } from '@/lib/http';

const DEFAULT_PHOTO = '/faculty-placeholder.svg';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escape user input before using it inside a regular expression. */
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** GET /api/faculty?search=&filterBy=name|department */
export const GET = route('Get faculty', async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const search = params.get('search')?.trim();
  const filterBy = params.get('filterBy') === 'department' ? 'department' : 'name';

  const query = search ? { [filterBy]: { $regex: escapeRegex(search), $options: 'i' } } : {};
  const faculty = await Faculty.find(query).sort({ createdAt: -1 }).lean();

  return ok({ faculty });
});

/** POST /api/faculty — create a faculty profile and its teacher login. */
export const POST = route('Add faculty', async (request: NextRequest) => {
  const body = await readJson<{
    name?: string;
    email?: string;
    department?: string;
    status?: string;
    photo?: string;
  }>(request);

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const department = String(body.department ?? '').trim();

  if (!name || !email || !department) {
    throw badRequest('Name, email, and department are required');
  }
  if (!EMAIL_RE.test(email)) throw badRequest('Enter a valid email address');

  if (await Faculty.exists({ email })) {
    throw conflict('Faculty with this email already exists');
  }

  let user = await User.findOne({ email });
  if (!user) {
    // Temporary password; the teacher is expected to change it after first login.
    const tempPassword = process.env.DEFAULT_FACULTY_PASSWORD ?? 'faculty123';
    user = await User.create({
      email,
      password: await bcrypt.hash(tempPassword, 10),
      name,
      role: 'teacher',
      department,
    });
  }

  const faculty = await Faculty.create({
    userId: user._id,
    name,
    email,
    department,
    status: body.status === 'leave' ? 'leave' : 'active',
    photo: body.photo?.trim() || DEFAULT_PHOTO,
    subjects: [],
  });

  return ok({ faculty }, 201);
});
