'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  Lock,
  User as UserIcon,
  Hash,
  Building2,
  Eye,
  EyeOff,
  ScanLine,
  CheckCircle2,
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    rollNo: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name';
    if (!form.email.trim()) return 'Please enter your email';
    if (!form.rollNo.trim()) return 'Please enter your roll number';
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'student',
        rollNo: form.rollNo.trim(),
        department: form.department.trim() || undefined,
      });

      // Sign the new student straight in so they can pick their courses.
      const result = await authAPI.login(form.email.trim(), form.password, 'student');
      login(result.token, result.user);
      router.push('/student?view=courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200';

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <ScanLine className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Track Attend</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">Create your student account</h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            Register once, then enroll in the courses you attend. Attendance can only be marked for
            courses you are enrolled in.
          </p>
          <ul className="mt-8 space-y-4 text-slate-200">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Pick your courses after signing up
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Scan the QR code in class to check in
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Track your percentage per subject
            </li>
          </ul>
        </div>

        <p className="text-sm text-slate-400">&copy; 2026 Track Attend. All rights reserved.</p>
      </aside>

      <main className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ScanLine className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-slate-900">Track Attend</span>
          </div>

          <div className="flex items-center gap-2 text-orange-600">
            <GraduationCap className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-wide">Student registration</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-slate-500">It only takes a minute.</p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input id="name" name="name" value={form.name} onChange={update} placeholder="Jane Doe" className={field} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input id="email" name="email" type="email" value={form.email} onChange={update} placeholder="you@college.edu" className={field} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rollNo" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Roll number
                </label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input id="rollNo" name="rollNo" value={form.rollNo} onChange={update} placeholder="101" className={field} />
                </div>
              </div>
              <div>
                <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input id="department" name="department" value={form.department} onChange={update} placeholder="CSE" className={field} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update}
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  className={`${field} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={update}
                  placeholder="Re-enter your password"
                  className={field}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-600 py-2.5 font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create student account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-orange-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
