"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlanCard } from "@/features/pricing/components/PlanCard";
import { PlanComparisonTable } from "@/features/pricing/components/PlanComparisonTable";
import { PricingFAQ } from "@/features/pricing/components/PricingFAQ";
import { hasActiveSubscription } from "@/features/auth/lib/subscription";
import { planCatalog, getPlanBySlug } from "@/config/plans";
import { ROUTES } from "@/config/routes";
import { useAppSelector } from "@/store/hooks";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/Button";
import { Toggle } from "@/shared/components/ui/Toggle";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";

type BillingCycle = "monthly" | "annual";

export function PricingPageClient({ highlightedPlan }: { highlightedPlan?: string }) {
  const router = useRouter();
  const session = useAppSelector((state) => state.session);
  const subscribed = session.isAuthenticated && hasActiveSubscription(session.subscriptionStatus);
  const currentPlan = subscribed ? getPlanBySlug(session.activePlan ?? undefined) : null;
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [selectedSlug, setSelectedSlug] = useState(
    () => highlightedPlan ?? getPlanBySlug().slug,
  );
  const selectedPlan = getPlanBySlug(selectedSlug);

  useEffect(() => {
    if (!highlightedPlan) return;
    setSelectedSlug(highlightedPlan);
    document.getElementById(highlightedPlan)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedPlan]);

  return (
    <main className="bg-black text-white">
      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
              1
            </span>
            <p className="text-sm font-semibold text-white">{subscribed ? "Your plan" : "Choose your plan"}</p>
          </div>

          <div className="mt-12 flex flex-col items-center text-center">
            <BragiLogo />
            <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              {subscribed ? "Your Bragi workspace is active" : "Run sales and delivery in one place"}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/58">
              {subscribed
                ? `You're on ${currentPlan?.name ?? "an active plan"}. Open the app to continue working — no need to pick a plan again.`
                : "Start free for 14 days. No card needed. Cancel any time."}
            </p>
            {subscribed ? (
              <Button className="mt-8" onClick={() => router.push(ROUTES.continue)}>
                Open workspace
              </Button>
            ) : (
              <div className="mt-8 inline-flex rounded-full border border-white/12 bg-white/[0.04] p-1">
              <Toggle
                pressed={billingCycle === "monthly"}
                onClick={() => setBillingCycle("monthly")}
                className="border-transparent"
              >
                Monthly
              </Toggle>
              <Toggle
                pressed={billingCycle === "annual"}
                onClick={() => setBillingCycle("annual")}
                className="border-transparent"
              >
                Annual — save 20%
              </Toggle>
            </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {subscribed ? (
            <Alert tone="success" className="mb-6">
              Current plan: {currentPlan?.name}. Manage billing in{" "}
              <Link className="font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.account.billing}>
                account settings
              </Link>
              .
            </Alert>
          ) : highlightedPlan ? (
            <Alert tone="success" className="mb-6">
              Focused plan: {getPlanBySlug(highlightedPlan).name}. Pick trial or buy below to continue.
            </Alert>
          ) : null}
        </div>
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {planCatalog.map((plan) => (
            <PlanCard
              key={plan.slug}
              plan={plan}
              billingCycle={billingCycle}
              selected={selectedSlug === plan.slug || (subscribed && session.activePlan === plan.slug)}
              highlighted={selectedSlug === plan.slug || (subscribed && session.activePlan === plan.slug)}
              onSelect={() => setSelectedSlug(plan.slug)}
            />
          ))}
        </div>

        {!subscribed ? (
          <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              className="inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6bad72] sm:w-auto sm:min-w-52"
              href={ROUTES.signUp(selectedPlan.slug)}
            >
              Start 14-day free trial
            </Link>
            <Link
              className="inline-flex w-full items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/8 sm:w-auto sm:min-w-36"
              href={ROUTES.checkout(selectedPlan.slug, { cycle: billingCycle })}
            >
              Buy now
            </Link>
          </div>
        ) : null}
        <p className="mx-auto mt-5 max-w-7xl text-center text-xs leading-5 text-white/38">
          Prices exclude GST • Minimum 3 users •{" "}
          <Link className="text-[#a8dfb3] hover:text-white" href={ROUTES.contact}>
            Talk to sales
          </Link>{" "}
          for 25+ users
        </p>
      </section>

      <section className="border-y border-white/10 bg-[#050705] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Comparison</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Compare core plan access</h2>
            </div>
            <Link
              className="text-sm font-semibold text-[#a8dfb3] hover:text-white"
              href={subscribed ? ROUTES.account.billing : ROUTES.checkout("bragi-full", { cycle: billingCycle })}
            >
              {subscribed ? "Manage billing" : "Buy Complete Suite"}
            </Link>
          </div>
          <PlanComparisonTable />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="FAQ" title="Questions before checkout">
          Pricing is intentionally simple in this frontend phase. Commerce wiring can plug into these states later.
        </SectionHeading>
        <div className="mx-auto mt-10 max-w-4xl">
          <PricingFAQ />
        </div>
      </section>
    </main>
  );
}
