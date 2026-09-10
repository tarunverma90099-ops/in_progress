import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const SITE_URL = "https://trackattend.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Track Attend — Attendance in seconds, clarity all semester",
    template: "%s · Track Attend",
  },
  description:
    "Track Attend turns QR check-ins, faculty rosters and leave requests into one trustworthy attendance record — with live analytics, early alerts and NAAC-ready reports for colleges and schools.",
  applicationName: "Track Attend",
  keywords: [
    "attendance management system",
    "QR attendance",
    "college attendance software",
    "student attendance analytics",
    "NAAC attendance reports",
    "faculty attendance app",
    "75% attendance tracking",
  ],
  authors: [{ name: "Track Attend" }],
  creator: "Track Attend",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Track Attend",
    title: "Track Attend — Attendance in seconds, clarity all semester",
    description:
      "Live QR check-ins, semester analytics, shortage alerts and accreditation-ready reports. Built for college admins, faculty and students.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Attend — Attendance in seconds, clarity all semester",
    description:
      "Live QR check-ins, semester analytics, shortage alerts and accreditation-ready reports.",
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfe" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1f" },
  ],
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Reveal-on-scroll is progressive enhancement: these overrides only
            exist when scripting is off, so no DOM mutation (and no hydration
            mismatch) is needed to keep content visible. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>.reveal{opacity:1!important;transform:none!important;filter:none!important}</style>",
          }}
        />
      </head>
      <body className="bg-canvas text-slate-700 antialiased">
        <a
          href="#main"
          className="sr-only z-[70] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow-lift focus:outline-none"
        >
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
