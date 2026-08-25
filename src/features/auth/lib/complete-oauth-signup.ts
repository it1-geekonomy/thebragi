"use client";

import type { AppDispatch } from "@/store";
import { ROUTES } from "@/config/routes";
import { applyPendingSession } from "@/features/auth/lib/auth-session";
import { paymentApi } from "@/features/subscription/services/paymentApi";
import {
  clearOAuthIdentityDraft,
  type OAuthIdentityDraft,
} from "@/features/auth/lib/oauth";
import type { DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";
import type { BillingCycle, PurchaseMode } from "@/features/checkout/lib/checkout-params";

/** Placeholder org name until checkout billing legal name is collected. */
export function provisionalCompanyName(fullName: string, email: string) {
  const fromName = fullName.trim();
  if (fromName) return `${fromName}'s workspace`;
  const local = email.split("@")[0]?.trim();
  return local ? `${local}'s workspace` : "My workspace";
}

/**
 * Google/Microsoft signup: store pending auth.
 * - plan optional → user picks plan later on pricing
 * - company/industry/phone collected at checkout billing
 */
export async function completeOAuthSignup(opts: {
  dispatch: AppDispatch;
  oauth: OAuthIdentityDraft;
  plan?: DynamicPlan | null;
  returnTo: string;
  purchaseMode?: PurchaseMode;
  cycle?: BillingCycle;
}) {
  const { dispatch, oauth, plan, returnTo, purchaseMode = "trial", cycle = "annual" } = opts;
  const fullName = oauth.name?.trim() || oauth.email.split("@")[0] || "User";
  const company = provisionalCompanyName(fullName, oauth.email);

  const captured = await paymentApi.captureSignup({
    name: company,
    superAdminEmail: oauth.email,
    superAdminName: fullName,
    ...(plan ? { planId: plan.id, billingCycle: cycle } : {}),
    authProvider: oauth.authProvider,
    providerUserId: oauth.providerUserId,
    emailVerified: oauth.emailVerified,
  });

  applyPendingSession(dispatch, {
    fullName,
    email: oauth.email,
    company,
    industry: "",
    password: "",
    authProvider: oauth.authProvider,
    providerUserId: oauth.providerUserId,
    emailVerified: oauth.emailVerified,
    idToken: oauth.idToken,
    pendingTrialId: captured.pendingTrialId,
    planId: plan?.id,
    planSlug: plan?.slug,
    purchaseMode,
    cycle,
  });

  clearOAuthIdentityDraft();

  if (plan) {
    if (returnTo.startsWith("/checkout")) return returnTo;
    return ROUTES.checkout(plan.slug, { cycle, mode: purchaseMode });
  }

  return ROUTES.pricing;
}
