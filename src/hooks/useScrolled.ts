"use client";

import { useEffect, useState } from "react";

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      const next = window.scrollY > threshold;
      setScrolled((previous) => (previous === next ? previous : next));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}
