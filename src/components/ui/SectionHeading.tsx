import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./Badge";

export interface SectionHeadingProps {
  /** Small letter-spaced label above the title. */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** `id` is applied to the heading so sections can reference it via aria-labelledby. */
  id?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
  /** Optional right-hand slot (e.g. a link) for left-aligned headings. */
  action?: ReactNode;
}

/**
 * Section header used by every marketing block (and available to internal
 * pages for consistency).
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "center",
  tone = "light",
  className,
  action,
}: SectionHeadingProps) {
  const centered = align === "center";
  const hasAction = Boolean(action);

  return (
    <div
      className={cn(
        centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
        !centered && hasAction && "sm:flex sm:max-w-none sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className={cn(!centered && hasAction && "sm:max-w-2xl")}>
        {eyebrow ? (
          <Eyebrow tone={tone} className={cn(centered && "justify-center")}>
            {eyebrow}
          </Eyebrow>
        ) : null}
        <h2
          id={id}
          className={cn(
            "mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]",
            tone === "dark" ? "text-white" : "text-slate-900",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-5 text-base leading-relaxed sm:text-[1.0625rem]",
              tone === "dark" ? "text-slate-300" : "text-slate-600",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className={cn("mt-6 shrink-0", !centered && "sm:mt-0")}>{action}</div>
      ) : null}
    </div>
  );
}
