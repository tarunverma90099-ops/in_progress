"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type Direction = "up" | "left" | "right" | "none";

const TAGS = {
  div: "div",
  span: "span",
  li: "li",
  p: "p",
  section: "section",
  article: "article",
  header: "header",
  figure: "figure",
} as const;

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms — used to stagger siblings. */
  delay?: number;
  direction?: Direction;
  as?: keyof typeof TAGS;
  /** Re-hide when the element leaves the viewport (off by default). */
  repeat?: boolean;
  style?: CSSProperties;
}

/**
 * Scroll-triggered reveal.
 *
 * A single IntersectionObserver per element (no global registry, no library
 * runtime) toggles `data-revealed`, which the `.reveal` primitive in
 * globals.css animates. `prefers-reduced-motion` and the `no-js` guard both
 * short-circuit to a fully visible state.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  as = "div",
  repeat = false,
  style,
}: RevealProps) {
  const Tag = TAGS[as];
  const nodeRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    // Environments without IntersectionObserver (very old browsers, some
    // embedded webviews) skip the effect entirely and show content at once.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (!repeat) observer.unobserve(entry.target);
          } else if (repeat) {
            setRevealed(false);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [repeat]);

  const setNode = (node: HTMLElement | null) => {
    nodeRef.current = node;
  };

  return (
    <Tag
      ref={setNode}
      data-direction={direction}
      data-revealed={revealed}
      className={cn("reveal", className)}
      style={
        delay
          ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties)
          : style
      }
    >
      {children}
    </Tag>
  );
}
