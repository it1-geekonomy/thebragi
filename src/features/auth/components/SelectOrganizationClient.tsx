"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Building2, Shield, ArrowRight, LogIn } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useAppDispatch } from "@/store/hooks";
import {
  readOrgSelectionSession,
  submitOrganizationSelection,
  type OrgSelectionSessionData,
  type OrganizationSummary,
} from "@/features/auth/lib/auth-session";
import { getPostAuthDestination, sanitizeReturnTo } from "@/features/auth/lib/post-auth-routing";
import { getApiErrorMessage } from "@/shared/lib/api-client";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { Button } from "@/shared/components/ui/Button";

export function SelectOrganizationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  const [sessionData, setSessionData] = useState<OrgSelectionSessionData | null>(null);
  const [loadingOrgId, setLoadingOrgId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const data = readOrgSelectionSession();
    setSessionData(data);
    setIsInitializing(false);
  }, []);

  const handleSelect = async (org: OrganizationSummary) => {
    if (!sessionData?.sessionKey) return;
    setLoadingOrgId(org.id);

    try {
      const sessionDetails = await submitOrganizationSelection(
        dispatch,
        sessionData.sessionKey,
        org.id,
        sessionData.email,
      );

      const destination = getPostAuthDestination({
        isNewSignup: false,
        subscriptionStatus: sessionDetails.subscriptionStatus,
        activePlan: sessionDetails.activePlan,
        returnTo,
      });

      toast.success(`Connected to ${org.name || org.companyName || "workspace"}.`);
      router.push(destination);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to select organization. Please try again."));
      setLoadingOrgId(null);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
      </div>
    );
  }

  if (!sessionData || !sessionData.orgs || sessionData.orgs.length === 0) {
    return (
      <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8 text-center">
        <BragiLogo />
        <h1 className="mt-6 text-2xl font-semibold text-white sm:text-3xl">Session Expired</h1>
        <p className="mt-3 text-sm text-white/58">
          No pending organization selection found or your session has expired. Please sign in again.
        </p>
        <div className="mt-6">
          <Button onClick={() => router.push(ROUTES.signIn)} className="w-full sm:w-auto">
            <LogIn className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8">
      <BragiLogo />
      <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Select Organization</h1>
      <p className="mt-3 text-sm text-white/58">
        Your account is associated with multiple workspaces. Choose which organization you want to access.
      </p>

      <div className="mt-8 grid gap-4">
        {sessionData.orgs.map((org) => {
          const isSelected = loadingOrgId === org.id;
          const roleDisplay = (org.role || "Member").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <button
              key={org.id}
              type="button"
              disabled={loadingOrgId !== null}
              onClick={() => handleSelect(org)}
              className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-[#7dc890]/50 hover:bg-white/[0.06] disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#162118] text-[#a8dfb3] transition group-hover:scale-105">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-base sm:text-lg">
                      {org.name || org.companyName || "Unnamed Organization"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                    <Shield className="h-3.5 w-3.5 text-[#7dc890]" />
                    <span className="font-medium text-[#a8dfb3]">{roleDisplay}</span>
                    {org.status && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{org.status.toLowerCase()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isSelected ? (
                  <div className="flex items-center gap-2 text-xs text-[#a8dfb3]">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition group-hover:border-[#7dc890] group-hover:bg-[#5f9965] group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 border-t border-white/10 pt-6 text-center">
        <button
          type="button"
          onClick={() => router.push(ROUTES.signIn)}
          className="text-xs font-semibold text-white/50 hover:text-white transition"
        >
          Sign in with a different account
        </button>
      </div>
    </section>
  );
}
