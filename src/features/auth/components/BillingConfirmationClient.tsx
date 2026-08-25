"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";
import { ROUTES } from "@/config/routes";
import { formatTrialDate } from "@/features/auth/lib/trial-dates";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Button } from "@/shared/components/ui/Button";
import { useAppSelector } from "@/store/hooks";
import {
  getInactiveSubscriptionDestination,
  hasActiveSubscription,
} from "@/features/auth/lib/subscription";

export function BillingConfirmationClient() {
  const router = useRouter();
  const { isAuthenticated, activePlan, trialStartedAt, trialEndsAt, subscriptionStatus } = useAppSelector(
    (state) => state.session,
  );
  const { plans, loading } = useSubscriptionPlans();
  const subscribed = hasActiveSubscription(subscriptionStatus, activePlan);
  const isTrial = subscriptionStatus === "trialing";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.signIn);
      return;
    }
    if (subscriptionStatus === null) return;
    if (!subscribed) {
      router.replace(getInactiveSubscriptionDestination(subscriptionStatus));
      return;
    }
    if (!isTrial) {
      router.replace(ROUTES.dashboard);
    }
  }, [isAuthenticated, subscribed, subscriptionStatus, isTrial, router]);

  if (!isAuthenticated || !subscribed || !isTrial) {
    return null;
  }

  const plan = plans.find(
    (p) => p.slug === activePlan || p.name.toLowerCase() === activePlan?.toLowerCase(),
  );
  const trialStart = trialStartedAt ? formatTrialDate(trialStartedAt) : "Today";
  const trialEnd = trialEndsAt ? formatTrialDate(trialEndsAt) : "—";
  const daysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  if (loading) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Trial started</p>
      <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">Your trial is active</h1>
      <p className="mt-4 text-sm leading-7 text-white/58">
        Review your plan details below. Today’s authorization was INR 1.
      </p>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white sm:text-xl">{plan?.name || activePlan}</h2>
            {plan ? <p className="mt-1 text-sm text-white/52">{plan.description}</p> : null}
          </div>
          <span className="shrink-0 rounded-full border border-[#7dc890]/30 bg-[#7dc890]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#bce8c5]">
            {daysRemaining != null ? `${daysRemaining} days left` : "Trial"}
          </span>
        </div>

        <dl className="mt-6 grid gap-3 border-t border-white/8 pt-6 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 border-b border-white/8 pb-3">
            <dt className="shrink-0 text-white/48">Trial started</dt>
            <dd className="min-w-0 font-medium text-white/84 sm:text-right">{trialStart}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 border-b border-white/8 pb-3">
            <dt className="shrink-0 text-white/48">Trial ends</dt>
            <dd className="min-w-0 font-medium text-white/84 sm:text-right">{trialEnd}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 border-b border-white/8 pb-3">
            <dt className="shrink-0 text-white/48">After trial (Base)</dt>
            <dd className="min-w-0 font-medium text-white/84 sm:text-right">
              {plan ? `${formatCurrency(plan.priceMonthly)}/mo` : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <dt className="shrink-0 text-white/48">Additional Users</dt>
            <dd className="min-w-0 font-medium text-white/84 sm:text-right">
              {plan ? `+${formatCurrency(plan.perUserCostMonthly)}/mo per user` : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-white/38">
        We&apos;ll remind you 3 days before the trial ends. Your data stays for 30 days after expiry.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" onClick={() => router.push(ROUTES.dashboard)}>
          Continue to Bragi App
        </Button>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/8"
          href={ROUTES.pricing}
        >
          View plans
        </Link>
      </div>
    </main>
  );
}
