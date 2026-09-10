import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "neutral" | "success" | "warning" | "danger" | "dark";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200/80",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  dark: "bg-ink text-white ring-white/10",
};

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}

/** Small status/metadata chip — used for eyebrows, labels and table states. */
export function Badge({ children, tone = "brand", className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {icon ? (
        <span className="[&_svg]:h-3.5 [&_svg]:w-3.5" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

export interface EyebrowProps {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}

/** Section eyebrow: gradient dot + letter-spaced label. */
export function Eyebrow({ children, className, tone = "light" }: EyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em]",
        tone === "light" ? "text-brand-700" : "text-brand-200",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(120deg,var(--color-brand-500),var(--color-accent-500))] shadow-[0_0_0_3px_rgb(99_102_241_/_0.16)]"
      />
      {children}
    </p>
  );
}
