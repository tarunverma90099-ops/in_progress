"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { navLinks } from "@/content/landing";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/cn";

/**
 * Sticky glass navigation.
 *
 * - Transparent over the hero, frosted once the page scrolls.
 * - Highlights the section in view (also exposed via aria-current).
 * - Mobile sheet locks scroll, closes on Escape, route change or resize.
 */
export function SiteNav() {
  const pathname = usePathname();
  const scrolled = useScrolled(16);
  const [open, setOpen] = useState(false);
  const sectionIds = useMemo(() => navLinks.map((link) => link.id), []);
  const activeSection = useActiveSection(sectionIds);

  const isHome = pathname === "/";
  /** Anchors must be absolute when the nav renders off the landing page. */
  const resolve = (href: string) => (isHome ? href : `/${href}`);
  const activeId = isHome ? activeSection : null;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <Container className="pt-3 sm:pt-4">
        <nav
          aria-label="Main"
          className={cn(
            "relative flex h-16 items-center gap-3 rounded-2xl px-3 transition-[background-color,box-shadow,backdrop-filter,ring-color] duration-300 ease-brand sm:px-4",
            scrolled || open
              ? "glass shadow-card"
              : "bg-white/45 ring-1 ring-inset ring-white/50 backdrop-blur-[6px]",
          )}
        >
          <Logo size={34} />

          <ul className="ml-4 hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const isActive = activeId === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={resolve(link.href)}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "text-brand-700"
                        : "text-slate-600 hover:bg-slate-900/[0.04] hover:text-slate-900",
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-500))] transition-transform duration-300 ease-brand",
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <Button href="/login" variant="ghost" size="sm">
              Sign in
            </Button>
            <Button
              href="#get-started"
              variant="primary"
              size="sm"
              trailingIcon={<ArrowRight />}
            >
              Book a walkthrough
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="ml-auto grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition-colors hover:bg-slate-900/[0.05] sm:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {open ? (
            <motion.div
              id="mobile-nav"
              key="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 0.68, 0.24, 1] }}
              /* Near-opaque (not the usual 72% glass): this panel drops over
                 the hero headline, and ghosted text behind it reads as a bug. */
              className="mt-2 overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-2 shadow-lift backdrop-blur-xl sm:hidden"
            >
              <ul className="space-y-1">
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * index, duration: 0.2 }}
                  >
                    <a
                      href={resolve(link.href)}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[0.95rem] font-medium text-slate-700 transition-colors hover:bg-slate-900/[0.045] hover:text-slate-900"
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-2 space-y-2 border-t border-slate-900/[0.07] p-2 pt-3">
                <Button href="/login" variant="secondary" size="md" fullWidth>
                  Sign in
                </Button>
                <Button
                  href={resolve("#get-started")}
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => setOpen(false)}
                  trailingIcon={<ArrowRight />}
                >
                  Book a walkthrough
                </Button>
                <p className="flex items-center justify-center gap-1.5 pt-1 text-[0.7rem] text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
                  Live on 128 campuses this session
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Container>
    </header>
  );
}
