import { Metadata } from "next";
import dynamic from "next/dynamic";
import { parseCheckoutParams } from "@/features/checkout/lib/checkout-params";

const BillingCheckout = dynamic(
  () => import("@/features/checkout/components/BillingCheckout").then((mod) => mod.BillingCheckout),
  {
    loading: () => <div className="min-h-[36rem] animate-pulse rounded-lg bg-white/[0.04]" aria-busy="true" />,
  },
);

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Bragi checkout flow.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; users?: string; cycle?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const initial = parseCheckoutParams(params);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <BillingCheckout initial={initial} />
    </main>
  );
}
