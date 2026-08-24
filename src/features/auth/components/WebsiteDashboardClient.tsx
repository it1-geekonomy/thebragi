"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/components/ui/Button";
import { useAppSelector } from "@/store/hooks";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";
import {
  getInactiveSubscriptionDestination,
  hasActiveSubscription,
} from "@/features/auth/lib/subscription";

export function WebsiteDashboardClient() {
  const router = useRouter();
  const { isAuthenticated, activePlan, userName, userEmail, subscriptionStatus, trialEndsAt } = useAppSelector(
    (state) => state.session,
  );
  const { plans } = useSubscriptionPlans();
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
    }
  }, [isAuthenticated, subscribed, subscriptionStatus, router]);

  if (!isAuthenticated || !subscribed) {
    return null;
  }

  const currentPlan = plans.find(
    (p) => p.slug === activePlan?.toLowerCase() || p.name.toLowerCase() === activePlan?.toLowerCase(),
  );
  const planName = currentPlan?.name || activePlan;
  const firstName = userName ? userName.split(" ")[0] : "User";
  const daysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">
        {isTrial ? "Trial workspace" : "Your workspace"}
      </p>
      <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">Welcome back, {firstName}</h1>
      <p className="mt-3 text-sm leading-6 text-white/58">
        {isTrial
          ? daysRemaining != null
            ? `Your ${planName} trial is active — ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining.`
            : `Your ${planName} trial is active.`
          : `You're on ${planName}. Open the app to continue working.`}
      </p>
      
      <div className="mt-8 w-full rounded-xl border border-white/10 bg-white/[0.02] p-6 text-left shadow-lg">
        <h2 className="text-lg font-semibold text-white">Your Workspace</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-white/58">Account</span>
            <span className="font-medium text-white">{userEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/58">{isTrial ? "Trial plan" : "Current plan"}</span>
            <span className="font-medium text-[#a8dfb3]">{planName}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <Button 
          variant="secondary" 
          className="w-full" 
          onClick={() => router.push(ROUTES.account.profile)}
        >
          Profile
        </Button>
        <Button 
          className="w-full" 
          onClick={() => window.location.href = ROUTES.appWorkspace}
        >
          Open CRM Workspace
        </Button>
        <Button 
          variant="secondary" 
          className="w-full" 
          onClick={() => router.push(ROUTES.account.billing)}
        >
          Billing Details
        </Button>
      </div>
    </main>
  );
}
