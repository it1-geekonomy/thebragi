"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { useAppSelector } from "@/store/hooks";
import {
  subscriptionApi,
  SubscriptionStatus,
} from "@/features/subscription/api";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";

export function ProfilePageClient() {
  const { session } = useAppSelector((state) => state);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const { plans } = useSubscriptionPlans();
  const router = useRouter();

  useEffect(() => {
    if (session.organizationId) {
      subscriptionApi
        .getSubscriptionStatus(session.organizationId)
        .then(setStatus)
        .catch(() => {});
    }
  }, [session.organizationId]);

  const dynamicPlan = plans.find(
    (p) =>
      p.slug === status?.plan?.toLowerCase() ||
      p.name.toLowerCase() === status?.plan?.toLowerCase(),
  );

  const displayRole = session.role
    ? session.role
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Workspace owner";

  const details = [
    ["Role", displayRole],
    ["Plan", dynamicPlan?.name || status?.plan || "No Plan"],
  ];

  const hasActivePlan =
    status?.status?.toUpperCase() === "ACTIVE" ||
    status?.status?.toUpperCase() === "TRIAL";

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">
            Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Profile</h1>
          <p className="mt-2 text-sm text-white/52">
            Manage your personal and company details.
          </p>
        </div>
        <Badge>Owner</Badge>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="grid gap-5 p-6">
          <h2 className="text-xl font-semibold text-white">
            Personal and company details
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="name"
              label="Name"
              defaultValue={session.userName || "User"}
              readOnly
              className="opacity-70 pointer-events-none"
            />
            <Input
              id="email"
              label="Email"
              type="email"
              defaultValue={session.userEmail || "user@company.com"}
              readOnly
              className="opacity-70 pointer-events-none"
            />
            <div className="sm:col-span-2">
              <Input
                id="company"
                label="Company"
                defaultValue="Preview company"
                readOnly
                className="opacity-70 pointer-events-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => {
                  if (hasActivePlan) {
                    router.push(ROUTES.dashboard);
                  } else {
                    router.push(ROUTES.pricing);
                  }
                }}
              >
                {hasActivePlan
                  ? "Edit in Workspace"
                  : "Upgrade to edit profile"}
              </Button>
            </div>
            {!hasActivePlan && (
              <p className="text-xs text-white/52">
                You need an active subscription to manage organization details.
              </p>
            )}
          </div>
        </Card>
        <div className="grid gap-5">
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
      </div>
    </main>
  );
}
