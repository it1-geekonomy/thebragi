import { ROUTES } from "@/config/routes";
import type { SubscriptionStatus } from "@/store";

export function hasActiveSubscription(status: SubscriptionStatus | null, activePlan?: string | null) {
  return (status === "active" || status === "trialing") && !!activePlan;
}

/** Where to send authenticated users who cannot open the app yet. */
export function getInactiveSubscriptionDestination(status: SubscriptionStatus | null) {
  return status === "expired" ? ROUTES.subscriptionExpired : ROUTES.pricing;
}
