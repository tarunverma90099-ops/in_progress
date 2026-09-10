"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export interface SiteLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

/**
 * Resolves in-page anchors against the current route.
 *
 * `#features` only works while the landing page is mounted; rendered from
 * /design-system or a future /docs page it would silently do nothing. This
 * wrapper turns it into `/#features` off the landing page and leaves it alone
 * (so the browser smooth-scrolls without a navigation) when already there.
 */
export function SiteLink({ href, children, className, ...aria }: SiteLinkProps) {
  const pathname = usePathname();
  const isHash = href.startsWith("#");
  const isHome = pathname === "/";
  const resolved = isHash && !isHome ? `/${href}` : href;

  return (
    <Link href={resolved} className={className} {...aria}>
      {children}
    </Link>
  );
}
