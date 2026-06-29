import { Metadata } from "next";
import { PricingPageClient } from "@/features/pricing/components/PricingPageClient";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const params = await searchParams;
  return <PricingPageClient highlightedPlan={params.plan} />;
}
