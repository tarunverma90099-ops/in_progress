import {
  BellRing,
  Check,
  Download,
  FileBarChart,
  FileSpreadsheet,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { QrGlyph } from "./QrGlyph";

/* ============================================================================
   Miniature product visuals used inside the feature bento cards.
   All decorative — the surrounding card carries the real copy.
   ============================================================================ */

const ROSTER = [
  { name: "Nitish R.", time: "09:02" },
  { name: "Tilak S.", time: "09:02" },
  { name: "Prakhar M.", time: "09:03" },
  { name: "Mukesh B.", time: "09:04" },
];

export function CaptureVisual() {
  return (
    <div className="flex gap-3.5"
      role="img"
      aria-label="Illustration of a live QR attendance session: a rotating QR code, a 42 of 48 check-in counter and the roster filling with arrival times."
    >
      <div className="relative h-[6.25rem] w-[6.25rem] shrink-0 overflow-hidden rounded-2xl p-1.5 ring-1 ring-slate-900/10">
        <QrGlyph seed="capture-visual" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-[linear-gradient(180deg,transparent,rgb(79_70_229_/_0.5),transparent)] animate-scanline"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 motion-safe:animate-pulse-ring" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Live · Studio A
          </span>
          <span className="ml-auto font-mono text-[0.6rem] text-slate-500">
            42/48
          </span>
        </div>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/[0.07]">
          <div className="h-full w-[87%] rounded-full bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500))]" />
        </div>

        <ul className="mt-2.5 space-y-1.5">
          {ROSTER.map((entry) => (
            <li
              key={entry.name}
              className="flex items-center gap-2 rounded-lg bg-slate-900/[0.03] px-2 py-1.5"
            >
              <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
              <span className="text-[0.62rem] font-medium text-slate-600">
                {entry.name}
              </span>
              <span className="ml-auto font-mono text-[0.58rem] text-slate-500">
                {entry.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const BARS = [54, 62, 58, 71, 66, 74, 79, 72, 81, 86, 82, 90, 87, 93];

const SUBJECTS = [
  { name: "Digital Circuits", pct: "93.4%", delta: "+2.1" },
  { name: "Embedded System", pct: "88.1%", delta: "+0.8" },
  { name: "Linear Algebra", pct: "81.7%", delta: "−1.4" },
];

export function AnalyticsVisual() {
  return (
    <div className="flex flex-col gap-3.5 sm:flex-row sm:items-end"
      role="img"
      aria-label="Illustration of the analytics view: a 14-day attendance bar chart beside subject percentages for Digital Circuits, Embedded System and Linear Algebra."
    >
      <div className="flex h-[6.5rem] flex-1 items-end gap-1.5">
        {BARS.map((value, index) => (
          <span
            key={index}
            className="spark-bar w-full rounded-t-[3px] bg-[linear-gradient(180deg,var(--color-brand-400),var(--color-brand-600))]"
            style={{ height: `${value}%`, animationDelay: `${index * 55}ms` }}
          />
        ))}
      </div>

      <ul className="w-full shrink-0 space-y-2 sm:w-[11.5rem]">
        {SUBJECTS.map((subject) => (
          <li key={subject.name} className="flex items-center gap-2">
            <span className="truncate text-[0.64rem] font-medium text-slate-600">
              {subject.name}
            </span>
            <span className="ml-auto text-[0.64rem] font-semibold text-slate-800 tabular-nums">
              {subject.pct}
            </span>
            <span
              className={cn(
                "text-[0.6rem] font-semibold tabular-nums",
                subject.delta.startsWith("+") ? "text-emerald-600" : "text-rose-500",
              )}
            >
              {subject.delta}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ALERTS = [
  { text: "Aarav Menon crossed 75% threshold", meta: "Digital Circuits", tone: "warning" },
  { text: "12 students below 80% warning line", meta: "Embedded System", tone: "neutral" },
  { text: "Mentor escalation sent to 2 tutors", meta: "Monday digest", tone: "success" },
];

export function AlertsVisual() {
  return (
    <div className="space-y-2.5"
      role="img"
      aria-label="Illustration of threshold alerts: 80 percent warning, 75 percent shortage and 70 percent escalation rules firing into a mentor digest."
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {["80% warn", "75% short", "70% escalate"].map((rule) => (
          <span
            key={rule}
            className="rounded-full bg-slate-900/[0.05] px-2 py-0.5 text-[0.58rem] font-semibold text-slate-500"
          >
            {rule}
          </span>
        ))}
      </div>
      <ul className="space-y-2">
        {ALERTS.map((alert) => (
          <li
            key={alert.text}
            className="flex items-start gap-2 rounded-xl bg-slate-900/[0.03] px-2.5 py-2"
          >
            <span
              className={cn(
                "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                alert.tone === "warning"
                  ? "bg-amber-500"
                  : alert.tone === "success"
                    ? "bg-emerald-500"
                    : "bg-slate-400",
              )}
            />
            <span className="min-w-0">
              <span className="block text-[0.66rem] font-medium leading-snug text-slate-700">
                {alert.text}
              </span>
              <span className="mt-0.5 block text-[0.58rem] text-slate-500">
                {alert.meta}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const REPORTS = [
  { name: "NAAC SSR — Criterion 1 annexure", meta: "PDF · 2.4 MB · signed", icon: FileBarChart },
  { name: "Monthly attendance register", meta: "PDF · 1.1 MB · archived", icon: FileSpreadsheet },
  { name: "Faculty compliance & workload", meta: "XLSX · 480 KB", icon: FileSpreadsheet },
];

export function ReportsVisual() {
  return (
    <div className="space-y-2"
      role="img"
      aria-label="Illustration of the report library: NAAC SSR annexure, monthly attendance register and faculty compliance exports ready to download."
    >
      {REPORTS.map((report) => (
        <div
          key={report.name}
          className="flex items-center gap-2.5 rounded-xl bg-slate-900/[0.03] px-2.5 py-2"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-brand-600 ring-1 ring-slate-900/[0.06]">
            <report.icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.66rem] font-medium text-slate-700">
              {report.name}
            </span>
            <span className="block text-[0.58rem] text-slate-500">{report.meta}</span>
          </span>
          <Download className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
        </div>
      ))}
      <p className="pt-0.5 text-[0.58rem] text-slate-500">
        Scheduled delivery · 1st of every month, 6:00 a.m. IST
      </p>
    </div>
  );
}

const ROLES = [
  { role: "Registrar", scope: "Institution", grants: ["View", "Edit", "Approve"] },
  { role: "HoD", scope: "Department", grants: ["View", "Edit", "Approve"] },
  { role: "Faculty", scope: "Own classes", grants: ["View", "Edit"] },
  { role: "Student", scope: "Own record", grants: ["View"] },
];

export function AccessVisual() {
  return (
    <div className="space-y-2"
      role="img"
      aria-label="Illustration of role-based permissions: registrar, HoD, faculty and student scopes with view, edit and approve rights."
    >
      {ROLES.map((entry) => (
        <div
          key={entry.role}
          className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-900/[0.03] px-2.5 py-2"
        >
          <span className="text-[0.66rem] font-semibold text-slate-700">
            {entry.role}
          </span>
          <span className="text-[0.58rem] text-slate-500">{entry.scope}</span>
          <span className="ml-auto flex gap-1">
            {["View", "Edit", "Approve"].map((action) => {
              const granted = entry.grants.includes(action);
              return (
                <span
                  key={action}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.55rem] font-semibold",
                    granted
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-900/[0.04] text-slate-500",
                  )}
                >
                  {granted ? (
                    <Check className="h-2.5 w-2.5" aria-hidden="true" />
                  ) : (
                    <X className="h-2.5 w-2.5" aria-hidden="true" />
                  )}
                  {action}
                </span>
              );
            })}
          </span>
        </div>
      ))}
      <p className="flex items-center gap-1.5 pt-0.5 text-[0.58rem] text-slate-500">
        <ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden="true" />
        Every override written to the audit log
      </p>
    </div>
  );
}

export const FEATURE_VISUALS = {
  capture: CaptureVisual,
  analytics: AnalyticsVisual,
  alerts: AlertsVisual,
  reports: ReportsVisual,
  access: AccessVisual,
} as const;

/** Shared empty-state glyph so alerts/reports cards share a visual voice. */
export function VisualIcon({ icon: Icon }: { icon: typeof BellRing | typeof TriangleAlert }) {
  return <Icon className="h-4 w-4" aria-hidden="true" />;
}
