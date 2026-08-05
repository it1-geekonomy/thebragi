import { ROUTES } from "@/config/routes";
import type { SubscriptionStatus } from "@/store";
import { API_URL } from "@/shared/lib/api-client";

export type PostAuthInput = {
  isNewSignup: boolean;
  subscriptionStatus: SubscriptionStatus;
  returnTo?: string | null;
};

export type AuthSessionDetails = {
  subscriptionStatus: SubscriptionStatus;
  activePlan: string | null;
  organizationId: string | null;
};

type SessionApiResponse = {
  organizationId?: string;
  activePlan?: string;
  subscriptionStatus?: string;
  subscription?: { status?: string; planSlug?: string };
  user?: { createdAt?: string };
};

function normalizeSubscriptionStatus(value?: string | null): SubscriptionStatus {
  const status = value?.toLowerCase();
  if (status === "trialing" || status === "trial") return "trialing";
  if (status === "active" || status === "subscribed") return "active";
  if (status === "expired" || status === "cancelled" || status === "canceled" || status === "none") return "none";
  return "none";
}

export function getPostAuthDestination({ isNewSignup, subscriptionStatus, returnTo }: PostAuthInput) {
  if (returnTo?.startsWith("/checkout")) {
    return returnTo;
  }

  if (isNewSignup) {
    return ROUTES.billingConfirmation;
  }

  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    return ROUTES.continue;
  }

  return ROUTES.subscriptionExpired;
}

export async function fetchAuthSessionDetails(token: string): Promise<AuthSessionDetails> {
  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return { subscriptionStatus: "active", activePlan: null, organizationId: null };
    }

    const data = (await response.json()) as SessionApiResponse;
    const rawStatus = data.subscriptionStatus ?? data.subscription?.status;
    const subscriptionStatus = normalizeSubscriptionStatus(rawStatus);

    return {
      subscriptionStatus,
      activePlan: data.activePlan ?? data.subscription?.planSlug ?? null,
      organizationId: data.organizationId ?? null,
    };
  } catch {
    return { subscriptionStatus: "active", activePlan: null, organizationId: null };
  }
}
