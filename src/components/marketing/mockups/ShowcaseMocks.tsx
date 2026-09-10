import {
  CalendarCheck,
  Check,
  CircleCheck,
  Clock,
  Download,
  FileSpreadsheet,
  ScanLine,
  Send,
  ShieldCheck,
  Timer,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { QrGlyph } from "./QrGlyph";

/* ============================================================================
   Product-tour panels. Each one is a stylised screenshot of the real
   workflow (capture → analyse → act → report).
   ============================================================================ */

function MockFrame({
  title,
  meta,
  children,
  action,
  alt,
}: {
  title: string;
  meta: string;
  children: ReactNode;
  action?: ReactNode;
  /** Describes the whole panel to assistive tech. */
  alt: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="overflow-hidden rounded-3xl border border-slate-900/[0.08] bg-white shadow-lift"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-900/[0.06] bg-[linear-gradient(180deg,rgb(255_255_255),rgb(248_250_255))] px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900/10" />
        </div>
        <div>
          <p className="text-[0.72rem] font-semibold text-slate-800">{title}</p>
          <p className="text-[0.6rem] text-slate-500">{meta}</p>
        </div>
        {action ? <div className="ml-auto flex items-center gap-2">{action}</div> : null}
      </div>
      <div className="bg-[linear-gradient(180deg,rgb(251_252_255),rgb(255_255_255))] p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
}

const FEED = [
  { name: "Nitish R.", roll: "101", time: "09:02:11" },
  { name: "Tilak S.", roll: "102", time: "09:02:34" },
  { name: "Prakhar M.", roll: "104", time: "09:03:02" },
  { name: "Anitesh K.", roll: "105", time: "09:03:48" },
  { name: "Mukesh B.", roll: "103", time: "09:04:16" },
];

export function CapturePanel() {
  return (
    <MockFrame
      title="Live session — Digital Circuits"
      alt="The live session screen for Digital Circuits: the rotating QR code and session code DC-4F19 on the left, and on the right a 42 of 48 check-in counter with the roster filling in arrival times."
      meta="Studio A · 09:00–09:50 · faculty view"
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[0.6rem] font-semibold text-rose-600 ring-1 ring-inset ring-rose-100">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 motion-safe:animate-pulse-ring" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
          </span>
          Live · 09:12 remaining
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-4">
          <div className="flex items-center gap-2">
            <ScanLine className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            <p className="text-[0.68rem] font-semibold text-slate-700">
              Project this code
            </p>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-900/[0.05] px-2 py-0.5 font-mono text-[0.6rem] text-slate-500">
              <Timer className="h-3 w-3" aria-hidden="true" />
              4s
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="relative h-[8.5rem] w-[8.5rem] shrink-0 overflow-hidden rounded-2xl p-2 ring-1 ring-slate-900/10">
              <QrGlyph seed="store-panel" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-9 bg-[linear-gradient(180deg,transparent,rgb(79_70_229_/_0.5),transparent)] animate-scanline"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.12em] text-slate-500">
                Session code
              </p>
              <p className="mt-1 font-mono text-lg font-semibold tracking-[0.18em] text-slate-900">
                DC-4F19
              </p>
              <p className="mt-2 text-[0.62rem] leading-relaxed text-slate-500">
                Students scan or type this code. The QR rotates every 7 seconds, so
                a shared screenshot expires before it reaches the back bench.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.58rem] font-semibold text-emerald-700">
              Campus network locked
            </span>
            <span className="rounded-full bg-slate-900/[0.05] px-2 py-0.5 text-[0.58rem] font-semibold text-slate-500">
              Offline queue · 0 pending
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-4">
          <div className="flex items-baseline gap-2">
            <p className="text-[1.2rem] font-semibold tracking-[-0.02em] text-slate-900">
              42
              <span className="text-slate-300">/48</span>
            </p>
            <p className="text-[0.62rem] font-medium text-slate-500">
              checked in · 87.5%
            </p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/[0.07]">
            <div className="h-full w-[87.5%] rounded-full bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500))]" />
          </div>

          <ul className="mt-3 space-y-1.5">
            {FEED.map((entry) => (
              <li
                key={entry.roll}
                className="flex items-center gap-2 rounded-lg bg-slate-900/[0.03] px-2.5 py-1.5"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-2.5 w-2.5" aria-hidden="true" />
                </span>
                <span className="text-[0.63rem] font-medium text-slate-600">
                  {entry.name}
                </span>
                <span className="text-[0.55rem] text-slate-500">#{entry.roll}</span>
                <span className="ml-auto font-mono text-[0.56rem] text-slate-500">
                  {entry.time}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 text-[0.58rem] text-slate-500">
            +37 more check-ins · late entries can be marked manually with a reason
          </p>
        </div>
      </div>
    </MockFrame>
  );
}

const TREND_THIS = [72, 78, 74, 82, 80, 86, 84, 90, 88, 92, 91, 94];
const TREND_LAST = [66, 70, 68, 73, 71, 76, 74, 78, 77, 80, 79, 82];

const SUBJECT_ROWS = [
  { subject: "Digital Circuits", faculty: "Dr. S. Choubey", pct: 93, delta: "+2.1" },
  { subject: "Embedded System", faculty: "Dr. S. Choubey", pct: 88, delta: "+0.8" },
  { subject: "Linear Algebra", faculty: "Dr. S. B. Kindo", pct: 82, delta: "−1.4" },
  { subject: "Environmental Chemistry", faculty: "Prof. P. Sahu", pct: 76, delta: "+0.3" },
];

const HEATMAP = [
  [0.9, 0.8, 0.95, 0.72, 0.86, 0.64, 0.5],
  [0.82, 0.74, 0.88, 0.68, 0.9, 0.7, 0.46],
  [0.7, 0.66, 0.8, 0.6, 0.78, 0.58, 0.38],
  [0.6, 0.55, 0.72, 0.5, 0.66, 0.48, 0.3],
];

function linePath(values: number[], width: number, height: number) {
  const max = 100;
  const min = 55;
  const stepX = width / (values.length - 1);
  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / (max - min)) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function AnalysePanel() {
  return (
    <MockFrame
      title="Semester analytics"
      alt="The semester analytics screen: a 12-week attendance trend comparing this semester against last, subject rows with percentages and deltas, and a day-by-period heatmap showing where students drop off."
      meta="ET&T · 1st year · 12 teaching weeks"
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.6rem] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
          <TrendingUp className="h-3 w-3" aria-hidden="true" />
          +4.6% vs last month
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-4">
          <div className="flex items-center gap-3">
            <p className="text-[0.68rem] font-semibold text-slate-700">
              Attendance trend
            </p>
            <div className="ml-auto flex items-center gap-3 text-[0.58rem] font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-3 rounded-full bg-brand-500" aria-hidden="true" />
                This semester
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-3 rounded-full bg-slate-300" aria-hidden="true" />
                Last semester
              </span>
            </div>
          </div>

          <svg
            viewBox="0 0 340 130"
            preserveAspectRatio="none"
            className="mt-3 h-36 w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="analyseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                x2="340"
                y1={130 * ratio}
                y2={130 * ratio}
                stroke="#0f172a"
                strokeOpacity="0.06"
                strokeDasharray="4 6"
              />
            ))}
            <path
              d={`${linePath(TREND_THIS, 340, 130)} L340,130 L0,130 Z`}
              fill="url(#analyseFill)"
            />
            <path
              d={linePath(TREND_LAST, 340, 130)}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="5 5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={linePath(TREND_THIS, 340, 130)}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="mt-2 flex justify-between text-[0.55rem] font-medium text-slate-500">
            {["Wk 1", "Wk 3", "Wk 5", "Wk 7", "Wk 9", "Wk 12"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="mt-4 space-y-2.5">
            {SUBJECT_ROWS.map((row) => (
              <div key={row.subject} className="flex items-center gap-3">
                <span className="w-[8.5rem] shrink-0 truncate text-[0.64rem] font-medium text-slate-700">
                  {row.subject}
                </span>
                <span className="hidden w-[8rem] shrink-0 truncate text-[0.58rem] text-slate-500 sm:block">
                  {row.faculty}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-900/[0.07]">
                  <span
                    className={cn(
                      "block h-full rounded-full",
                      row.pct >= 85
                        ? "bg-emerald-500"
                        : row.pct >= 80
                          ? "bg-brand-500"
                          : "bg-amber-500",
                    )}
                    style={{ width: `${row.pct}%` }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right text-[0.62rem] font-semibold text-slate-800 tabular-nums">
                  {row.pct}%
                </span>
                <span
                  className={cn(
                    "w-10 shrink-0 text-right text-[0.58rem] font-semibold tabular-nums",
                    row.delta.startsWith("+") ? "text-emerald-600" : "text-rose-500",
                  )}
                >
                  {row.delta}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-4">
            <p className="text-[0.68rem] font-semibold text-slate-700">
              Where students drop off
            </p>
            <p className="mt-0.5 text-[0.58rem] text-slate-500">
              Attendance by day and period · week 12
            </p>
            <div className="mt-3 space-y-1.5">
              {HEATMAP.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1.5">
                  {row.map((value, colIndex) => (
                    <span
                      key={colIndex}
                      className="h-5 flex-1 rounded-md"
                      style={{
                        backgroundColor: `rgb(79 70 229 / ${0.12 + value * 0.62})`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[0.52rem] font-medium uppercase tracking-[0.1em] text-slate-500">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
              <p className="text-[0.66rem] font-semibold text-slate-700">
                Friday 4th period loses the most students
              </p>
            </div>
            <p className="mt-1.5 text-[0.6rem] leading-relaxed text-slate-500">
              14% below the weekly average across 9 sessions. Suggested action:
              move the tutorial to Tuesday morning.
            </p>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

const REQUESTS = [
  {
    initials: "TV",
    name: "Tarun Verma",
    course: "Embedded System · Roll 201",
    reason: "Medical — hospital certificate attached",
    date: "12 Sep",
    tone: "brand" as const,
  },
  {
    initials: "KB",
    name: "Khilesh Bhoi",
    course: "Embedded System · Roll 205",
    reason: "Family function",
    date: "11 Sep",
    tone: "accent" as const,
  },
  {
    initials: "NR",
    name: "Nitish Rane",
    course: "Digital Circuits · Roll 101",
    reason: "Condonation appeal — 8% short",
    date: "09 Sep",
    tone: "violet" as const,
  },
];

export function ActPanel() {
  return (
    <MockFrame
      title="Triage inbox"
      alt="The triage inbox: three pending student requests with approve and reject actions, an escalation ladder from student nudge to HoD review, and a preview of the Monday mentor digest."
      meta="4 items need you · sorted by urgency"
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[0.6rem] font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
          <Clock className="h-3 w-3" aria-hidden="true" />
          Mentor digest in 2 days
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ul className="space-y-2.5">
          {REQUESTS.map((request, index) => (
            <li
              key={request.name}
              className={cn(
                "rounded-2xl border border-slate-900/[0.06] bg-white p-3.5",
                index === 2 && "ring-1 ring-brand-200",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.6rem] font-semibold text-white",
                    request.tone === "brand"
                      ? "bg-brand-600"
                      : request.tone === "accent"
                        ? "bg-accent-700"
                        : "bg-violet-600",
                  )}
                  aria-hidden="true"
                >
                  {request.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[0.7rem] font-semibold text-slate-800">
                      {request.name}
                    </p>
                    <span className="ml-auto shrink-0 text-[0.58rem] text-slate-500">
                      {request.date}
                    </span>
                  </div>
                  <p className="text-[0.58rem] text-slate-500">{request.course}</p>
                  <p className="mt-1.5 text-[0.62rem] text-slate-600">
                    {request.reason}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[0.6rem] font-semibold text-white">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  Approve leave
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/[0.05] px-2.5 py-1.5 text-[0.6rem] font-semibold text-slate-600">
                  <X className="h-3 w-3" aria-hidden="true" />
                  Reject
                </span>
                <span className="ml-auto text-[0.55rem] text-slate-500">
                  Attendance record updated instantly
                </span>
              </div>
            </li>
          ))}
          <li className="flex items-center gap-2 rounded-2xl bg-emerald-50/70 px-3.5 py-2.5 ring-1 ring-inset ring-emerald-100">
            <CircleCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <p className="text-[0.62rem] font-medium text-emerald-800">
              Approved 6 requests today · 14 shortage follow-ups auto-created
            </p>
          </li>
        </ul>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-4">
            <p className="text-[0.68rem] font-semibold text-slate-700">
              Escalation ladder
            </p>
            <ol className="mt-3 space-y-2.5">
              {[
                { step: "1", text: "Student notified at 80%", state: "Sent Mon" },
                { step: "2", text: "Mentor assigned at 78%", state: "Sent Tue" },
                { step: "3", text: "Parent digest at 75%", state: "Queued" },
                { step: "4", text: "HoD review at 70%", state: "Rule ready" },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-900/[0.05] text-[0.55rem] font-semibold text-slate-500">
                    {item.step}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.62rem] font-medium text-slate-700">
                      {item.text}
                    </span>
                    <span className="text-[0.55rem] text-slate-500">{item.state}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-4">
            <div className="flex items-center gap-2">
              <Send className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              <p className="text-[0.66rem] font-semibold text-slate-700">
                Monday digest preview
              </p>
            </div>
            <p className="mt-2 rounded-xl bg-slate-900/[0.03] p-2.5 text-[0.6rem] leading-relaxed text-slate-600">
              7 students in ET&T-1A are below the 75% mark. Three lost more than
              two sessions to Friday labs. Suggested intervention: shift the
              tutorial slot.
            </p>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

const PACKS = [
  {
    title: "NAAC SSR — Criterion 1",
    meta: "Department compliance + hours taught",
    formats: ["PDF", "XLSX"],
    state: "ready" as const,
  },
  {
    title: "AICTE faculty workload",
    meta: "Sanctioned vs delivered, per faculty",
    formats: ["XLSX"],
    state: "ready" as const,
  },
  {
    title: "Monthly register",
    meta: "Signed PDF for the physical archive",
    formats: ["PDF"],
    state: "generating" as const,
  },
  {
    title: "Defaulter & intervention log",
    meta: "Nudges, mentor notes, approvals",
    formats: ["PDF", "CSV"],
    state: "ready" as const,
  },
];

const REGISTER = [
  { roll: "101", name: "Nitish Rane", held: 68, present: 65, pct: "95.6%" },
  { roll: "102", name: "Tilak Sahu", held: 68, present: 61, pct: "89.7%" },
  { roll: "103", name: "Mukesh Bhoi", held: 68, present: 54, pct: "79.4%" },
  { roll: "104", name: "Prakhar Mehta", held: 68, present: 48, pct: "70.6%" },
];

export function ReportPanel() {
  return (
    <MockFrame
      title="Report packs"
      alt="The report library: NAAC SSR, AICTE faculty workload, monthly register and defaulter log packs with their formats and states, beside a preview of a signed attendance register table."
      meta="Academic year 2025–26 · compiled from live records"
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/[0.05] px-2.5 py-1 text-[0.6rem] font-semibold text-slate-600">
          <CalendarCheck className="h-3 w-3" aria-hidden="true" />
          Next run · 1 Oct, 6:00 a.m.
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {PACKS.map((pack) => (
            <div
              key={pack.title}
              className="flex flex-col rounded-2xl border border-slate-900/[0.06] bg-white p-3.5"
            >
              <div className="flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.66rem] font-semibold leading-snug text-slate-800">
                    {pack.title}
                  </p>
                  <p className="mt-0.5 text-[0.56rem] leading-snug text-slate-500">
                    {pack.meta}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                {pack.formats.map((format) => (
                  <span
                    key={format}
                    className="rounded-md bg-slate-900/[0.05] px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold text-slate-500"
                  >
                    {format}
                  </span>
                ))}
                {pack.state === "ready" ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-[0.58rem] font-semibold text-emerald-600">
                    <CircleCheck className="h-3 w-3" aria-hidden="true" />
                    Ready
                  </span>
                ) : (
                  <span className="ml-auto text-[0.58rem] font-semibold text-amber-600">
                    Generating 62%
                  </span>
                )}
              </div>

              {pack.state === "generating" ? (
                <span className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-slate-900/[0.07]">
                  <span className="block h-full w-[62%] rounded-full bg-amber-500" />
                </span>
              ) : (
                <span className="mt-2 inline-flex items-center gap-1 text-[0.58rem] font-medium text-slate-500">
                  <Download className="h-3 w-3" aria-hidden="true" />
                  Download or schedule to IQAC
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-4">
          <div className="flex items-center gap-2">
            <p className="text-[0.68rem] font-semibold text-slate-700">
              Attendance register preview
            </p>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-900/[0.05] px-2 py-0.5 text-[0.55rem] font-semibold text-slate-500">
              <ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden="true" />
              Digitally signed
            </span>
          </div>

          <table className="mt-3 w-full border-separate border-spacing-y-1.5 text-left">
            <thead>
              <tr className="text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                <th scope="col" className="pb-1 font-semibold">
                  Roll
                </th>
                <th scope="col" className="pb-1 font-semibold">
                  Student
                </th>
                <th scope="col" className="pb-1 text-right font-semibold">
                  Held
                </th>
                <th scope="col" className="pb-1 text-right font-semibold">
                  Present
                </th>
                <th scope="col" className="pb-1 text-right font-semibold">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {REGISTER.map((row) => (
                <tr key={row.roll} className="bg-slate-900/[0.03]">
                  <td className="rounded-l-lg px-2 py-1.5 font-mono text-[0.6rem] text-slate-500">
                    {row.roll}
                  </td>
                  <td className="px-2 py-1.5 text-[0.62rem] font-medium text-slate-700">
                    {row.name}
                  </td>
                  <td className="px-2 py-1.5 text-right text-[0.62rem] tabular-nums text-slate-500">
                    {row.held}
                  </td>
                  <td className="px-2 py-1.5 text-right text-[0.62rem] tabular-nums text-slate-500">
                    {row.present}
                  </td>
                  <td
                    className={cn(
                      "rounded-r-lg px-2 py-1.5 text-right text-[0.62rem] font-semibold tabular-nums",
                      row.pct >= "75%" ? "text-emerald-600" : "text-rose-500",
                    )}
                  >
                    {row.pct}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-3 text-[0.58rem] leading-relaxed text-slate-500">
            Every number traces back to the session that produced it — click any
            cell in the live product to see the lecture, the faculty and the
            scan timestamp.
          </p>
        </div>
      </div>
    </MockFrame>
  );
}

export const SHOWCASE_MOCKS = {
  capture: CapturePanel,
  analyse: AnalysePanel,
  act: ActPanel,
  report: ReportPanel,
} as const;
