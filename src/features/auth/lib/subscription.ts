import type { SubscriptionStatus } from "@/store";

export function hasActiveSubscription(status: SubscriptionStatus | null) {
  return status === "active" || status === "trialing";
}
