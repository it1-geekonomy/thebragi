"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { useAppSelector } from "@/store/hooks";
import { subscriptionApi } from "@/features/subscription/api";
import { paymentApi } from "@/features/subscription/services/paymentApi";
import { apiClient } from "@/shared/lib/api-client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { readSignupDraft } from "@/features/checkout/lib/billing-session";

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

export function ProfilePageClient() {
  const { session } = useAppSelector((state) => state);
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileView | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (session.organizationId) {
        const [org, sub] = await Promise.all([
          apiClient<{ name?: string }>(`/organizations/${session.organizationId}`).catch(() => null),
          subscriptionApi.getSubscriptionStatus(session.organizationId).catch(() => null),
        ]);
        if (cancelled) return;
        const status = sub?.status?.toUpperCase() ?? "";
        const subscribed = status === "ACTIVE" || status === "TRIAL" || status === "TRIALING";
        setProfile({
          name: session.userName || "",
          email: session.userEmail || "",
          company: org?.name || "",
          role: session.role?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "",
          plan: sub?.plan || "",
          subscribed,
          trialing: status === "TRIAL" || status === "TRIALING",
          pendingCheckout: false,
        });
        return;
      }

      if (!session.userEmail) return;
      const pending = await paymentApi.getPendingSignup(session.userEmail).catch(() => null);
      if (cancelled) return;

      const draft = readSignupDraft();

      setProfile({
        name: pending?.name || draft?.fullName || session.userName || "",
        email: pending?.email || draft?.email || session.userEmail || "",
        company: pending?.company || draft?.company || "",
        role: "",
        plan: pending?.planName || draft?.planSlug || "",
        subscribed: false,
        trialing: false,
        pendingCheckout: Boolean(pending || draft?.planSlug),
      });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [session.organizationId, session.userEmail, session.userName, session.role]);

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
                className="flex items-center justify-between rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm"
              >
                <span className="text-white/44">{label}</span>
                <span className="font-semibold text-white/78">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
