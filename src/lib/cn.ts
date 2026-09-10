/**
 * Tiny class-name joiner.
 *
 * The app deliberately avoids a `clsx`/`tailwind-merge` dependency: our
 * component APIs accept `className` as an additive escape hatch (never an
 * override of an internal class), so plain filtering is enough.
 */
export type ClassValue = string | number | boolean | bigint | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
