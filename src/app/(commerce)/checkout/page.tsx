import { Metadata } from "next";
import { CheckoutStepper } from "@/features/checkout/components/CheckoutStepper";
import { PlanSummaryPanel } from "@/features/checkout/components/PlanSummaryPanel";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Bragi checkout flow.",
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
      <PlanSummaryPanel planSlug={params.plan} />
      <CheckoutStepper planSlug={params.plan} />
    </main>
  );
}
