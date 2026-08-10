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



export function BillingConfirmationClient() {
  const router = useRouter();
  const { isAuthenticated, activePlan, trialStartedAt, trialEndsAt } = useAppSelector((state) => state.session);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.signIn);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const { plans, loading } = useSubscriptionPlans();
  const plan = plans.find((p) => p.slug === activePlan);

  const trialStart = trialStartedAt ? formatTrialDate(trialStartedAt) : "Today";
  const trialEnd = trialEndsAt ? formatTrialDate(trialEndsAt) : "—";

  if (loading || !plan) {
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
        Review your plan details below. No card is required during the trial.
      </p>

      <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-1 text-sm text-white/52">{plan.description}</p>
          </div>
          <span className="shrink-0 rounded-full border border-[#7dc890]/30 bg-[#7dc890]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#bce8c5]">
            14-day trial
          </span>
        </div>

        <dl className="mt-6 grid gap-3 border-t border-white/8 pt-6 text-sm">
          <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
            <dt className="text-white/48">Trial started</dt>
            <dd className="font-medium text-white/84">{trialStart}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
            <dt className="text-white/48">Trial ends</dt>
            <dd className="font-medium text-white/84">{trialEnd}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
            <dt className="text-white/48">After trial (Base)</dt>
            <dd className="font-medium text-white/84">{formatCurrency(plan.priceMonthly)}/mo</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-white/48">Additional Users</dt>
            <dd className="font-medium text-white/84">+{formatCurrency(plan.perUserCostMonthly)}/mo per user</dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-white/38">
        No card required. We&apos;ll remind you 3 days before the trial ends. Your data stays for 30 days after expiry.
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
