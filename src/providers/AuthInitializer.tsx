"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setMockSession } from "@/store";
import { fetchAuthSessionDetails } from "@/features/auth/lib/post-auth-routing";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const details = await fetchAuthSessionDetails(token);
        
        dispatch(
          setMockSession({
            isAuthenticated: true,
            subscriptionStatus: details.subscriptionStatus,
            activePlan: details.activePlan,
            organizationId: details.organizationId,
            userName: details.userName,
            userEmail: details.userEmail,
            role: details.role,
          })
        );
      } catch (err) {
        // Silently fail if token is invalid, they just remain logged out
      }
    }
    init();
  }, [dispatch]);

  return <>{children}</>;
}
