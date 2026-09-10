"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { heroTrustPoints } from "@/content/landing";
import { DashboardMock } from "./mockups/DashboardMock";

/**
 * Hero: headline, dual CTA, trust strip and the product shot.
 *
 * Entrance animation is plain CSS (`animate-rise` + stagger delays) so the
 * above-the-fold content paints even if the JS bundle is slow or blocked.
 * The scroll-linked perspective tilt is progressive enhancement via motion.
 */
export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const rotateX = useTransform(scrollY, [0, 520], [6.5, 0]);
  const scale = useTransform(scrollY, [0, 520], [0.975, 1]);

  // `overflow-hidden` clips only the decorative glow layers: the floating
  // glass cards sit inside the container gutters at every breakpoint.
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pt-40"
    >
      {/* Ambient background — clipped on its own layer so nothing bleeds sideways. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgb(224_231_255_/_0.85),transparent_60%)]" />
        <div className="absolute inset-x-0 top-0 h-[42rem] bg-grid mask-fade-y opacity-60" />
        <div className="glow-blob left-[-6rem] top-24 h-72 w-72 bg-brand-400/45 motion-safe:animate-float" />
        <div className="glow-blob right-[-5rem] top-40 h-80 w-80 bg-accent-400/35 motion-safe:animate-float-slow" />
        <div className="glow-blob left-1/3 top-[26rem] h-72 w-72 bg-violet-400/25 motion-safe:animate-drift" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,var(--color-canvas))]" />
      </div>

      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <a
            href="#features"
            className="relative inline-flex animate-rise items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-card ring-1 ring-inset ring-white/70 backdrop-blur-md transition-colors duration-200 hover:text-brand-700"
            style={{ animationDelay: "60ms" }}
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 motion-safe:animate-pulse-ring" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Session 2025–26 live on 128 campuses
            <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
            <span className="hidden sm:inline">
              Smart Alerts &amp; NAAC report packs are out
            </span>
          </a>

          <h1
            id="hero-heading"
            className="mt-7 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem]"
          >
            <span
              className="block animate-rise text-slate-900"
              style={{ animationDelay: "120ms" }}
            >
              Attendance in seconds.
            </span>
            <span
              className="block animate-rise text-gradient"
              style={{ animationDelay: "200ms" }}
            >
              Clarity for the whole semester.
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl animate-rise text-base leading-relaxed text-slate-600 sm:text-[1.125rem]"
            style={{ animationDelay: "280ms" }}
          >
            Track Attend turns live QR check-ins, faculty rosters and leave
            requests into one trustworthy record — so admins can prove
            compliance, faculty get their teaching time back, and students
            always know where they stand.
          </p>

          <div
            className="mt-9 flex animate-rise flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "340ms" }}
          >
            <Button
              href="#get-started"
              size="lg"
              trailingIcon={<ArrowRight />}
              className="w-full sm:w-auto"
            >
              Book a campus walkthrough
            </Button>
            <Button
              href="#product"
              size="lg"
              variant="secondary"
              leadingIcon={<PlayCircle />}
              className="w-full sm:w-auto"
            >
              Take the product tour
            </Button>
          </div>

          <p
            className="mt-4 animate-rise text-[0.8125rem] text-slate-500"
            style={{ animationDelay: "380ms" }}
          >
Live in a day · We migrate your existing registers · No new hardware
          </p>

          <ul
            className="mx-auto mt-9 flex max-w-3xl animate-rise flex-wrap items-center justify-center gap-x-7 gap-y-3"
            style={{ animationDelay: "420ms" }}
          >
            {heroTrustPoints.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-slate-600"
              >
                <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="mx-auto mt-14 max-w-6xl animate-rise sm:mt-16"
          style={{ animationDelay: "470ms" }}
        >
          <motion.div
            style={
              prefersReducedMotion
                ? undefined
                : { rotateX, scale, transformPerspective: 1700 }
            }
            className="origin-top"
          >
            <DashboardMock />
          </motion.div>
        </div>

        <p
          className="mx-auto mt-10 max-w-2xl animate-rise text-center text-[0.8125rem] leading-relaxed text-slate-500"
          style={{ animationDelay: "540ms" }}
        >
          The faculty view during a live session: rotating QR, live check-in
          count, semester trend and the watch list of students slipping below
          75% — all on one screen.
        </p>
      </Container>
    </section>
  );
}
