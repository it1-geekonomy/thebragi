import { ROUTES } from "@/config/routes";
import type { SubscriptionStatus } from "@/store";
import { getApiUrl } from "@/shared/lib/api-client";
import {
  getInactiveSubscriptionDestination,
  hasActiveSubscription,
} from "@/features/auth/lib/subscription";

export type PostAuthInput = {
  isNewSignup: boolean;
  subscriptionStatus: SubscriptionStatus;
  activePlan?: string | null;
  returnTo?: string | null;
};

export type AuthSessionDetails = {
  subscriptionStatus: SubscriptionStatus;
  activePlan: string | null;
  organizationId: string | null;
  userName: string | null;
  userEmail: string | null;
  role: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  ok: boolean;
};

type SessionApiResponse = {
  organizationId?: string;
  organizationStatus?: string;
  activePlan?: string;
  subscriptionStatus?: string;
  subscription?: { status?: string; planSlug?: string };
  user?: { createdAt?: string; name?: string; email?: string; organizationStatus?: string };
  role?: string;
};

const EMPTY_SESSION: AuthSessionDetails = {
  subscriptionStatus: "none",
  activePlan: null,
  organizationId: null,
  userName: null,
  userEmail: null,
  role: null,
  trialStartedAt: null,
  trialEndsAt: null,
  ok: false,
};

function normalizeSubscriptionStatus(value?: string | null): SubscriptionStatus {
  const status = value?.toLowerCase();
  if (status === "trialing" || status === "trial") return "trialing";
  if (status === "active" || status === "subscribed") return "active";
  // Ended subscriptions only — org register uses "inactive", which must stay "none"
  if (status === "cancelled" || status === "canceled" || status === "past_due" || status === "expired") {
    return "expired";
  }
  return "none";
}

/** Only same-origin relative app paths — blocks open redirects. */
export function sanitizeReturnTo(returnTo?: string | null): string | null {
  if (!returnTo) return null;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return null;
  if (returnTo.includes("://")) return null;
  return returnTo;
}

export function getPostAuthDestination({
  isNewSignup,
  subscriptionStatus,
  activePlan,
  returnTo,
}: PostAuthInput) {
  const safeReturnTo = sanitizeReturnTo(returnTo);

  if (safeReturnTo?.startsWith("/checkout")) {
    return safeReturnTo;
  }

  if (hasActiveSubscription(subscriptionStatus, activePlan)) {
    return isNewSignup ? ROUTES.billingConfirmation : ROUTES.dashboard;
  }

  // Never-subscribed / unpaid → pricing. Truly expired → expired page.
  return getInactiveSubscriptionDestination(subscriptionStatus);
}

export async function fetchAuthSessionDetails(token: string): Promise<AuthSessionDetails> {
  try {
    const response = await fetch(`${getApiUrl()}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return EMPTY_SESSION;

    const data = (await response.json()) as SessionApiResponse;
    // Prefer subscription fields — organizationStatus is "inactive" for brand-new orgs
    const rawStatus =
      data.subscriptionStatus ??
      data.subscription?.status ??
      data.organizationStatus ??
      data.user?.organizationStatus;
    let subscriptionStatus = normalizeSubscriptionStatus(rawStatus);
    let activePlan = data.activePlan ?? data.subscription?.planSlug ?? null;
    let trialStartedAt: string | null = null;
    let trialEndsAt: string | null = null;

    if (data.organizationId) {
      try {
        const subResponse = await fetch(`${getApiUrl()}/subscription/status/${data.organizationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subResponse.ok) {
          const subData = (await subResponse.json()) as {
            plan?: string;
            status?: string;
            startDate?: string;
            endDate?: string;
          };
          if (subData.plan) activePlan = subData.plan.toLowerCase();
          if (subData.status) subscriptionStatus = normalizeSubscriptionStatus(subData.status);
          trialStartedAt = subData.startDate ?? null;
          trialEndsAt = subData.endDate ?? null;
        }
      } catch {
        // keep session fields we already have
      }
    }

    return {
      subscriptionStatus,
      activePlan,
      organizationId: data.organizationId ?? null,
      userName: data.user?.name ?? null,
      userEmail: data.user?.email ?? null,
      role: data.role ?? null,
      trialStartedAt,
      trialEndsAt,
      ok: true,
    };
  } catch {
    return EMPTY_SESSION;
  }
}
