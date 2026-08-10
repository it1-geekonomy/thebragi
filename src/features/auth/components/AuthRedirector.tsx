"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { getPostAuthDestination } from "@/features/auth/lib/post-auth-routing";

export function AuthRedirector() {
  const router = useRouter();
  const { isAuthenticated, subscriptionStatus, activePlan } = useAppSelector((state) => state.session);

  useEffect(() => {
    if (isAuthenticated) {
      const destination = getPostAuthDestination({
        isNewSignup: false,
        subscriptionStatus: subscriptionStatus || "none",
        activePlan,
      });
      router.replace(destination);
    }
  }, [isAuthenticated, subscriptionStatus, activePlan, router]);

  return null;
}
