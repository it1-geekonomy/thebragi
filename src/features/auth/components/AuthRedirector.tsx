"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { getPostAuthDestination } from "@/features/auth/lib/post-auth-routing";
import { readSignupDraft } from "@/features/checkout/lib/billing-session";
import { ROUTES } from "@/config/routes";

export function AuthRedirector() {
  const router = useRouter();
  const { isAuthenticated, subscriptionStatus, activePlan, isNewSignup, scope } = useAppSelector(
    (state) => state.session,
  );

  useEffect(() => {
    // Wait until session hydration finishes — null means still loading.
    if (!isAuthenticated || subscriptionStatus === null) return;

    const returnTo = new URLSearchParams(window.location.search).get("returnTo");
    const draft = readSignupDraft();

    if (scope === "checkout" && subscriptionStatus === "none") {
      if (draft?.planSlug) {
        router.replace(
          ROUTES.checkout(draft.planSlug, {
            cycle: draft.cycle,
            mode: draft.purchaseMode === "buy_now" ? "buy_now" : "trial",
          }),
        );
        return;
      }
      router.replace(ROUTES.pricing);
      return;
    }

    router.replace(
      getPostAuthDestination({
        isNewSignup,
        subscriptionStatus,
        activePlan,
        returnTo,
      }),
    );
  }, [isAuthenticated, subscriptionStatus, activePlan, isNewSignup, scope, router]);

  return null;
}
