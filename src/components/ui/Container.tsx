import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const SIZES = {
  /** Standard marketing/content width. */
  default: "max-w-7xl",
  /** Long-form reading width (FAQ, policy pages). */
  narrow: "max-w-3xl",
  /** Wide product shots. */
  wide: "max-w-[88rem]",
} as const;

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: keyof typeof SIZES;
}

/**
 * Horizontal rhythm for the whole product. Every section body should be a
 * `Container` so gutters stay identical on marketing pages, the dashboard and
 * report printouts.
 */
export function Container({ children, className, size = "default" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        SIZES[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
