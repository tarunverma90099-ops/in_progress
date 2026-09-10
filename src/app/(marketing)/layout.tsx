import type { ReactNode } from "react";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

/**
 * Marketing chrome: progress bar, sticky nav, footer.
 * The `#main` landmark is what the root skip-link targets.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <SiteNav />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
