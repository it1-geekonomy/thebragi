import { ROUTES } from "@/config/routes";
import type { SubscriptionStatus } from "@/store";

export function hasActiveSubscription(status: SubscriptionStatus | null, activePlan?: string | null) {
  return (status === "active" || status === "trialing") && !!activePlan;
}

export function accessKind(
  status: SubscriptionStatus | null,
  activePlan?: string | null,
): "trialing" | "active" | "expired" | "pending" {
  if (status === "expired") return "expired";
  if (status === "trialing" && activePlan) return "trialing";
  if (status === "active" && activePlan) return "active";
  return "pending";
}

/** Where to send authenticated users who cannot open the app yet. */
export function getInactiveSubscriptionDestination(status: SubscriptionStatus | null) {
  return status === "expired" ? ROUTES.subscriptionExpired : ROUTES.pricing;
}
