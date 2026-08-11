"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { getPostAuthDestination } from "@/features/auth/lib/post-auth-routing";

export function AuthRedirector() {
  const router = useRouter();
  const { isAuthenticated, subscriptionStatus, activePlan, isNewSignup } = useAppSelector(
    (state) => state.session,
  );

  useEffect(() => {
    // Wait until session hydration finishes — null means still loading.
    if (!isAuthenticated || subscriptionStatus === null) return;

    const returnTo = new URLSearchParams(window.location.search).get("returnTo");
    router.replace(
      getPostAuthDestination({
        isNewSignup,
        subscriptionStatus,
        activePlan,
        returnTo,
      }),
    );
  }, [isAuthenticated, subscriptionStatus, activePlan, isNewSignup, router]);

  return null;
}
