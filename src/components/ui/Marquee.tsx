import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full pass. */
  speed?: number;
  className?: string;
  itemClassName?: string;
}

/**
 * Infinite horizontal marquee.
 *
 * The track holds the content twice; the second copy is `aria-hidden` so
 * screen readers hear each logo/quote exactly once. Hover or keyboard focus
 * pauses the animation (see `.marquee` in globals.css), and reduced-motion
 * disables it entirely.
 */
export function Marquee({
  children,
  speed = 42,
  className,
  itemClassName,
}: MarqueeProps) {
  return (
    <div className={cn("marquee mask-fade-x relative overflow-hidden", className)}>
      <div
        className="marquee-track flex w-max items-center"
        style={{ animationDuration: `${speed}s` }}
      >
        <div className={cn("flex shrink-0 items-center", itemClassName)}>
          {children}
        </div>
        <div
          className={cn("flex shrink-0 items-center", itemClassName)}
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
