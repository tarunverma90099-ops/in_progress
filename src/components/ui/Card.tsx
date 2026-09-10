"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SurfaceProps {
  children: ReactNode;
  className?: string;
}

/** Opaque product surface — the default card for internal pages. */
export function Surface({ children, className }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white ring-1 ring-slate-900/[0.07] shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Frosted card — used over gradients, imagery and dark panels. */
export function GlassCard({ children, className }: SurfaceProps) {
  return <div className={cn("glass rounded-3xl", className)}>{children}</div>;
}

export interface SpotlightCardProps extends SurfaceProps {
  /** Adds the frosted treatment instead of a solid white card. */
  glassy?: boolean;
}

/**
 * Card with a pointer-tracked highlight. The highlight is a pure CSS radial
 * gradient driven by two custom properties, so there is no re-render on move.
 */
export function SpotlightCard({
  children,
  className,
  glassy = false,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn(
        "spotlight group/card relative overflow-hidden rounded-3xl transition-[transform,box-shadow,ring-color] duration-300 ease-brand",
        glassy
          ? "glass"
          : "bg-white ring-1 ring-slate-900/[0.07] shadow-card hover:shadow-lift hover:ring-brand-200",
        "motion-safe:hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
