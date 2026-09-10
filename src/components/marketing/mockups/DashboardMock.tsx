import {
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  LayoutDashboard,
  ScanLine,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { QrGlyph } from "./QrGlyph";

const NAV = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Live sessions", icon: ScanLine, active: false },
  { label: "Students", icon: Users, active: false },
  { label: "Analytics", icon: ChartColumn, active: false },
  { label: "Reports", icon: ClipboardList, active: false },
];

const KPIS = [
  { label: "Present today", value: "91.4%", delta: "+2.1%", up: true },
  { label: "Live sessions", value: "2", delta: "running", up: true },
  { label: "Below 75%", value: "14", delta: "students", up: false },
  { label: "Pending leaves", value: "4", delta: "1 urgent", up: false },
];

const TREND = [
  62, 71, 68, 79, 74, 83, 88, 81, 86, 90, 87, 92, 89, 94,
];

const WATCH_LIST = [
  { name: "Rohit Nair", roll: "104", course: "Digital Circuits", pct: 71, tone: "danger" as const },
  { name: "Saima Qureshi", roll: "112", course: "Embedded System", pct: 73, tone: "danger" as const },
  { name: "Devansh Patel", roll: "118", course: "Digital Circuits", pct: 76, tone: "warning" as const },
];

const CHECKINS = [
  { name: "Nitish R.", time: "09:02" },
  { name: "Tilak S.", time: "09:02" },
  { name: "Prakhar M.", time: "09:03" },
  { name: "Anitesh K.", time: "09:04" },
];

function buildAreaPath(values: number[], width: number, height: number) {
  const max = Math.max(...values) * 1.06;
  const min = Math.min(...values) * 0.82;
  const stepX = width / (values.length - 1);
  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - min) / (max - min)) * height;
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area, last: points[points.length - 1] };
}

function WindowChrome() {
  return (
    <div className="flex items-center gap-3 border-b border-slate-900/[0.06] bg-white/70 px-3.5 py-3 sm:px-4">
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
      </div>
      <div className="mx-auto flex max-w-[16rem] flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900/[0.045] px-3 py-1.5 text-[0.625rem] font-medium text-slate-500">
        <ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden="true" />
        <span className="truncate">trackattend.app/faculty/overview</span>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span className="h-6 w-6 rounded-full bg-slate-900/[0.06]" aria-hidden="true" />
        <span className="h-6 w-6 rounded-full bg-slate-900/[0.06]" aria-hidden="true" />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden flex-col gap-1 border-r border-slate-900/[0.06] bg-white/50 p-3 md:flex">
      <div className="mb-2 flex items-center gap-2 rounded-xl bg-slate-900/[0.04] px-2.5 py-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-[linear-gradient(140deg,var(--color-brand-500),var(--color-brand-700))] text-[0.55rem] font-bold text-white">
          TA
        </span>
        <span className="text-[0.7rem] font-semibold text-slate-700">
          Digital Circuits
        </span>
      </div>
      {NAV.map(({ label, icon: Icon, active }) => (
        <div
          key={label}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.7rem] font-medium",
            active
              ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
              : "text-slate-500",
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </div>
      ))}
      <div className="mt-auto rounded-xl border border-slate-900/[0.06] bg-white px-2.5 py-2">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Semester 5
        </p>
        <p className="mt-0.5 text-[0.65rem] text-slate-500">
          12 weeks · 148 sessions
        </p>
      </div>
    </aside>
  );
}

function KpiRow() {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {KPIS.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl border border-slate-900/[0.06] bg-white p-3"
        >
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-slate-500">
            {kpi.label}
          </p>
          <p className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.02em] text-slate-900">
            {kpi.value}
          </p>
          <p
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-[0.6rem] font-medium",
              kpi.up ? "text-emerald-600" : "text-slate-500",
            )}
          >
            {kpi.up ? (
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
            )}
            {kpi.delta}
          </p>
        </div>
      ))}
    </div>
  );
}

