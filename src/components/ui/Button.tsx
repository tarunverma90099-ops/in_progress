import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "ghostDark"
  | "dark"
  | "onDark"
  | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold tracking-[-0.01em] " +
  "transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-brand " +
  "disabled:pointer-events-none disabled:opacity-55 " +
  "motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0";

const VARIANTS: Record<Variant, string> = {
  primary:
    "text-white shadow-glow bg-[linear-gradient(180deg,var(--color-brand-500),var(--color-brand-700))] " +
    "ring-1 ring-inset ring-white/20 hover:brightness-[1.07] hover:shadow-[0_28px_64px_-26px_rgb(79_70_229_/_0.72)] " +
    "active:brightness-100",
  secondary:
    "bg-white text-slate-900 ring-1 ring-slate-900/10 shadow-card hover:ring-brand-300 hover:text-brand-700 " +
    "hover:shadow-[0_18px_44px_-24px_rgb(49_46_129_/_0.45)]",
  ghost:
    "text-slate-600 hover:bg-slate-900/[0.045] hover:text-slate-900",
  ghostDark:
    "text-slate-200 hover:bg-white/10 hover:text-white",
  dark:
    "bg-ink text-white ring-1 ring-inset ring-white/10 hover:bg-ink-soft shadow-card",
  onDark:
    "bg-white text-ink ring-1 ring-inset ring-white/60 hover:bg-brand-50 shadow-lift",
  danger:
    "bg-rose-600 text-white shadow-[0_18px_40px_-22px_rgb(225_29_72_/_0.65)] hover:bg-rose-700",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.9375rem] sm:h-[3.25rem] sm:px-7",
};

export interface ButtonProps {
  children: ReactNode;
  /** Renders a `next/link` anchor instead of a `<button>`. */
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  id?: string;
  target?: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | boolean;
}

/**
 * The single button primitive for the design system.
 *
 * Variants are intentionally few: `primary` (brand gradient), `secondary`
 * (glass white), `ghost`, `ghostDark` and `onDark` (for ink panels), `dark`
 * and `danger` (destructive dashboard actions). Do not try to recolour a
 * variant from the outside — the variant's own utility wins on stylesheet
 * order — add a variant instead.
 */
export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  leadingIcon,
  trailingIcon,
  fullWidth,
  type = "button",
  disabled,
  id,
  target,
  rel,
  onClick,
  ...aria
}: ButtonProps) {
  const classes = cn(
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <>
      {leadingIcon ? (
        <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {trailingIcon ? (
        <span
          className="shrink-0 transition-transform duration-200 ease-brand motion-safe:group-hover/btn:translate-x-0.5 [&_svg]:h-4 [&_svg]:w-4"
          aria-hidden="true"
        >
          {trailingIcon}
        </span>
      ) : null}
    </>
  );

  if (href) {
    const isExternal = /^(https?:|mailto:|tel:)/.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          id={id}
          target={target}
          rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
          className={classes}
          onClick={onClick}
          {...aria}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} id={id} className={classes} onClick={onClick} {...aria}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      id={id}
      disabled={disabled}
      className={classes}
      onClick={onClick}
      {...aria}
    >
      {content}
    </button>
  );
}
