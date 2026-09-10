"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently closest to the top of the viewport.
 * Used for nav highlighting and for `aria-current="location"`.
 *
 * Reads positions on scroll (rAF-throttled) instead of IntersectionObserver so
 * tall sections stay "active" for their whole span rather than only while they
 * cross a threshold.
 */
export function useActiveSection(ids: string[], offset = 140) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      let current: string | null = null;
      for (const id of ids) {
        const node = document.getElementById(id);
        if (!node) continue;
        if (node.getBoundingClientRect().top - offset <= 0) current = id;
      }
      // Bottom of the page always highlights the last section.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) current = ids[ids.length - 1];
      setActive((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids, offset]);

  return active;
}
