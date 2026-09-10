import Link from "next/link";
import { cn } from "@/lib/cn";

export interface LogoMarkProps {
  className?: string;
  /** Size of the square mark in px. */
  size?: number;
}

/**
 * Brand mark: a scan frame with a check inside — capture + confirmation,
 * the two halves of the product.
 */
export function LogoMark({ className, size = 36 }: LogoMarkProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-[0.7rem] " +
          "bg-[linear-gradient(145deg,var(--color-brand-500),var(--color-brand-700)_55%,#7c3aed)] " +
          "shadow-[0_10px_24px_-12px_rgb(79_70_229_/_0.85),inset_0_1px_0_rgb(255_255_255_/_0.35)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-[58%] w-[58%] text-white"
      >
        <path
          d="M4 8.5V6.2A2.2 2.2 0 0 1 6.2 4h2.3M15.5 4h2.3A2.2 2.2 0 0 1 20 6.2v2.3M20 15.5v2.3a2.2 2.2 0 0 1-2.2 2.2h-2.3M8.5 20H6.2A2.2 2.2 0 0 1 4 17.8v-2.3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="m8.6 12.35 2.25 2.25L15.6 9.9"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export interface LogoProps {
  className?: string;
  href?: string;
  tone?: "light" | "dark";
  showWordmark?: boolean;
  size?: number;
  "aria-label"?: string;
}

/** Mark + wordmark lockup with accessible naming. */
export function Logo({
  className,
  href = "/",
  tone = "light",
  showWordmark = true,
  size = 36,
  ...aria
}: LogoProps) {
  const content = (
    <>
      <LogoMark size={size} />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-[1.0625rem] font-semibold tracking-[-0.02em]",
              tone === "dark" ? "text-white" : "text-slate-900",
            )}
          >
            Track Attend
          </span>
          <span
            className={cn(
              "mt-1 text-[0.625rem] font-medium uppercase tracking-[0.16em]",
              tone === "dark" ? "text-brand-200/80" : "text-slate-500",
            )}
          >
            Attendance OS
          </span>
        </span>
      ) : null}
    </>
  );

  return (
    <Link
      href={href}
      aria-label={aria["aria-label"] ?? "Track Attend — home"}
      className={cn(
        "inline-flex items-center gap-3 rounded-xl transition-opacity duration-200 hover:opacity-90",
        className,
      )}
    >
      {content}
    </Link>
  );
}
