import type { SubscriptionStatus } from "@/store";

export function hasActiveSubscription(status: SubscriptionStatus | null, activePlan?: string | null) {
  return (status === "active" || status === "trialing") && !!activePlan;
}
