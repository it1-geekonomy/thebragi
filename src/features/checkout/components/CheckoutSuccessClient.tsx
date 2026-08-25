"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { clearVerifiedBilling, readVerifiedBilling } from "@/features/checkout/lib/billing-session";
import { Button } from "@/shared/components/ui/Button";
import { useAppSelector } from "@/store/hooks";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";
import { hasActiveSubscription } from "@/features/auth/lib/subscription";

export function CheckoutSuccessClient({ crmLoginUrl }: { crmLoginUrl: string }) {
  const router = useRouter();
  const [billing, setBilling] = useState(() => readVerifiedBilling());
  const [redirecting, setRedirecting] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.session.isAuthenticated);
  const activePlan = useAppSelector((state) => state.session.activePlan);
  const subscriptionStatus = useAppSelector((state) => state.session.subscriptionStatus);
  const { plans } = useSubscriptionPlans();
  const subscribed = hasActiveSubscription(subscriptionStatus, activePlan);
  const planName =
    plans.find((p) => p.slug === activePlan?.toLowerCase() || p.name.toLowerCase() === activePlan?.toLowerCase())
      ?.name ?? billing?.plan;

  useEffect(() => {
    const verified = readVerifiedBilling();
    if (verified?.gstin || verified?.legalName) {
      setBilling(verified);
      return;
    }
    if (!isAuthenticated) {
      router.replace(ROUTES.signIn);
      return;
    }
    if (subscriptionStatus === null) return;
    if (subscriptionStatus === "trialing") {
      router.replace(ROUTES.billingConfirmation);
      return;
    }
    if (activePlan && subscribed) {
      setBilling({
        gstin: "",
        legalName: "Your organization",
        pan: "",
        stateCode: "",
        stateName: "",
        address: "",
        postalCode: "",
        country: "India",
        plan: activePlan,
        users: 0,
        cycle: "annual",
        verifiedAt: Date.now(),
      });
      return;
    }
    router.replace(ROUTES.pricing);
  }, [activePlan, isAuthenticated, router, subscribed, subscriptionStatus]);

  const goToApp = () => {
    setRedirecting(true);
    clearVerifiedBilling();
    window.location.href = crmLoginUrl;
  };

  if (!billing) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
        <p className="mt-4 text-sm text-white/58">Confirming your billing details…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Subscription active</p>
      <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">You&apos;re all set</h1>
      <p className="mt-4 text-sm leading-7 text-white/58">
        {planName
          ? `Payment confirmed for ${planName}. Your workspace is ready.`
          : "Your payment was confirmed. Continue to the app to finish setup."}
        {billing.gstin ? " Your tax invoice will be issued to the entity below." : ""}
      </p>

      <dl className="mt-8 grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm">
        {billing.legalName ? (
          <div className="flex justify-between gap-3">
            <dt className="text-white/48">Legal name</dt>
            <dd className="text-right font-medium text-white">{billing.legalName}</dd>
          </div>
        ) : null}
        {billing.gstin ? (
          <div className="flex justify-between gap-3">
            <dt className="text-white/48">GSTIN</dt>
            <dd className="font-medium text-[#bce8c5]">{billing.gstin}</dd>
          </div>
        ) : null}
        {billing.stateName ? (
          <div className="flex justify-between gap-3">
            <dt className="text-white/48">Place of supply</dt>
            <dd className="text-right text-white/84">{billing.stateName}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" disabled={redirecting} onClick={goToApp}>
          {redirecting ? "Opening app…" : "Continue to Bragi app"}
        </Button>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/8"
          href={ROUTES.dashboard}
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
