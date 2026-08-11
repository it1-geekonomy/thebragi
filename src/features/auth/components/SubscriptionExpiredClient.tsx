"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/components/ui/Button";
import { useAppSelector } from "@/store/hooks";
import { getPostAuthDestination } from "@/features/auth/lib/post-auth-routing";

export function SubscriptionExpiredClient() {
  const router = useRouter();
  const { isAuthenticated, subscriptionStatus, activePlan, isNewSignup } = useAppSelector(
    (state) => state.session,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.signIn);
      return;
    }
    // Never-subscribed / active users must not see the "expired" copy
    if (subscriptionStatus !== null && subscriptionStatus !== "expired") {
      router.replace(
        getPostAuthDestination({
          isNewSignup,
          subscriptionStatus,
          activePlan,
        }),
      );
    }
  }, [isAuthenticated, subscriptionStatus, activePlan, isNewSignup, router]);

  if (!isAuthenticated || subscriptionStatus !== "expired") {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Subscription</p>
      <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">Your subscription has expired</h1>
      <p className="mt-4 text-sm leading-7 text-white/58">
        Upgrade your plan to use Bragi. Your workspace data is retained for 30 days after expiry.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button className="w-full sm:w-auto" onClick={() => router.push(ROUTES.pricing)}>
          Upgrade your plan
        </Button>
        <Link
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/8 sm:w-auto"
          href={ROUTES.account.billing}
        >
          View billing
        </Link>
      </div>
    </main>
  );
}
