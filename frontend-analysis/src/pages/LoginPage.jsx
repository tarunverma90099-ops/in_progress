// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ScanLine,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";

// Per-role theming so the page adapts to the selected role
const ROLES = {
  student: {
    label: "Student",
    icon: GraduationCap,
    accent: "bg-orange-600 hover:bg-orange-700",
    ring: "focus:ring-orange-200 focus:border-orange-500",
    chip: "bg-orange-600 text-white border-orange-600",
    text: "text-orange-600",
    route: "/student",
  },
  teacher: {
    label: "Teacher",
    icon: Users,
    accent: "bg-emerald-600 hover:bg-emerald-700",
    ring: "focus:ring-emerald-200 focus:border-emerald-500",
    chip: "bg-emerald-600 text-white border-emerald-600",
    text: "text-emerald-600",
    route: "/teacher",
  },
  college: {
    label: "College",
    icon: Building2,
    accent: "bg-violet-600 hover:bg-violet-700",
    ring: "focus:ring-violet-200 focus:border-violet-500",
    chip: "bg-violet-600 text-white border-violet-600",
    text: "text-violet-600",
    route: "/college",
  },
};

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const theme = ROLES[role];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(ROLES[role].route);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left brand panel (hidden on small screens) */}
      <aside className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white">


        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <ScanLine className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Track Attend
          </span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-dark leading-tight text-balance">
            Smart attendance for modern campuses
          </h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            platform for students, teachers, and administrators.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3 text-slate-200">
              <ScanLine className="h-5 w-5 text-blue-400" />
              Secure QR-based check-ins
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <CalendarCheck className="h-5 w-5 text-emerald-400" />
              Real-time attendance tracking
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <ShieldCheck className="h-5 w-5 text-violet-400" />
              Role-based dashboards
            </li>
          </ul>
        </div>

        <p className="relative text-sm text-slate-400">
          &copy; 2026 Track Attend. All rights reserved.
        </p>
      </aside>

      {/* Right login panel */}
      <main className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ScanLine className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              Track Attend
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-slate-500">
            Sign in to your{" "}
            <span className={`font-medium ${theme.text}`}>{theme.label}</span>{" "}
            account
          </p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {Object.entries(ROLES).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const active = role === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                    active
                      ? cfg.chip
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="h-5 w-5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${theme.ring}`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${theme.ring}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                />
                Remember me
              </label>
              <button
                type="button"
                className={`font-medium ${theme.text} hover:underline`}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`w-full rounded-xl py-2.5 font-semibold text-white shadow-sm transition ${theme.accent}`}
            >
              Sign in as {theme.label}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <button className={`font-medium ${theme.text} hover:underline`}>
              Contact your administrator
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}