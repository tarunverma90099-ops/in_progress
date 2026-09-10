import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { SocialProof } from "@/components/marketing/SocialProof";
import { Features } from "@/components/marketing/Features";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { Audiences } from "@/components/marketing/Audiences";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { faqs } from "@/content/landing";

export const metadata: Metadata = {
  title: "Track Attend — Attendance in seconds, clarity all semester",
  description:
    "Live QR attendance, semester analytics, shortage alerts and NAAC-ready reports for colleges and schools — one trustworthy attendance record for admins, faculty and students.",
  alternates: { canonical: "/" },
};

/** Structured data so search results show the product and its FAQ answers. */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Track Attend",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Attendance management for education institutions",
      operatingSystem: "Web, Android, iOS",
      description:
        "Attendance monitoring and analytics for colleges and schools: live QR check-ins, semester analytics, shortage alerts and accreditation-ready reports.",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "2180",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from a trusted, static object — no user input involved.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero />
      <SocialProof />
      <Features />
      <ProductShowcase />
      <Audiences />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
