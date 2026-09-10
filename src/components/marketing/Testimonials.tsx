import { Quote, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials, type Testimonial } from "@/content/landing";
import { cn } from "@/lib/cn";

function Stars({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex gap-0.5", className)}
      role="img"
      aria-label="Rated 5 out of 5 by this customer"
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-[linear-gradient(150deg,var(--color-brand-600),var(--color-brand-800))] font-semibold text-white",
        className,
      )}
    >
      {initials}
    </span>
  );
}

function Attribution({ item, large }: { item: Testimonial; large?: boolean }) {
  return (
    <figcaption className="mt-6 flex items-center gap-3">
      <Avatar initials={item.initials} className={large ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"} />
      {/* Deliberately not truncated: `truncate` sets white-space:nowrap, which
          makes the card's min-content width as wide as the longest line and
          pushes the whole grid past the viewport on phones. */}
      <span className="min-w-0">
        <span className="block text-[0.9375rem] font-semibold text-slate-900">
          {item.name}
        </span>
        <span className="block text-[0.8125rem] text-slate-500">{item.role}</span>
        <span className="block text-[0.75rem] text-slate-500">{item.org}</span>
      </span>
    </figcaption>
  );
}

function TestimonialCard({
  item,
  featured = false,
  className,
}: {
  item: Testimonial;
  featured?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-[transform,box-shadow] duration-300 ease-brand motion-safe:hover:-translate-y-1 sm:p-7",
        featured
          ? "bg-[linear-gradient(160deg,#ffffff,rgb(238_242_255_/_0.9))] ring-1 ring-brand-100 shadow-lift"
          : "bg-white ring-1 ring-slate-900/[0.07] shadow-card hover:shadow-lift",
        className,
      )}
    >
      <Quote
        className={cn(
          "absolute -right-2 -top-2 h-16 w-16 text-brand-500/[0.07] transition-transform duration-500 ease-brand motion-safe:group-hover:scale-110",
          featured && "h-24 w-24 text-brand-500/[0.09]",
        )}
        aria-hidden="true"
      />

      <Stars />

      <blockquote
        className={cn(
          "mt-5 text-slate-700",
          featured
            ? "text-[1.0625rem] leading-relaxed sm:text-[1.1875rem] sm:leading-[1.65]"
            : "text-[0.9375rem] leading-relaxed",
        )}
      >
        <p>&ldquo;{item.quote}&rdquo;</p>
      </blockquote>

      <div className="mt-auto">
        {item.stat ? (
          <div
            className={cn(
              "mt-6 inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-2xl px-4 py-3",
              featured
                ? "bg-white/80 ring-1 ring-inset ring-brand-100"
                : "bg-slate-900/[0.035]",
            )}
          >
            <span className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-brand-700">
              {item.stat.value}
            </span>
            <span className="text-[0.8125rem] text-slate-600">{item.stat.label}</span>
          </div>
        ) : null}

        <Attribution item={item} large={featured} />
      </div>
    </figure>
  );
}

/**
 * Customer stories: one featured quote carrying the accreditation outcome,
 * four supporting voices from faculty, students and the dean's office.
 */
export function Testimonials() {
  const [featured, ...rest] = testimonials;

  return (
    <section
      id="customers"
      aria-labelledby="customers-heading"
      className="relative scroll-mt-28 py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="glow-blob right-[-8rem] top-24 h-80 w-80 bg-violet-300/25" />
      </div>

      <Container>
        <Reveal>
          <SectionHeading
            id="customers-heading"
            eyebrow="Customer stories"
            title="What campuses say after a full semester"
            description="Registrars, HoDs, faculty and students — the four people who lived with the old register."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Reveal className="h-full lg:col-span-2">
            <TestimonialCard item={featured} featured className="h-full" />
          </Reveal>

          {rest.map((item, index) => (
            <Reveal key={item.id} delay={(index + 1) * 80} className="h-full">
              <TestimonialCard item={item} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
