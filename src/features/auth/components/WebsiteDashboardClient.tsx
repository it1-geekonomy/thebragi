"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Check, ChevronsUpDown, Shield } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMockSession } from "@/store";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";
import {
  getInactiveSubscriptionDestination,
  hasActiveSubscription,
} from "@/features/auth/lib/subscription";
import { fetchAuthSessionDetails } from "@/features/auth/lib/post-auth-routing";
import { workspaceApi, type WorkspaceInfo } from "@/features/auth/services/workspaceApi";
import { getApiErrorMessage } from "@/shared/lib/api-client";

export function WebsiteDashboardClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    isAuthenticated,
    activePlan,
    userName,
    userEmail,
    companyName,
    organizationId,
    subscriptionStatus,
    trialEndsAt,
    role,
  } = useAppSelector((state) => state.session);

  const { plans } = useSubscriptionPlans();
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    workspaceApi
      .getWorkspaces()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setWorkspaces(data);
        }
      })
      .catch(() => {
        // Workspace list endpoint may return 404/empty if only single-org
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, organizationId]);

  if (!isAuthenticated || !subscribed) {
    return null;
  }

  const currentPlan = plans.find(
    (p) => p.slug === activePlan?.toLowerCase() || p.name.toLowerCase() === activePlan?.toLowerCase(),
  );
  const planName = currentPlan?.name || activePlan;
  const firstName = userName ? userName.split(" ")[0] : "";
  const daysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  const currentOrg = workspaces.find((w) => w.id === organizationId);
  const orgName = currentOrg?.name || currentOrg?.companyName || companyName || null;
  const userRole = currentOrg?.role || role || null;

  const metadataRows = [
    orgName && {
      label: "Current Organization",
      value: (
        <div className="flex items-center gap-1.5 font-medium text-white">
          <Building2 className="h-4 w-4 text-[#7dc890]" />
          <span>{orgName}</span>
        </div>
      ),
    },
    userRole && {
      label: "Your Role",
      value: (
        <div className="flex items-center gap-1.5 font-medium text-[#a8dfb3]">
          <Shield className="h-3.5 w-3.5 text-[#7dc890]" />
          <span className="capitalize">{userRole.replace(/_/g, " ")}</span>
        </div>
      ),
    },
    userEmail && {
      label: "Account",
      value: <span className="font-medium text-white">{userEmail}</span>,
    },
    planName && {
      label: isTrial ? "Trial plan" : "Current plan",
      value: <span className="font-medium text-[#a8dfb3]">{planName}</span>,
    },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  const handleSwitchWorkspace = async (targetOrgId: string, targetName?: string) => {
    if (targetOrgId === organizationId || isSwitching) return;
    setIsSwitching(true);

    try {
      const response = await workspaceApi.switchOrganization(targetOrgId);
      const rawToken = (response.accessToken ?? "").replace(/^Bearer\s+/i, "");
      if (rawToken) {
        localStorage.setItem("accessToken", rawToken);
      }

      const details = await fetchAuthSessionDetails(rawToken);
      dispatch(
        setMockSession({
          organizationId: details.organizationId || targetOrgId,
          subscriptionStatus: details.subscriptionStatus,
          activePlan: details.activePlan,
          userName: details.userName || userName,
          userEmail: details.userEmail || userEmail,
          role: details.role || response.user?.role || role,
          trialStartedAt: details.trialStartedAt,
          trialEndsAt: details.trialEndsAt,
        }),
      );

      toast.success(`Switched to workspace: ${targetName || "Selected Organization"}`);
      setShowWorkspaceDropdown(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to switch workspace."));
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full min-w-0 max-w-xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7dc890] sm:tracking-[0.34em]">
        {isTrial ? "Trial workspace" : "Your workspace"}
      </p>
      <h1 className="mt-5 text-[clamp(1.75rem,6vw,2.25rem)] font-semibold text-white sm:text-4xl">
        {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-white/58">
        {isTrial
          ? daysRemaining != null
            ? `Your ${planName || "workspace"} trial is active — ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining.`
            : `Your ${planName || "workspace"} trial is active.`
          : planName
            ? `You're on ${planName}. Open the app to continue working.`
            : "Open the app to continue working."}
      </p>

      {/* Workspace Card with switcher */}
      <div className="mt-8 w-full rounded-xl border border-white/10 bg-white/[0.02] p-6 text-left shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Your Workspace</h2>
          {workspaces.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
                disabled={isSwitching}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-[#a8dfb3] hover:border-[#7dc890]/50 hover:bg-white/[0.08] transition"
              >
                <span>Switch</span>
                <ChevronsUpDown className="h-3.5 w-3.5" />
              </button>

              {showWorkspaceDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-[#0d140e] p-2 shadow-2xl z-50">
                  <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    Switch Workspace
                  </p>
                  <div className="grid gap-1 mt-1">
                    {workspaces.map((org) => {
                      const isCurrent = org.id === organizationId;
                      return (
                        <button
                          key={org.id}
                          type="button"
                          disabled={isCurrent || isSwitching}
                          onClick={() => handleSwitchWorkspace(org.id, org.name || org.companyName)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                            isCurrent
                              ? "bg-[#5f9965]/20 text-[#a8dfb3] font-medium"
                              : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="font-semibold truncate">{org.name || org.companyName || "Organization"}</p>
                            {org.role ? (
                              <p className="text-[10px] text-white/40 capitalize">{org.role.toLowerCase().replace(/_/g, " ")}</p>
                            ) : null}
                          </div>
                          {isCurrent && <Check className="h-3.5 w-3.5 shrink-0 text-[#7dc890]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {metadataRows.length > 0 ? (
          <div className="mt-4 divide-y divide-white/10 text-sm">
            {metadataRows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="shrink-0 text-white/58">{row.label}</span>
                <div className="min-w-0 sm:text-right">{row.value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => router.push(ROUTES.account.profile)}
        >
          Profile
        </Button>
        <Button
          className="w-full"
          onClick={() => (window.location.href = ROUTES.appWorkspace)}
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
