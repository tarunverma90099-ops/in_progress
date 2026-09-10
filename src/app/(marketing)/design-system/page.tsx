import type { Metadata } from "next";
import { ArrowRight, Mail, Search, Sparkles } from "lucide-react";
import { Badge, Eyebrow } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard, SpotlightCard, Surface } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { testimonials } from "@/content/landing";

export const metadata: Metadata = {
  title: "Design system",
  description:
    "Tokens, components and motion primitives behind Track Attend — shared by the marketing site, dashboards and reports.",
  robots: { index: false, follow: false },
};

const BRAND_RAMP = [
  ["brand-50", "#eef2ff"],
  ["brand-100", "#e0e7ff"],
  ["brand-200", "#c7d2fe"],
  ["brand-300", "#a5b4fc"],
  ["brand-400", "#818cf8"],
  ["brand-500", "#6366f1"],
  ["brand-600", "#4f46e5"],
  ["brand-700", "#4338ca"],
  ["brand-800", "#3730a3"],
  ["brand-900", "#312e81"],
  ["brand-950", "#1e1b4b"],
];

const ACCENT_RAMP = [
  ["accent-50", "#ecfeff"],
  ["accent-100", "#cffafe"],
  ["accent-300", "#67e8f9"],
  ["accent-400", "#22d3ee"],
  ["accent-500", "#06b6d4"],
  ["accent-600", "#0891b2"],
  ["accent-700", "#0e7490"],
];

const STATUS = [
  ["Present", "#059669", "bg-status-present"],
  ["Absent", "#e11d48", "bg-status-absent"],
  ["Leave", "#d97706", "bg-status-leave"],
];

const TYPE_SCALE = [
  { name: "Display / hero", className: "text-[2.5rem] leading-[1.05] tracking-[-0.04em] sm:text-[3.5rem]", sample: "Attendance in seconds." },
  { name: "Heading 2 / section", className: "text-3xl tracking-[-0.03em] sm:text-4xl", sample: "Three dashboards, one record" },
  { name: "Heading 3 / card", className: "text-xl tracking-[-0.02em]", sample: "Analytics your HoD opens" },
  { name: "Body / lead", className: "text-[1.0625rem] leading-relaxed text-slate-600", sample: "Live QR check-ins, semester analytics and shortage alerts in one system." },
  { name: "Body / default", className: "text-[0.9375rem] leading-relaxed text-slate-600", sample: "Roster, per-student history and CSV download at hand." },
  { name: "Caption / meta", className: "text-[0.8125rem] text-slate-500", sample: "Updated 2 minutes ago · Semester 5" },
  { name: "Mono / data", className: "font-mono text-[0.9375rem] text-slate-700", sample: "DC-4F19 · 09:02:11" },
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 py-12 sm:py-14">
      <SectionHeading
        id={`${id}-heading`}
        align="left"
        eyebrow="Design system"
        title={title}
        description={description}
      />
      <div className="mt-8">{children}</div>
    </section>
  );
}

/**
 * Living styleguide. Kept inside the app (rather than Storybook) so it always
 * reflects the shipped components, and so designers can point engineers at a
 * route when a token is disputed.
 */
