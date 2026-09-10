import { Check, Plug } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Badge";
import { audiences, integrations, outcomes, type Audience } from "@/content/landing";
import { cn } from "@/lib/cn";

const ACCENTS: Record<Audience["accent"], { tile: string; rule: string }> = {
  brand: {
    tile: "bg-brand-50 text-brand-600 ring-brand-100",
    rule: "from-brand-500 to-brand-300",
  },
  accent: {
    tile: "bg-accent-50 text-accent-700 ring-accent-100",
    rule: "from-accent-500 to-accent-300",
  },
  emerald: {
    tile: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    rule: "from-emerald-500 to-emerald-300",
  },
};

/**
 * Benefits by role — the three audiences the product is designed around —
 * followed by an outcomes band and the integration surface.
 */
export function Audiences() {
  return (
    <section
      id="audiences"
      aria-labelledby="audiences-heading"
      className="relative scroll-mt-28 py-20 sm:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="audiences-heading"
            eyebrow="Built for every role"
            title="Three dashboards, one shared record"
            description="Nobody needs the whole campus in their face. Track Attend gives each role the slice it acts on, and keeps one immutable record underneath."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            const accent = ACCENTS[audience.accent];
            return (
              <Reveal key={audience.id} delay={index * 90} className="h-full">
                <SpotlightCard glassy className="flex h-full flex-col p-6 sm:p-7">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-70",
                      accent.rule,
                    )}
                  />
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-2xl ring-1 ring-inset",
                        accent.tile,
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {audience.role}
                    </p>
                  </div>

                  <h3 className="mt-5 text-[1.1875rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-xl">
                    {audience.title}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
                    {audience.subtitle}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {audience.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-[0.875rem] text-slate-600">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    <div className="rounded-2xl bg-white/70 px-4 py-3.5 ring-1 ring-inset ring-slate-900/[0.06]">
                      <p className="text-lg font-semibold tracking-[-0.02em] text-slate-900">
                        {audience.metric.value}
                      </p>
                      <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate-500">
                        {audience.metric.label}
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120} className="mt-14">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 sm:px-10 sm:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40 mask-fade-y"
            />
            <div
              aria-hidden="true"
              className="glow-blob left-[-4rem] top-[-2rem] h-64 w-64 bg-brand-500/45 motion-safe:animate-float"
            />
            <div
              aria-hidden="true"
              className="glow-blob right-[-3rem] bottom-[-4rem] h-72 w-72 bg-accent-500/30 motion-safe:animate-float-slow"
            />

            <div className="relative grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
              <div>
                <Eyebrow tone="dark">Outcomes, not adjectives</Eyebrow>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.025em] text-white sm:text-[1.75rem]">
                  What campuses report after a full year
                </h3>
                <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-slate-300">
                  Aggregated across institutions that moved from paper registers
                  to Track Attend, measured over two academic sessions.
                </p>

                <div className="mt-8">
                  <p className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-200">
                    <Plug className="h-3.5 w-3.5" aria-hidden="true" />
                    Plays well with your stack
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {integrations.map((integration) => (
                      <li
                        key={integration.name}
                        className="glass-dark rounded-xl px-3 py-2 text-[0.8125rem] text-slate-200"
                      >
                        <span className="font-medium text-white">
                          {integration.name}
                        </span>
                        <span className="ml-2 text-slate-400">
                          {integration.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
                {outcomes.map(({ icon: Icon, value, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/10 backdrop-blur-sm"
                  >
                    <Icon className="h-4 w-4 text-accent-300" aria-hidden="true" />
                    <dt className="sr-only">{label}</dt>
                    <dd>
                      <span className="mt-3 block text-2xl font-semibold tracking-[-0.03em] text-white tabular-nums">
                        {value}
                      </span>
                      <span className="mt-1.5 block text-[0.8125rem] leading-snug text-slate-300">
                        {label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
