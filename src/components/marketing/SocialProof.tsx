import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/motion/CountUp";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { institutions, proofStats } from "@/content/landing";

/**
 * Social proof: institution marquee + the four numbers campuses ask about.
 */
export function SocialProof() {
  return (
    <section
      aria-labelledby="social-proof-heading"
      className="relative border-y border-slate-900/[0.06] bg-white/70 py-14 sm:py-16"
    >
      <Container>
        <h2
          id="social-proof-heading"
          className="text-center text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Attendance teams at 128 institutions run their academic day on Track
          Attend
        </h2>
      </Container>

      <Marquee className="mt-9" speed={46} itemClassName="gap-10 pr-10 sm:gap-16 sm:pr-16">
        {institutions.map((institution) => (
          <div
            key={institution.name}
            className="flex items-center gap-3 opacity-70 transition-opacity duration-300 hover:opacity-100"
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(150deg,var(--color-brand-100),#e9d5ff)] text-[0.625rem] font-bold tracking-tight text-brand-800 ring-1 ring-inset ring-brand-900/5"
              aria-hidden="true"
            >
              {institution.initials}
            </span>
            <span className="whitespace-nowrap">
              <span className="block text-[0.875rem] font-semibold tracking-[-0.01em] text-slate-700">
                {institution.name}
              </span>
              <span className="block text-[0.75rem] text-slate-500">
                {institution.city}
              </span>
            </span>
          </div>
        ))}
      </Marquee>

      <Container className="mt-12">
        <ul className="grid gap-y-9 border-t border-slate-900/[0.07] pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          {proofStats.map((stat, index) => (
            <Reveal
              as="li"
              key={stat.label}
              delay={index * 90}
              className="lg:border-l lg:border-slate-900/[0.07] lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <p className="text-[2.25rem] font-semibold tracking-[-0.035em] text-slate-900">
                <CountUp
                  value={stat.value}
                  decimals={stat.decimals ?? 0}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-2 text-[0.9375rem] font-medium text-slate-700">
                {stat.label}
              </p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-500">
                {stat.detail}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
