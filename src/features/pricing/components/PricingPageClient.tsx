"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlanCard } from "@/features/pricing/components/PlanCard";
import { hasActiveSubscription } from "@/features/auth/lib/subscription";
import { ROUTES } from "@/config/routes";
import { useAppSelector } from "@/store/hooks";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/Button";
import { Toggle } from "@/shared/components/ui/Toggle";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";
import { BackButton } from "@/shared/components/ui/BackButton";

type BillingCycle = "monthly" | "annual";

export function PricingPageClient({ highlightedPlan }: { highlightedPlan?: string }) {
  const router = useRouter();
  const session = useAppSelector((state) => state.session);
  const subscribed = session.isAuthenticated && hasActiveSubscription(session.subscriptionStatus, session.activePlan);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [selectedSlug, setSelectedSlug] = useState(() => highlightedPlan ?? "");

  const { plans, loading, error } = useSubscriptionPlans();

  const isActivePlan = (p: { slug: string; name: string }) =>
    p.slug.toLowerCase() === session.activePlan?.toLowerCase() ||
    p.name.toLowerCase() === session.activePlan?.toLowerCase();

  const currentPlan = subscribed ? plans.find(isActivePlan) : null;
  const displayPlans = plans;
  const highlightedPlanObj = highlightedPlan ? plans.find((p) => p.slug === highlightedPlan) : null;
  const effectiveSlug =
    selectedSlug && displayPlans.some((p) => p.slug === selectedSlug)
      ? selectedSlug
      : highlightedPlan && displayPlans.some((p) => p.slug === highlightedPlan)
        ? highlightedPlan
        : displayPlans[0]?.slug ?? "";
  const selectedPlan = displayPlans.find((p) => p.slug === effectiveSlug) || displayPlans[0];

  useEffect(() => {
    if (!highlightedPlan) return;
    document.getElementById(highlightedPlan)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedPlan]);

  if (loading) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center p-8">
        <Alert tone="error">{error}</Alert>
      </main>
    );
  }

  return (
    <main className="bg-black text-white">
      <section className="px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <BackButton />
          </div>
          <div className="inline-flex items-center gap-3">
            <p className="text-sm font-semibold text-white">{subscribed ? "Your plan" : "Choose your plan"}</p>
          </div>

          <div className="mt-12 flex flex-col items-center text-center">
            <BragiLogo />
            <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              {subscribed ? "Your Bragi workspace is active" : session.isAuthenticated ? "Choose a plan to continue" : "Run sales and delivery in one place"}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/58">
              {subscribed
                ? `You're on ${currentPlan?.name ?? "an active plan"}. Open the app to continue working — no need to pick a plan again.`
                : session.isAuthenticated ? "Pick a subscription plan to activate your workspace." : "Start a 14-day trial with a INR 1 authorization. Cancel any time."}
            </p>
            {subscribed ? (
              <Button className="mt-8" onClick={() => router.push(ROUTES.dashboard)}>
                Open workspace
              </Button>
            ) : null}
            <div className="mx-auto mb-16 mt-16 max-w-4xl border-y border-white/10 py-10">
              <h2 className="text-2xl font-semibold text-white text-center">Is Bragi worth it?</h2>
              <div className="mt-10 grid gap-8 sm:grid-cols-3 text-left">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="font-semibold text-white">Save Time & Money</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">Automate your workflows and reduce manual entry. Teams save an average of 15 hours per week.</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="font-semibold text-white">Scale Faster</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">Built for growing businesses. Add users, clients, and projects instantly without performance bottlenecks.</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="font-semibold text-white">Premium Support</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">Get priority access to our expert team to ensure your business operations never slow down.</p>
                </div>
              </div>
            </div>

            <div className={`inline-flex rounded-full border border-white/12 bg-white/[0.04] p-1 ${subscribed ? "mt-4" : ""}`}>
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
                Annual{selectedPlan?.annualDiscountPercentage ? ` — save ${selectedPlan.annualDiscountPercentage}%` : ""}
              </Toggle>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {!subscribed && highlightedPlanObj ? (
            <Alert tone="success" className="mb-6">
              Focused plan: {highlightedPlanObj.name}. Pick trial or buy below to continue.
            </Alert>
          ) : null}
        </div>

        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {displayPlans.map((plan) => (
            <PlanCard
              key={plan.slug}
              plan={plan}
              billingCycle={billingCycle}
              selected={effectiveSlug === plan.slug}
              isCurrentPlan={subscribed && isActivePlan(plan)}
              highlighted={effectiveSlug === plan.slug}
              onSelect={() => setSelectedSlug(plan.slug)}
            />
          ))}
        </div>

        {selectedPlan ? (
          <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {!session.isAuthenticated ? (
              <>
                <Link
                  className="inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6bad72] sm:w-auto sm:min-w-52"
                  href={ROUTES.signUp(selectedPlan.slug, { cycle: billingCycle })}
                >
                  Start 14-day free trial
                </Link>
                <Link
                  className="inline-flex w-full items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/8 sm:w-auto sm:min-w-36"
                  href={ROUTES.signUp(selectedPlan.slug, { cycle: billingCycle, mode: "buy_now" })}
                >
                  Buy now
                </Link>
              </>
            ) : subscribed && isActivePlan(selectedPlan) ? (
              <button
                disabled
                className="inline-flex w-full items-center justify-center rounded-md bg-white/10 px-5 py-3 text-sm font-semibold text-white/50 cursor-not-allowed sm:w-auto sm:min-w-52"
              >
                Current plan
              </button>
            ) : subscribed ? (
              <Link
                className="inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6bad72] sm:w-auto sm:min-w-52"
                href={ROUTES.checkout(selectedPlan.slug, { cycle: billingCycle, mode: "buy_now" })}
              >
                Switch to this plan
              </Link>
            ) : (
              <>
                <Link
                  className="inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6bad72] sm:w-auto sm:min-w-52"
                  href={ROUTES.checkout(selectedPlan.slug, { cycle: billingCycle, mode: "trial" })}
                >
                  Start 14-day free trial
                </Link>
                <Link
                  className="inline-flex w-full items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/8 sm:w-auto sm:min-w-36"
                  href={ROUTES.checkout(selectedPlan.slug, { cycle: billingCycle, mode: "buy_now" })}
                >
                  Buy now
                </Link>
              </>
            )}
          </div>
        ) : null}


        <p className="mx-auto mt-5 max-w-7xl text-center text-xs leading-5 text-white/38">
          Prices exclude GST • Seat minimum follows the selected plan •{" "}
          <Link className="text-[#a8dfb3] hover:text-white" href={ROUTES.contact}>
            Talk to sales
          </Link>{" "}
          for 25+ users
        </p>
      </section>
    </main>
  );
}
