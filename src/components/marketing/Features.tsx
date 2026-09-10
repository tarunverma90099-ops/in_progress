import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/Card";
import { features, type Feature } from "@/content/landing";
import { FEATURE_VISUALS } from "./mockups/FeatureVisuals";
import { cn } from "@/lib/cn";

const ACCENTS: Record<Feature["accent"], string> = {
  brand: "bg-brand-50 text-brand-600 ring-brand-100",
  accent: "bg-accent-50 text-accent-700 ring-accent-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Visual = FEATURE_VISUALS[feature.visual];
  const Icon = feature.icon;

  return (
    <Reveal
      delay={index * 70}
      className={cn(
        "h-full",
        feature.span === "wide" ? "lg:col-span-3" : "lg:col-span-2 lg:col-start-auto",
      )}
    >
      <SpotlightCard className="flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-11 w-11 place-items-center rounded-2xl ring-1 ring-inset transition-transform duration-300 ease-brand motion-safe:group-hover/card:scale-105",
              ACCENTS[feature.accent],
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
            0{index + 1}
          </span>
        </div>

        <h3 className="mt-5 text-[1.1875rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-xl">
          {feature.title}
        </h3>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
          {feature.description}
        </p>

        <ul className="mt-5 space-y-2.5">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2.5 text-[0.875rem] text-slate-600">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 border-t border-dashed border-slate-900/10 pt-6">
          <Visual />
        </div>
      </SpotlightCard>
    </Reveal>
  );
}

/**
 * Feature bento: two wide cards on the top row, three narrower ones beneath.
 */
export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative scroll-mt-28 py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="glow-blob left-[-8rem] top-1/3 h-80 w-80 bg-brand-300/30" />
        <div className="glow-blob right-[-6rem] top-2/3 h-72 w-72 bg-accent-300/25" />
      </div>

      <Container>
        <Reveal>
          <SectionHeading
            id="features-heading"
            eyebrow="The platform"
            title="Everything attendance needs — and nothing it doesn't"
            description="Five jobs, done properly: capture the session, make sense of the numbers, warn the right people early, produce evidence for the council, and keep every role inside its own lane."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
