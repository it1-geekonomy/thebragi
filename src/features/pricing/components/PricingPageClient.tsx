"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlanCard } from "@/features/pricing/components/PlanCard";
import { PlanComparisonTable } from "@/features/pricing/components/PlanComparisonTable";
import { PricingFAQ } from "@/features/pricing/components/PricingFAQ";
import { usePlans } from "@/features/pricing/hooks/usePlans";
import { ROUTES } from "@/config/routes";
import { Alert } from "@/shared/components/ui/Alert";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { Toggle } from "@/shared/components/ui/Toggle";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";

type BillingCycle = "monthly" | "annual";

function PlanSkeletons() {
  return (
    <div className="mx-auto mt-10 grid max-w-7xl gap-5 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="p-6">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="mt-4 h-16 w-full" />
          <Skeleton className="mt-6 h-10 w-44" />
          <div className="mt-6 grid gap-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
          </div>
          <Skeleton className="mt-7 h-12 w-full" />
        </Card>
      ))}
    </div>
  );
}

export function PricingPageClient({ highlightedPlan }: { highlightedPlan?: string }) {
  const { plans, isLoading, error } = usePlans();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const selectedPlan = useMemo(() => plans.find((plan) => plan.slug === highlightedPlan), [highlightedPlan, plans]);

  useEffect(() => {
    if (!highlightedPlan) return;
    const element = document.getElementById(highlightedPlan);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedPlan, plans.length]);

  return (
    <main className="bg-black text-white">
      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Badge>Plan-first signup</Badge>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Pricing</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">Choose the Bragi plan that matches how your team works today.</h1>
            </div>
            <div>
              <p className="text-base leading-8 text-white/60 sm:text-lg">Start with sales, delivery, or the complete workspace. The checkout path begins after a plan is selected, so the buying flow stays clear.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Toggle pressed={billingCycle === "monthly"} onClick={() => setBillingCycle("monthly")}>Monthly</Toggle>
                <Toggle pressed={billingCycle === "annual"} onClick={() => setBillingCycle("annual")}>Annual preview</Toggle>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {error ? <Alert tone="info">{error}</Alert> : null}
          {selectedPlan ? <Alert tone="success" className="mt-4">Focused plan: {selectedPlan.name}. Use Buy now to continue into checkout.</Alert> : null}
        </div>
        {isLoading ? (
          <PlanSkeletons />
        ) : plans.length === 0 ? (
          <div className="mx-auto mt-10 max-w-7xl text-center py-16">
            <p className="text-lg text-white/60">No plans available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className={`mx-auto mt-10 grid max-w-7xl gap-5 ${plans.length >= 3 ? 'lg:grid-cols-3' : plans.length === 2 ? 'lg:grid-cols-2 max-w-4xl' : 'max-w-lg'}`}>
            {plans.map((plan) => <PlanCard key={plan.slug} plan={plan} billingCycle={billingCycle} highlighted={highlightedPlan === plan.slug || (!highlightedPlan && plan.popular)} />)}
          </div>
        )}
        <p className="mx-auto mt-6 max-w-7xl text-xs leading-5 text-white/38">All prices shown in INR. Billed monthly unless annual preview is selected. Terms apply.</p>
      </section>

      <section className="border-y border-white/10 bg-[#050705] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Comparison</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Compare core plan access</h2>
            </div>
            {plans.length > 0 && <Link className="text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.checkout(plans[plans.length - 1].slug)}>Buy {plans[plans.length - 1].name}</Link>}
          </div>
          <PlanComparisonTable />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="FAQ" title="Questions before checkout">
          Pricing is intentionally simple in this frontend phase. Commerce wiring can plug into these states later.
        </SectionHeading>
        <div className="mx-auto mt-10 max-w-4xl"><PricingFAQ /></div>
      </section>
    </main>
  );
}
