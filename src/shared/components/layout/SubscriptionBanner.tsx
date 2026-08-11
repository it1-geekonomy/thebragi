"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subscriptionApi, SubscriptionStatus } from "@/features/subscription/api";
import { useAppSelector } from "@/store/hooks";
import { ROUTES } from "@/config/routes";

export function SubscriptionBanner() {
  const { organizationId } = useAppSelector((state) => state.session);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    subscriptionApi.getSubscriptionStatus(organizationId)
      .then(setStatus)
      .catch(() => {});
  }, [organizationId]);

  if (!status) return null;

  if (status.status.toLowerCase() === "trial") {
    return (
      <div className="bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white">
        {status.daysRemaining} days remaining in trial.{" "}
        <Link href={ROUTES.account.billing} className="underline hover:text-blue-200">
          Click to confirm your subscription.
        </Link>
      </div>
    );
  }

  if (status.status.toLowerCase() === "past_due") {
    return (
      <div className="bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">
        Your payment is past due, please update billing.{" "}
        <Link href={ROUTES.account.billing} className="underline hover:text-red-200">
          Upgrade or update payment method.
        </Link>
      </div>
    );
  }

  return null;
}
