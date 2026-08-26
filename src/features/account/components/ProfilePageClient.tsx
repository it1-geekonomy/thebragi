"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { useAppSelector } from "@/store/hooks";
import { subscriptionApi } from "@/features/subscription/api";
import { paymentApi } from "@/features/subscription/services/paymentApi";
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
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const draft = readSignupDraft();

      const [workspaces, sub, pending] = await Promise.all([
        workspaceApi.getWorkspaces().catch(() => [] as WorkspaceInfo[]),
        session.organizationId
          ? subscriptionApi.getSubscriptionStatus(session.organizationId).catch(() => null)
          : null,
        !session.isAuthenticated && session.userEmail
          ? paymentApi.getPendingSignup(session.userEmail).catch(() => null)
          : null,
      ]);

      if (cancelled) return;

      const wsList = extractList(workspaces);
      const currentWorkspace =
        wsList.find((w: any) => w && (w.id === session.organizationId || w.isCurrent)) || wsList[0];

      const rawStatus = (sub as any)?.status?.toUpperCase() ?? session.subscriptionStatus?.toUpperCase() ?? "";
      const subscribed =
        rawStatus === "ACTIVE" ||
        rawStatus === "TRIAL" ||
        rawStatus === "TRIALING" ||
        session.subscriptionStatus === "active" ||
        session.subscriptionStatus === "trialing";
      const isTrialing = rawStatus === "TRIAL" || rawStatus === "TRIALING" || session.subscriptionStatus === "trialing";

      const role = (currentWorkspace as any)?.role || session.role || "";

      setProfile({
        name: session.userName || pending?.name || draft?.fullName || "",
        email: session.userEmail || pending?.email || draft?.email || "",
        company: session.companyName || "",
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
    session.companyName,
    session.role,
    session.subscriptionStatus,
    session.activePlan,
    session.isAuthenticated,
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

  const handleDeleteAccount = async () => {
    if (!profile?.email) return;
    
    if (!window.confirm("Are you sure you want to delete your pending account? This cannot be undone.")) return;

    try {
      setIsDeleting(true);
      const draft = readSignupDraft();
      
      await paymentApi.deletePendingSignup({
        email: profile.email,
        password: draft?.password,
        providerUserId: draft?.providerUserId,
      });
      
      clearSignupDraft();
      dispatch(clearSession());
      router.push(ROUTES.home);
    } catch (err: any) {
      console.error("Failed to delete account", err);
      // Give a helpful message based on the error
      if (err.status === 400) {
         alert("Failed to authenticate. Your draft password was missing or invalid. Please complete signup again to reset your password or sign in with Google/Microsoft if you originally used that method.");
      } else {
         alert("Failed to delete account. Please try again.");
      }
      setIsDeleting(false);
    }
  };

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Account</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Profile</h1>
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
              <Input
                id="company"
                label="Company"
                value={profile.company}
                readOnly
                className="opacity-70 pointer-events-none"
              />
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
                className="flex items-center justify-between rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm"
              >
                <span className="text-white/44">{label}</span>
                <span className="font-semibold text-white/78">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-sm font-semibold text-red-500 mb-2">Danger Zone</h3>
            <p className="text-xs text-white/52 mb-4">
              Permanently delete your pending account and free up this email address.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="w-full border border-red-500/50 text-red-500 bg-red-500/10 hover:bg-red-500/20"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
