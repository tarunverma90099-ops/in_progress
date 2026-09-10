"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contact, faqs } from "@/content/landing";
import { cn } from "@/lib/cn";

const EASE = [0.22, 0.68, 0.24, 1] as const;

/**
 * FAQ accordion. Single-open behaviour, full keyboard support and
 * `role="region"` panels so the answer is announced with its question.
 */
export function Faq() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-28 py-20 sm:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="faq-heading"
            eyebrow="FAQ"
            title="The questions registrars actually ask"
            description="Straight answers on rollout, proxies, accreditation evidence and where your data lives. If something is missing, our team replies within one working day."
          />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-5xl gap-3 lg:grid-cols-2 lg:items-start">
          {faqs.map((item, index) => {
            const open = openId === item.id;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-button-${item.id}`;

            return (
              <Reveal key={item.id} delay={Math.min(index, 4) * 60}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl bg-white ring-1 transition-[box-shadow,background-color,ring-color] duration-300",
                    open
                      ? "ring-brand-200 shadow-card"
                      : "ring-slate-900/[0.07] hover:ring-slate-900/[0.12]",
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left"
                    >
                      <span className="flex-1 text-[0.9375rem] font-semibold leading-snug text-slate-900">
                        {item.question}
                      </span>
                      <span
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300 ease-brand",
                          open
                            ? "rotate-180 bg-brand-50 text-brand-600"
                            : "bg-slate-900/[0.05] text-slate-500",
                        )}
                        aria-hidden="true"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        key="panel"
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-slate-600">
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120} className="mx-auto mt-8 max-w-5xl">
          <div className="glass flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(150deg,var(--color-brand-500),var(--color-brand-700))] text-white">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-[0.9375rem] font-semibold text-slate-900">
                Still deciding? Ask us anything before you commit.
              </p>
              <p className="mt-1 text-[0.875rem] text-slate-600">
                Write to {contact.salesEmail} or call {contact.phone} — a
                solutions architect answers, not a chatbot.
              </p>
            </div>
            <Button
              href={`mailto:${contact.salesEmail}`}
              variant="secondary"
              size="md"
              className="w-full sm:w-auto"
            >
              Email the team
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