function TrendChart() {
  const { line, area, last } = buildAreaPath(TREND, 320, 92);

  return (
    <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-semibold text-slate-800">
            Attendance trend
          </p>
          <p className="text-[0.6rem] text-slate-500">
            Last 14 teaching days · all subjects
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          91.4% average
        </span>
      </div>

      <div className="relative mt-3">
      <svg
        viewBox="0 0 320 92"
        preserveAspectRatio="none"
        className="h-24 w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {[0.25, 0.55, 0.85].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2="320"
            y1={92 * ratio}
            y2={92 * ratio}
            stroke="#0f172a"
            strokeOpacity="0.06"
            strokeDasharray="4 6"
          />
        ))}
        <path d={area} fill="url(#trendFill)" />
        {/* non-scaling-stroke keeps the line an even weight despite the
            non-uniform stretch of preserveAspectRatio="none". */}
        <path
          d={line}
          fill="none"
          stroke="url(#trendLine)"
          strokeWidth="2.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        aria-hidden="true"
        className="absolute right-0 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white ring-2 ring-accent-500"
        style={{ top: `${(last[1] / 92) * 100}%` }}
      />
      </div>

      <div className="mt-1 flex justify-between text-[0.55rem] font-medium text-slate-500">
        {["Aug 25", "Sep 01", "Sep 08", "Today"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function WatchList() {
  return (
    <div className="rounded-2xl border border-slate-900/[0.06] bg-white p-3.5">
      <div className="flex items-center gap-2">
        <TriangleAlert className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
        <p className="text-[0.72rem] font-semibold text-slate-800">Watch list</p>
        <span className="ml-auto rounded-full bg-slate-900/[0.05] px-2 py-0.5 text-[0.55rem] font-semibold text-slate-500">
          14 students
        </span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {WATCH_LIST.map((student) => (
          <li key={student.roll} className="flex items-center gap-2.5">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900/[0.05] text-[0.55rem] font-semibold text-slate-600"
              aria-hidden="true"
            >
              {student.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.68rem] font-medium text-slate-700">
                {student.name}
              </span>
              <span className="block truncate text-[0.55rem] text-slate-500">
                Roll {student.roll} · {student.course}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold",
                student.tone === "danger"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              {student.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiveSessionCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-3.5 ring-1 ring-slate-900/[0.07] shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 animate-pulse-ring" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Live session
        </p>
        <span className="ml-auto font-mono text-[0.6rem] text-slate-500">4s</span>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-900/10">
          <QrGlyph seed="digital-circuits" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-[linear-gradient(180deg,transparent,rgb(79_70_229_/_0.45),transparent)] animate-scanline"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[0.78rem] font-semibold text-slate-900">
            Digital Circuits
          </p>
          <p className="text-[0.6rem] text-slate-500">Studio A · 09:00–09:50</p>
          <p className="mt-1.5 text-[0.7rem] font-semibold text-brand-700">
            42/48 checked in
          </p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/[0.08]">
            <div className="h-full w-[87%] rounded-full bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500))]" />
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {CHECKINS.slice(0, 3).map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-[0.62rem]">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden="true">
                <path
                  d="M2.5 6.4 4.7 8.6 9.5 3.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-slate-600">{entry.name}</span>
            <span className="ml-auto font-mono text-slate-500">{entry.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlertCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-3.5 ring-1 ring-slate-900/[0.07] shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
          <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[0.72rem] font-semibold text-slate-900">
            3 students dropped below 75%
          </p>
          <p className="mt-0.5 text-[0.6rem] leading-relaxed text-slate-500">
            Digital Circuits · triggered by threshold rule
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {/* A tighter overlap made the 2px white ring clip the neighbouring
            initials, so the stack is spaced to keep every letter readable. */}
        <div className="flex -space-x-1.5" aria-hidden="true">
          {["RN", "SQ", "DP"].map((initials, index) => (
            <span
              key={initials}
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full text-[0.5rem] font-semibold text-white ring-2 ring-white",
                index === 0
                  ? "bg-brand-600"
                  : index === 1
                    ? "bg-accent-700"
                    : "bg-violet-600",
              )}
            >
              {initials}
            </span>
          ))}
        </div>
        <span className="text-[0.6rem] font-medium text-slate-500">+11 more</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[0.6rem] font-semibold text-white">
          Notify mentors
        </span>
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-slate-900/[0.07] pt-3">
        {[
          { label: "Mentor assigned", value: "2 unread" },
          { label: "Parent digest", value: "Fri 6 p.m." },
          { label: "HoD review", value: "Rule ready" },
        ].map((step) => (
          <li key={step.label} className="flex items-center gap-2 text-[0.62rem]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            <span className="text-slate-600">{step.label}</span>
            <span className="ml-auto font-medium text-slate-500">{step.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Hero product shot: a stylised faculty dashboard. Purely presentational, so
 * it is exposed to assistive tech as a single labelled image.
 */
export function DashboardMock() {
  return (
    <div
      role="img"
      aria-label="Preview of the Track Attend faculty dashboard: today's attendance at 91.4%, a live QR session for Digital Circuits with 42 of 48 students checked in, a 14-day attendance trend chart and a watch list of students below 75%."
      className="relative"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[3rem] bg-[radial-gradient(55%_50%_at_50%_0%,rgb(99_102_241_/_0.22),transparent_72%)] blur-2xl"
      />

      <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-900/[0.08] bg-white/85 shadow-lift backdrop-blur-xl">
        <WindowChrome />
        <div className="grid grid-cols-1 md:grid-cols-[11.5rem_1fr]" aria-hidden="true">
          <Sidebar />
          <div className="space-y-3 bg-[linear-gradient(180deg,rgb(248_250_255_/_0.9),rgb(255_255_255_/_0.6))] p-3.5 sm:p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0">
                <p className="text-[0.82rem] font-semibold tracking-[-0.01em] text-slate-900">
                  Good morning, Dr. Choubey
                </p>
                <p className="mt-0.5 text-[0.62rem] text-slate-500">
                  Monday, 14 September · Week 12 of Semester 5
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/[0.05] px-2.5 py-1.5 text-[0.62rem] font-medium text-slate-600">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  Timetable
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,var(--color-brand-500),var(--color-brand-700))] px-2.5 py-1.5 text-[0.62rem] font-semibold text-white shadow-glow">
                  <ScanLine className="h-3 w-3" aria-hidden="true" />
                  Start session
                </span>
              </div>
            </div>

            <KpiRow />

            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
              <TrendChart />
              <WatchList />
            </div>
          </div>
        </div>
      </div>

      {/* Live-activity strip. These started life as cards floating *over* the
          dashboard, but every placement covered real content — the KPI row, the
          trend axis, the watch list — which reads as a layout bug rather than
          depth. Sitting under the frame keeps the same "the product is moving"
          feel with nothing hidden.

          They are deliberately not animated: a running transform keeps the card
          on a composited layer, and at 2x that renders this much small text
          visibly soft. Ambient motion is carried by the background glows and the
          QR scanline instead. */}
      <div className="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
        <LiveSessionCard className="w-full" />
        <AlertCard className="w-full justify-self-end" />
      </div>
    </div>
  );
}
