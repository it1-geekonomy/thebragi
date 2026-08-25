"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/config/routes";
import {
  subscriptionApi,
  SubscriptionStatus,
} from "@/features/subscription/api";
import { useAppSelector } from "@/store/hooks";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";
import { formatCurrency } from "@/shared/lib/format-currency";

export function BillingPageClient() {
  const { organizationId, subscriptionStatus } = useAppSelector((state) => state.session);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    subscriptionApi
      .getSubscriptionStatus(organizationId)
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load subscription status");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your auto-pay subscription? This action cannot be undone.",
      )
    )
      return;

    setCancelling(true);
    try {
      await subscriptionApi.cancelAutoPay();
      toast.success("Subscription auto-pay cancelled.");
      if (organizationId) {
        const data = await subscriptionApi.getSubscriptionStatus(organizationId);
        setStatus(data);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  if (loading || plansLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
      </div>
    );
  }

  const statusKind = status?.status?.toLowerCase() ?? "";
  const badgeColor =
    statusKind === "active"
      ? "bg-[#7dc890] text-black"
      : statusKind === "trial" || statusKind === "trialing"
        ? "bg-blue-300 text-black"
        : statusKind === "past_due" || statusKind === "expired"
          ? "bg-red-400 text-white"
          : "bg-white/10 text-white";

  const isAnnual = status?.billingCycle === "annual";

  const dynamicPlan = plans.find(
    (p) =>
      (status?.planId && p.id === status.planId) ||
      p.name.toLowerCase() === status?.plan?.toLowerCase() ||
      p.slug.toLowerCase() === status?.plan?.toLowerCase(),
  );

  const displayBasePrice =
    status?.priceAtActivation !== undefined
      ? status.priceAtActivation
      : dynamicPlan
        ? isAnnual
          ? dynamicPlan.priceAnnual
          : dynamicPlan.priceMonthly
        : null;

  const displayPerUserCost =
    status?.perUserCost !== undefined
      ? status.perUserCost
      : dynamicPlan
        ? isAnnual
          ? dynamicPlan.perUserCostAnnual
          : dynamicPlan.perUserCostMonthly
        : null;

  const displayIncludedUsers =
    status?.maxUsers ?? dynamicPlan?.includedUsers ?? dynamicPlan?.maxUsers ?? null;

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">
            Account
          </p>
          <h1 className="mt-3 text-[clamp(1.75rem,5vw,1.875rem)] font-semibold text-white sm:text-3xl">Billing</h1>
          <p className="mt-2 text-sm text-white/52">
            {!organizationId
              ? "Complete checkout to activate billing for this account."
              : "Manage your subscription and billing details."}
          </p>
        </div>
        <Link
          className="text-sm font-semibold text-[#a8dfb3] hover:text-white"
          href={ROUTES.pricing}
        >
          Compare plans
        </Link>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="min-w-0 text-lg font-semibold sm:text-xl">Current plan</h2>
            {status?.status ? (
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-md ${badgeColor}`}
              >
                {status.status}
              </span>
            ) : (
              <Badge>No Active Plan</Badge>
            )}
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">
            {status?.plan || dynamicPlan?.name || (!organizationId ? "Checkout pending" : "No Plan")}
          </p>
          {!organizationId ? (
            <p className="mt-3 text-sm text-white/52">
              {subscriptionStatus === "expired"
                ? "Your previous subscription has ended. Choose a plan to continue."
                : "No organization yet — finish trial authorization or payment to enable billing."}
            </p>
          ) : null}

          {(displayBasePrice !== null || displayIncludedUsers !== null || displayPerUserCost !== null) && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="grid gap-2 text-sm text-white/70">
                {displayBasePrice !== null && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
                    <span>Base package:</span>
                    <span className="min-w-0 font-medium text-white sm:text-right">
                      {formatCurrency(displayBasePrice)}/{isAnnual ? "yr" : "mo"}
                    </span>
                  </div>
                )}
                {displayIncludedUsers !== null && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
                    <span>Included users:</span>
                    <span className="min-w-0 font-medium text-white sm:text-right">
                      Up to {displayIncludedUsers > 0 ? displayIncludedUsers : "Unlimited"} users
                    </span>
                  </div>
                )}
                {status?.allocatedSeats && displayIncludedUsers && status.allocatedSeats > displayIncludedUsers ? (
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
                    <span>Allocated users:</span>
                    <span className="min-w-0 font-medium text-white sm:text-right">
                      {status.allocatedSeats} users
                    </span>
                  </div>
                ) : null}
                {displayPerUserCost !== null && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
                    <span>Additional users:</span>
                    <span className="min-w-0 font-medium text-white sm:text-right">
                      {formatCurrency(displayPerUserCost)}/user/{isAnnual ? "yr" : "mo"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(statusKind === "trial" || statusKind === "trialing") && (
            <p className="mt-3 text-sm text-white/52">
              {status?.endDate ? `Your trial ends on ${new Date(status.endDate).toLocaleDateString()}.` : ""}
              {status?.daysRemaining !== undefined ? ` (${status.daysRemaining} day${status.daysRemaining === 1 ? "" : "s"} remaining)` : ""}
            </p>
          )}

          {statusKind === "active" && (
            <p className="mt-3 text-sm text-white/52">
              {status?.endDate ? `Next renewal: ${new Date(status.endDate).toLocaleDateString()}.` : ""}
              {status?.autoPayEnabled !== undefined
                ? status.autoPayEnabled
                  ? " Auto-pay is active."
                  : " Auto-pay is inactive."
                : ""}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => (window.location.href = ROUTES.pricing)}
            >
              Change Plan
            </Button>
            {status?.autoPayEnabled === true && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Auto-Pay"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
