"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setMockSession } from "@/store";
import { fetchAuthSessionDetails } from "@/features/auth/lib/post-auth-routing";
import { applyPendingSession } from "@/features/auth/lib/auth-session";
import { readSignupDraft } from "@/features/checkout/lib/billing-session";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        const draft = readSignupDraft();
        if (draft) applyPendingSession(dispatch, draft);
        return;
      }

      try {
        const details = await fetchAuthSessionDetails(token);
        if (!details.ok) {
          localStorage.removeItem("accessToken");
          const draft = readSignupDraft();
          if (draft) applyPendingSession(dispatch, draft);
          return;
        }

        dispatch(
          setMockSession({
            isAuthenticated: true,
            scope: "full",
            subscriptionStatus: details.subscriptionStatus,
            activePlan: details.activePlan,
            organizationId: details.organizationId,
            userName: details.userName,
            userEmail: details.userEmail,
            companyName: details.companyName,
            role: details.role,
            trialStartedAt: details.trialStartedAt,
            trialEndsAt: details.trialEndsAt,
          }),
        );
      } catch {
        localStorage.removeItem("accessToken");
      }
    }
    init();
  }, [dispatch]);

  return <>{children}</>;
}