export default function DesignSystemPage() {
  return (
    <Container className="max-w-6xl pb-24 pt-32 sm:pt-36">
      <header className="max-w-3xl">
        <Eyebrow>Internal</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-slate-900 sm:text-5xl">
          The Track Attend design system
        </h1>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-slate-600">
          One token set and one component library shared by the marketing site,
          the faculty dashboard and the report printouts. Everything here is
          rendered from the same source that ships in production — if a value
          changes, it changes on this page too.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button href="/" variant="secondary" size="md" leadingIcon={<ArrowRight className="rotate-180" />}>
            Back to landing page
          </Button>
          <Button href="#tokens" variant="ghost" size="md">
            Jump to tokens
          </Button>
        </div>
      </header>

      <Section
        id="colour"
        title="Colour"
        description="Brand indigo drives primary actions and data. Accent cyan is reserved for live states and secondary series. Status colours are semantic: present, absent, leave."
      >
        <div className="space-y-8">
          <div>
            <p className="text-[0.8125rem] font-semibold text-slate-700">Brand ramp</p>
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
              {BRAND_RAMP.map(([name, hex]) => (
                <li key={name}>
                  <span
                    className="block h-14 w-full rounded-xl ring-1 ring-inset ring-slate-900/10"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="mt-2 block text-[0.6875rem] font-medium text-slate-600">
                    {name}
                  </span>
                  <span className="block font-mono text-[0.625rem] text-slate-500">
                    {hex}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-[0.8125rem] font-semibold text-slate-700">
                Accent ramp
              </p>
              <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {ACCENT_RAMP.map(([name, hex]) => (
                  <li key={name}>
                    <span
                      className="block h-12 w-full rounded-xl ring-1 ring-inset ring-slate-900/10"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="mt-2 block text-[0.625rem] font-medium text-slate-600">
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[0.8125rem] font-semibold text-slate-700">
                Attendance status
              </p>
              <ul className="mt-3 flex flex-wrap gap-3">
                {STATUS.map(([label, hex, className]) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-900/[0.07]"
                  >
                    <span className={`h-3 w-3 rounded-full ${className}`} aria-hidden="true" />
                    <span className="text-[0.8125rem] font-medium text-slate-700">
                      {label}
                    </span>
                    <span className="font-mono text-[0.6875rem] text-slate-500">{hex}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="typography"
        title="Typography"
        description="Inter Variable with optical sizing for text, Geist Mono for codes, roll numbers and timestamps so digits always align."
      >
        <Surface className="divide-y divide-slate-900/[0.06] p-6 sm:p-8">
          {TYPE_SCALE.map((row) => (
            <div key={row.name} className="grid gap-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {row.name}
              </p>
              <p className={row.className}>{row.sample}</p>
            </div>
          ))}
        </Surface>
      </Section>

      <Section
        id="components"
        title="Components"
        description="Buttons, badges and inputs. Every interactive element has a visible focus ring, a 44px minimum touch target and a disabled state."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <Surface className="p-6">
            <p className="text-[0.8125rem] font-semibold text-slate-700">Buttons</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button trailingIcon={<ArrowRight />}>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="dark">Dark</Button>
              <Button variant="danger">Destructive</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg" leadingIcon={<Sparkles />}>
                Large
              </Button>
            </div>
            <p className="mt-4 text-[0.8125rem] text-slate-500">
              Hover lifts by 1px; the arrow icon nudges right. Both are disabled
              under <code className="font-mono text-[0.75rem]">prefers-reduced-motion</code>.
            </p>
          </Surface>

          <Surface className="p-6">
            <p className="text-[0.8125rem] font-semibold text-slate-700">
              Badges &amp; chips
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Badge tone="brand" icon={<Sparkles />}>
                Most popular
              </Badge>
              <Badge tone="success">Present</Badge>
              <Badge tone="danger">Absent</Badge>
              <Badge tone="warning">Below 75%</Badge>
              <Badge tone="neutral">Leave</Badge>
              <Badge tone="dark">Live session</Badge>
            </div>

            <p className="mt-8 text-[0.8125rem] font-semibold text-slate-700">Inputs</p>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="ds-email" className="block text-[0.8125rem] font-medium text-slate-700">
                  Work email
                </label>
                <input
                  id="ds-email"
                  type="email"
                  placeholder="registrar@yourcollege.edu"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[0.9375rem] text-slate-800 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="ds-search" className="block text-[0.8125rem] font-medium text-slate-700">
                  Search students
                </label>
                <div className="relative mt-1.5">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="ds-search"
                    type="search"
                    placeholder="Roll number, name or course"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-[0.9375rem] text-slate-800 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <p className="flex items-center gap-2 text-[0.8125rem] text-slate-500">
                <Mail className="h-4 w-4 text-brand-600" aria-hidden="true" />
                Dark surfaces use the{" "}
                <code className="font-mono text-[0.75rem]">.glass-dark</code> input
                treatment (see the closing CTA).
              </p>
            </div>
          </Surface>
        </div>
      </Section>

      <Section
        id="surfaces"
        title="Surfaces & elevation"
        description="Three surface treatments: opaque cards for dense internal pages, frosted glass over gradients, and inverted ink panels for emphasis."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <Surface className="p-6">
            <p className="text-[0.9375rem] font-semibold text-slate-900">Surface</p>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-slate-600">
              Default card for dashboards, tables and reports. Hairline ring,
              soft shadow, 24px radius.
            </p>
          </Surface>

          <GlassCard className="p-6">
            <p className="text-[0.9375rem] font-semibold text-slate-900">Glass</p>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-slate-600">
              Frosted with 18px blur and saturation. Used for the sticky nav,
              floating product cards and form panels over gradients.
            </p>
          </GlassCard>

          <SpotlightCard className="p-6">
            <p className="text-[0.9375rem] font-semibold text-slate-900">
              Spotlight card
            </p>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-slate-600">
              Adds a pointer-tracked radial highlight. Move your cursor across
              this card to see it — no re-render, just two CSS variables.
            </p>
          </SpotlightCard>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white">
            <span className="text-[0.9375rem] font-semibold">Ink panel</span>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-slate-300">
              Inverted surface for outcomes, analytics emphasis and the closing
              CTA. Pair with <code className="font-mono text-[0.75rem]">bg-grid-dark</code>{" "}
              and glow blobs at low opacity.
            </p>
          </div>
          <Surface className="p-6">
            <p className="text-[0.9375rem] font-semibold text-slate-900">Data display</p>
            <div className="mt-4 flex h-24 items-end gap-2">
              {[42, 58, 51, 66, 72, 64, 78, 84, 76, 90].map((value, index) => (
                <span
                  key={index}
                  className="spark-bar w-full rounded-t-[4px] bg-[linear-gradient(180deg,var(--color-brand-400),var(--color-brand-600))]"
                  style={{ height: `${value}%`, animationDelay: `${index * 60}ms` }}
                />
              ))}
            </div>
            <p className="mt-4 text-[0.875rem] text-slate-600">
              Static count:{" "}
              <CountUp value={1847} className="font-semibold text-slate-900" />{" "}
              check-ins · live count when scrolled into view.
            </p>
          </Surface>
        </div>
      </Section>

      <Section
        id="motion"
        title="Motion"
        description="Reveal, stagger and ambient float. Durations stay between 200ms and 750ms, easing is a single brand curve, and every effect collapses under prefers-reduced-motion."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {(["up", "left", "right"] as const).map((direction, index) => (
            <Reveal key={direction} direction={direction} delay={index * 80}>
              <Surface className="p-6">
                <p className="text-[0.9375rem] font-semibold text-slate-900">
                  direction=&quot;{direction}&quot;
                </p>
                <p className="mt-2 text-[0.875rem] text-slate-600">
                  Scroll this card out of view and back to replay the entrance.
                </p>
              </Surface>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} className="mt-5">
          <Surface className="p-6">
            <p className="text-[0.875rem] font-semibold text-slate-700">Quote card recipe</p>
            <figure className="mt-3 max-w-2xl">
              <blockquote className="text-[0.9375rem] leading-relaxed text-slate-600">
                <p>&ldquo;{testimonials[2].quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-3 text-[0.8125rem] text-slate-500">
                {testimonials[2].name} · {testimonials[2].role}
              </figcaption>
            </figure>
          </Surface>
        </Reveal>
      </Section>

      <Section
        id="accessibility"
        title="Accessibility rules"
        description="WCAG AA is the floor, not the goal. These constraints are enforced in code review."
      >
        <Surface className="p-6 sm:p-8">
          <ul className="grid gap-4 text-[0.9375rem] text-slate-600 sm:grid-cols-2">
            {[
              "Body text is slate-700 on canvas (13.4:1) and slate-300 on ink (11.2:1) — both well past AA.",
              "Focus is always visible: a 2px brand-600 ring with 2px offset, never removed.",
              "Every animation respects prefers-reduced-motion, including the marquee and scanline.",
              "Colour never carries meaning alone — attendance states pair colour with a label or icon.",
              "Interactive targets are at least 44×44px on touch layouts.",
              "Decorative product mocks are exposed as one labelled image, not as unreadable DOM.",
            ].map((rule) => (
              <li key={rule} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                />
                {rule}
              </li>
            ))}
          </ul>
        </Surface>
      </Section>
    </Container>
  );
}
