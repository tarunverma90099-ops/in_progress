"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { showcaseTabs } from "@/content/landing";
import { SHOWCASE_MOCKS } from "./mockups/ShowcaseMocks";
import { cn } from "@/lib/cn";

const EASE = [0.22, 0.68, 0.24, 1] as const;

/**
 * Product tour: an accessible tab set (roving tabindex + arrow keys) that
 * swaps between the four stages of the workflow.
 */
export function ProductShowcase() {
  const [activeId, setActiveId] = useState(showcaseTabs[0].id);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeTab = showcaseTabs.find((tab) => tab.id === activeId) ?? showcaseTabs[0];
  const Mock = SHOWCASE_MOCKS[activeTab.mock];
  const ActiveIcon = activeTab.icon;

  const focusTab = (index: number) => {
    const nextIndex = (index + showcaseTabs.length) % showcaseTabs.length;
    tabRefs.current[nextIndex]?.focus();
    setActiveId(showcaseTabs[nextIndex].id);
  };

  return (
    <section
      id="product"
      aria-labelledby="product-heading"
      className="relative scroll-mt-28 overflow-hidden py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-canvas),#f5f6ff_45%,var(--color-canvas))]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-dots opacity-[0.35] mask-fade-y"
      />

      <Container>
        <Reveal>
          <SectionHeading
            id="product-heading"
            eyebrow="Product tour"
            title="Capture → analyse → act → report"
            description="The same record travels through all four steps, so the number a student sees is the number the registrar submits. Pick a step to see the screen your team will actually use."
          />
        </Reveal>

        <Reveal delay={80} className="mt-10 flex justify-center">
          <div
            role="tablist"
            aria-label="Product tour steps"
            className="glass flex max-w-full gap-1 overflow-x-auto rounded-2xl p-1.5"
          >
            {showcaseTabs.map((tab, index) => {
              const selected = tab.id === activeTab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`${baseId}-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(tab.id)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                      event.preventDefault();
                      focusTab(index + 1);
                    }
                    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                      event.preventDefault();
                      focusTab(index - 1);
                    }
                    if (event.key === "Home") {
                      event.preventDefault();
                      focusTab(0);
                    }
                    if (event.key === "End") {
                      event.preventDefault();
                      focusTab(showcaseTabs.length - 1);
                    }
                  }}
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 sm:px-4",
                    selected ? "text-brand-700" : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId="showcase-tab-pill"
                      transition={{ duration: 0.28, ease: EASE }}
                      className="absolute inset-0 rounded-xl bg-white shadow-card ring-1 ring-inset ring-slate-900/[0.06]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="relative flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeTab.id}`}
          aria-labelledby={`${baseId}-tab-${activeTab.id}`}
          tabIndex={0}
          className="mt-12 focus-visible:outline-none"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.34, ease: EASE }}
              className="grid gap-8 lg:grid-cols-[0.85fr_1.3fr] lg:items-start lg:gap-10"
            >
              <div className="lg:pt-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-700 ring-1 ring-inset ring-brand-100">
                  <ActiveIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Step {showcaseTabs.findIndex((tab) => tab.id === activeTab.id) + 1} · {activeTab.label}
                </p>

                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-slate-900 sm:text-[1.75rem] sm:leading-[1.2]">
                  {activeTab.title}
                </h3>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-slate-600">
                  {activeTab.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {activeTab.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-[0.9375rem] text-slate-600">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="glass mt-7 flex items-center gap-4 rounded-2xl p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(150deg,var(--color-brand-500),var(--color-brand-700))] text-white">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-lg font-semibold tracking-[-0.02em] text-slate-900">
                      {activeTab.metric.value}
                    </span>
                    <span className="block text-[0.8125rem] leading-snug text-slate-500">
                      {activeTab.metric.label}
                    </span>
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <Mock />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
