import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SiteLink } from "@/components/ui/SiteLink";
import { Container } from "@/components/ui/Container";
import { contact, footerColumns } from "@/content/landing";

/** Brand marks are inlined: lucide dropped brand icons, and we only need four. */
const SOCIALS = [
  {
    label: "Track Attend on LinkedIn",
    href: "https://www.linkedin.com/",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.65 8.75 21.4 11.25 21.4 14.5V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21H9V9Z",
  },
  {
    label: "Track Attend on X",
    href: "https://x.com/",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z",
  },
  {
    label: "Track Attend on YouTube",
    href: "https://www.youtube.com/",
    path: "M21.6 7.2c-.23-.86-.9-1.53-1.76-1.76C18.25 5 12 5 12 5s-6.25 0-7.84.44c-.86.23-1.53.9-1.76 1.76C2 8.8 2 12 2 12s0 3.2.44 4.8c.23.86.9 1.53 1.76 1.76C5.75 19 12 19 12 19s6.25 0 7.84-.44c.86-.23 1.53-.9 1.76-1.76.44-1.6.44-4.8.44-4.8s0-3.2-.44-4.8ZM10 15V9l5.2 3-5.2 3Z",
  },
];

const CONTACTS = [
  { icon: Mail, label: contact.salesEmail, href: `mailto:${contact.salesEmail}` },
  {
    icon: Phone,
    label: contact.phone,
    href: `tel:${contact.phone.replace(/\s/g, "")}`,
  },
  { icon: MapPin, label: contact.address, href: undefined },
];

/**
 * Site footer: brand + contact, the three link columns, and a small
 * status/legal bar. Policy pages are intentionally omitted rather than
 * linking to routes that do not exist yet.
 */
export function SiteFooter() {
  return (
    <footer className="relative border-t border-slate-900/[0.07] bg-white/70">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div>
            <Logo size={36} />
            <p className="mt-5 max-w-sm text-[0.875rem] leading-relaxed text-slate-600">
              Track Attend is the attendance record colleges actually trust —
              live QR check-ins, semester analytics, early shortage alerts and
              accreditation-ready reports in one system.
            </p>

            <ul className="mt-6 space-y-3">
              {CONTACTS.map(({ icon: Icon, label, href }) => (
                <li key={label} className="flex gap-2.5 text-[0.8125rem] text-slate-600">
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                    aria-hidden="true"
                  />
                  {href ? (
                    // inline-flex + min-h-7 keeps the touch target at the WCAG
                    // 24px minimum without disturbing the list rhythm.
                    <a
                      href={href}
                      className="-my-1 inline-flex min-h-7 items-center rounded transition-colors hover:text-brand-700"
                    >
                      {label}
                    </a>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-5 text-[0.75rem] text-slate-500">{contact.hours}</p>

            <ul className="mt-6 flex gap-2">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-500 ring-1 ring-inset ring-slate-900/[0.07] transition-[color,transform,box-shadow] duration-200 ease-brand hover:text-brand-700 hover:shadow-card motion-safe:hover:-translate-y-0.5"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                      <path d={social.path} fill="currentColor" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {column.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) =>
                  !link.external ? (
                    <li key={link.label}>
                      <SiteLink
                        href={link.href}
                        className="-my-1 inline-flex min-h-7 items-center rounded text-[0.875rem] text-slate-600 transition-colors hover:text-brand-700"
                      >
                        {link.label}
                      </SiteLink>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="-my-1 inline-flex min-h-7 items-center rounded text-[0.875rem] text-slate-600 transition-colors hover:text-brand-700"
                      >
                        {link.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <div className="border-t border-slate-900/[0.07]">
        <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-slate-500">
            © {new Date().getFullYear()} Track Attend Labs Pvt. Ltd. · Built for
            campuses across India · Data hosted in the India region
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/api/health"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[0.75rem] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100 transition-colors hover:bg-emerald-100"
            >
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 motion-safe:animate-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Service status
            </a>
            <SiteLink
              href="/design-system"
              className="inline-flex min-h-7 items-center rounded text-[0.8125rem] text-slate-600 transition-colors hover:text-brand-700"
            >
              Design system
            </SiteLink>
            <SiteLink
              href="#top"
              className="inline-flex min-h-7 items-center gap-1.5 rounded text-[0.8125rem] text-slate-600 transition-colors hover:text-brand-700"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </SiteLink>
          </div>
        </Container>
      </div>
    </footer>
  );
}
