import { ROUTES } from "@/config/routes";
import type { BillingCycle, PurchaseMode } from "@/features/checkout/lib/checkout-params";
import { paymentApi } from "@/features/subscription/services/paymentApi";
import type { DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";

export type PendingSignupProfile = {
  name: string | null;
  email: string;
  company: string;
  industry: string | null;
  planId: string;
  planName: string | null;
  status: string;
};

export function planSlugFromPending(plans: DynamicPlan[], planId: string) {
  return plans.find((plan) => plan.id === planId)?.slug ?? null;
}

export function checkoutPathForPending(
  plans: DynamicPlan[],
  pending: PendingSignupProfile,
  opts?: { cycle?: BillingCycle; mode?: PurchaseMode; planSlug?: string | null },
) {
  const slug = opts?.planSlug || planSlugFromPending(plans, pending.planId);
  if (!slug) return null;
  return ROUTES.checkout(slug, {
    cycle: opts?.cycle ?? "annual",
    mode: opts?.mode ?? "trial",
  });
}

export function pricingPathForPending(plans: DynamicPlan[], pending: PendingSignupProfile) {
  const slug = planSlugFromPending(plans, pending.planId);
  return slug ? `${ROUTES.pricing}?plan=${encodeURIComponent(slug)}` : ROUTES.pricing;
}

export async function fetchPendingSignup(email: string) {
  try {
    return await paymentApi.getPendingSignup(email);
  } catch {
    return null;
  }
}
