"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMockSession } from "@/store";
import { subscriptionApi } from "@/features/subscription/api";
import { paymentApi } from "@/features/subscription/services/paymentApi";
import { apiClient } from "@/shared/lib/api-client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { readSignupDraft } from "@/features/checkout/lib/billing-session";
import { workspaceApi, type WorkspaceInfo } from "@/features/auth/services/workspaceApi";

type ProfileView = {
  name: string;
  email: string;
  company: string;
  role: string;
  plan: string;
  subscribed: boolean;
  trialing: boolean;
  pendingCheckout: boolean;
};

function extractCompanyName(obj: unknown): string {
  if (!obj || typeof obj !== "object") return "";
  const record = obj as Record<string, unknown>;

  if (typeof record.registeredLegalName === "string" && record.registeredLegalName.trim()) {
    return record.registeredLegalName.trim();
  }
  if (typeof record.companyName === "string" && record.companyName.trim()) {
    return record.companyName.trim();
  }
  if (typeof record.legalName === "string" && record.legalName.trim()) {
    return record.legalName.trim();
  }
  if (typeof record.company === "string" && record.company.trim()) {
    return record.company.trim();
  }
  if (typeof record.organizationName === "string" && record.organizationName.trim()) {
    return record.organizationName.trim();
  }
  if (typeof record.name === "string" && record.name.trim()) {
    return record.name.trim();
  }

  if (record.organization) {
    const nested = extractCompanyName(record.organization);
    if (nested) return nested;
  }
  if (record.organizationProfile) {
    const nested = extractCompanyName(record.organizationProfile);
    if (nested) return nested;
  }
  if (record.user) {
    const nested = extractCompanyName(record.user);
    if (nested) return nested;
  }
  if (record.data) {
    const nested = extractCompanyName(record.data);
    if (nested) return nested;
  }

  return "";
}

function extractList(obj: unknown): unknown[] {
  if (Array.isArray(obj)) return obj;
  if (!obj || typeof obj !== "object") return [];
  const record = obj as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.workspaces)) return record.workspaces;
  if (Array.isArray(record.organizations)) return record.organizations;
  if (Array.isArray(record.orgs)) return record.orgs;
  return [];
}

export function ProfilePageClient() {
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileView | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const draft = readSignupDraft();

      const [
        workspaces,
        orgById,
        orgProfiles,
        singleOrgProfile,
        orgMe,
        authSession,
        sub,
        pending,
      ] = await Promise.all([
        workspaceApi.getWorkspaces().catch(() => [] as WorkspaceInfo[]),
        session.organizationId
          ? apiClient(`/organizations/${session.organizationId}`).catch(() => null)
          : null,
        apiClient("/organization-profiles").catch(() => null),
        apiClient("/organization-profile").catch(() => null),
        apiClient("/organizations/me").catch(() => null),
        apiClient("/auth/session").catch(() => null),
        session.organizationId
          ? subscriptionApi.getSubscriptionStatus(session.organizationId).catch(() => null)
          : null,
        session.userEmail
          ? paymentApi.getPendingSignup(session.userEmail).catch(() => null)
          : null,
      ]);

      if (cancelled) return;

      const wsList = extractList(workspaces);
      const currentWorkspace =
        wsList.find((w: any) => w && (w.id === session.organizationId || w.isCurrent)) || wsList[0];

      const orgProfilesList = extractList(orgProfiles);
      const firstOrgProfile = orgProfilesList.length > 0 ? orgProfilesList[0] : orgProfiles;

      const company =
        extractCompanyName(currentWorkspace) ||
        extractCompanyName(orgById) ||
        extractCompanyName(firstOrgProfile) ||
        extractCompanyName(singleOrgProfile) ||
        extractCompanyName(orgMe) ||
        extractCompanyName(authSession) ||
        session.companyName ||
        pending?.company ||
        pending?.name ||
        draft?.company ||
        "";

      if (company && company !== session.companyName) {
        dispatch(setMockSession({ companyName: company }));
      }

      const rawStatus = (sub as any)?.status?.toUpperCase() ?? session.subscriptionStatus?.toUpperCase() ?? "";
      const subscribed =
        rawStatus === "ACTIVE" ||
        rawStatus === "TRIAL" ||
        rawStatus === "TRIALING" ||
        session.subscriptionStatus === "active" ||
        session.subscriptionStatus === "trialing";
      const isTrialing = rawStatus === "TRIAL" || rawStatus === "TRIALING" || session.subscriptionStatus === "trialing";

      const role = (currentWorkspace as any)?.role || (authSession as any)?.role || session.role || "";

      setProfile({
        name: session.userName || (authSession as any)?.user?.name || pending?.name || draft?.fullName || "",
        email: session.userEmail || (authSession as any)?.user?.email || pending?.email || draft?.email || "",
        company,
        role: role ? role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "",
        plan: (sub as any)?.plan || session.activePlan || pending?.planName || draft?.planSlug || "",
        subscribed,
        trialing: isTrialing,
        pendingCheckout: Boolean(!subscribed && (pending || draft?.planSlug)),
      });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    session.organizationId,
    session.userEmail,
    session.userName,
    session.role,
    session.companyName,
    session.subscriptionStatus,
    session.activePlan,
    dispatch,
  ]);

  if (!profile) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
      </main>
    );
  }

  const details = [
    ...(profile.role ? ([["Role", profile.role]] as const) : []),
    [
      "Status",
      profile.subscribed
        ? profile.trialing
          ? "Trial active"
          : "Subscription active"
        : profile.pendingCheckout
          ? "Checkout incomplete"
          : "No plan",
    ],
    ["Plan", profile.plan || "None"],
  ];

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Account</p>
          <h1 className="mt-3 text-[clamp(1.75rem,5vw,1.875rem)] font-semibold text-white sm:text-3xl">Profile</h1>
          <p className="mt-2 text-sm text-white/52">
            {profile.subscribed
              ? "Your workspace account details."
              : profile.pendingCheckout
                ? "Finish checkout to activate your workspace. Organization details unlock after payment."
                : "Choose a plan to activate your workspace."}
          </p>
        </div>
        {profile.role ? <Badge>{profile.role}</Badge> : null}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="grid gap-5 p-6">
          <h2 className="text-xl font-semibold text-white">Personal and company details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input id="name" label="Name" value={profile.name} readOnly className="opacity-70 pointer-events-none" />
            <Input id="email" label="Email" type="email" value={profile.email} readOnly className="opacity-70 pointer-events-none" />
            <div className="sm:col-span-2">
              <Input id="company" label="Company" value={profile.company} readOnly className="opacity-70 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => router.push(profile.subscribed ? ROUTES.dashboard : ROUTES.pricing)}>
              {profile.subscribed
                ? "Open workspace"
                : profile.pendingCheckout
                  ? "Complete checkout"
                  : "Choose a plan"}
            </Button>
            {!profile.subscribed ? (
              <p className="text-xs text-white/52">
                {profile.pendingCheckout
                  ? "Your account is saved. Complete payment or trial authorization to create the organization."
                  : "You need an active subscription to manage organization details."}
              </p>
            ) : null}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white">Account status</h2>
          <div className="mt-5 grid gap-3">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="shrink-0 text-white/44">{label}</span>
                <span className="min-w-0 font-semibold text-white/78 sm:text-right">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
