"use client";

import { useState } from "react";
import { ArrowRight, CalendarCheck, CircleCheck, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { contact } from "@/content/landing";

const CAMPUS_SIZES = [
  "Under 500 students",
  "500 – 2,000 students",
  "2,000 – 10,000 students",
  "10,000+ students / multi-campus",
];

/**
 * Final CTA.
 *
 * The walkthrough form intentionally hands off to the visitor's mail client
 * with a pre-filled brief — no third-party form endpoint, no silent black
 * hole, and the confirmation is announced to screen readers.
 */
export function FinalCta() {
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [size, setSize] = useState(CAMPUS_SIZES[1]);
  const [handedOff, setHandedOff] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent(
      `Walkthrough request — ${institution || "our campus"}`,
    );
    const body = encodeURIComponent(
      [
        "Hi Track Attend team,",
        "",
        "We would like a walkthrough of Track Attend.",
        "",
        `Institution: ${institution || "(not specified)"}`,
        `Campus size: ${size}`,
        `Reply to: ${email || "(email above)"}`,
        "",
        "Please share: a rollout plan and how you migrate our existing registers.",
        "",
        "Thanks!",
      ].join("\n"),
    );

    window.location.href = `mailto:${contact.salesEmail}?subject=${subject}&body=${body}`;
    setHandedOff(true);
  };

  return (
    <section
      id="get-started"
      aria-labelledby="cta-heading"
      className="relative scroll-mt-28 pb-24 pt-4 sm:pb-28"
    >
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.25rem] bg-ink px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-grid-dark opacity-35 mask-fade-y"
            />
            <div
              aria-hidden="true"
              className="glow-blob left-[-6rem] top-[-4rem] h-80 w-80 bg-brand-500/40 motion-safe:animate-float"
            />
            <div
              aria-hidden="true"
              className="glow-blob right-[-4rem] bottom-[-6rem] h-80 w-80 bg-accent-500/30 motion-safe:animate-float-slow"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(255_255_255_/_0.35),transparent)]"
            />

            <div className="relative grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
              <div>
                <Eyebrow tone="dark">Get started</Eyebrow>
                <h2
                  id="cta-heading"
                  className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl sm:leading-[1.12]"
                >
                  Ready to close the register on manual roll calls?
                </h2>
                <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-slate-300">
                  Bring one department first — we import its registers, run a
                  live session with your faculty and send you the evidence pack
                  the same week. Most campuses are fully live before the next
                  timetable cycle.
                </p>

                <ul className="mt-8 space-y-3">
                  {[
                    "Start with one department, expand when the numbers agree",
                    "Migration of existing registers and rosters included",
                    "Onboarded by an attendance specialist, not a ticket queue",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] text-slate-200">
                      <CircleCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent-300"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-9 flex flex-wrap items-center gap-4 text-[0.875rem] text-slate-300">
                  <a
                    href={`mailto:${contact.salesEmail}`}
                    className="inline-flex min-h-7 items-center gap-2 rounded-lg transition-colors hover:text-white"
                  >
                    <Mail className="h-4 w-4 text-brand-300" aria-hidden="true" />
                    {contact.salesEmail}
                  </a>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="inline-flex min-h-7 items-center gap-2 rounded-lg transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4 text-brand-300" aria-hidden="true" />
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="glass-dark rounded-3xl p-6 sm:p-7">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-white">
                      Book a 30-minute walkthrough
                    </p>
                    <p className="text-[0.8125rem] text-slate-300">
                      Weekdays, 10 a.m. – 7 p.m. IST
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate={false}>
                  <div>
                    <label
                      htmlFor="cta-email"
                      className="block text-[0.8125rem] font-medium text-slate-200"
                    >
                      Work email
                    </label>
                    <input
                      id="cta-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="registrar@yourcollege.edu"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.06] px-3.5 py-2.5 text-[0.9375rem] text-white placeholder:text-slate-400 transition-colors duration-200 focus:border-brand-300 focus:bg-white/[0.1] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cta-institution"
                      className="block text-[0.8125rem] font-medium text-slate-200"
                    >
                      Institution
                    </label>
                    <input
                      id="cta-institution"
                      name="institution"
                      type="text"
                      placeholder="Brightwood Institute of Technology"
                      value={institution}
                      onChange={(event) => setInstitution(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.06] px-3.5 py-2.5 text-[0.9375rem] text-white placeholder:text-slate-400 transition-colors duration-200 focus:border-brand-300 focus:bg-white/[0.1] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cta-size"
                      className="block text-[0.8125rem] font-medium text-slate-200"
                    >
                      Campus size
                    </label>
                    <select
                      id="cta-size"
                      name="size"
                      value={size}
                      onChange={(event) => setSize(event.target.value)}
                      className="mt-1.5 w-full appearance-none rounded-xl border border-white/12 bg-white/[0.06] px-3.5 py-2.5 text-[0.9375rem] text-white transition-colors duration-200 focus:border-brand-300 focus:bg-white/[0.1] focus:outline-none"
                    >
                      {CAMPUS_SIZES.map((option) => (
                        <option key={option} value={option} className="text-slate-900">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="onDark"
                    size="md"
                    fullWidth
                    trailingIcon={<ArrowRight />}
                  >
                    Request a walkthrough
                  </Button>

                  <p aria-live="polite" className="min-h-[1.25rem] text-[0.8125rem] text-slate-300">
                    {handedOff
                      ? "Thanks — your mail app is opening with the brief pre-filled. If nothing happened, email us directly."
                      : "We reply within one working day. No drip campaigns, ever."}
                  </p>
                </form>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                  <Button href="/login" variant="ghostDark" size="sm">
                    Already a customer? Sign in
                  </Button>
                  <span className="text-[0.75rem] text-slate-400">
                    Bring your timetable and your register — that is all we need
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
