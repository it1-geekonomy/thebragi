import { ROUTES } from "@/config/routes";
import type { SubscriptionStatus } from "@/store";
import { API_URL } from "@/shared/lib/api-client";

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

function normalizeSubscriptionStatus(
  value?: string | null,
): SubscriptionStatus {
  const status = value?.toLowerCase();
  if (status === "trialing" || status === "trial") return "trialing";
  if (status === "active" || status === "subscribed") return "active";
  if (
    status === "expired" ||
    status === "cancelled" ||
    status === "canceled" ||
    status === "none"
  )
    return "none";
  return "none";
}

export function getPostAuthDestination({
  isNewSignup,
  subscriptionStatus,
  activePlan,
  returnTo,
}: PostAuthInput) {
  if (returnTo?.startsWith("/checkout")) {
    return returnTo;
  }

  if (isNewSignup) {
    return ROUTES.billingConfirmation;
  }

  if ((subscriptionStatus === "active" || subscriptionStatus === "trialing") && activePlan) {
    return ROUTES.dashboard;
  }

  return ROUTES.subscriptionExpired;
}

export async function fetchAuthSessionDetails(
  token: string,
): Promise<AuthSessionDetails> {
  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return {
        subscriptionStatus: "active",
        activePlan: null,
        organizationId: null,
        userName: null,
        userEmail: null,
        role: null,
      };
    }

    const data = (await response.json()) as SessionApiResponse;
    const rawStatus = data.organizationStatus ?? data.user?.organizationStatus ?? data.subscriptionStatus ?? data.subscription?.status;
    let subscriptionStatus = normalizeSubscriptionStatus(rawStatus);
    let activePlan = data.activePlan ?? data.subscription?.planSlug ?? null;

    if (data.organizationId && !activePlan) {
      try {
        const subResponse = await fetch(`${API_URL}/subscription/status/${data.organizationId}`);
        if (subResponse.ok) {
          const subData = await subResponse.json();
          if (subData.plan) activePlan = subData.plan.toLowerCase();
          if (subData.status) subscriptionStatus = normalizeSubscriptionStatus(subData.status);
        }
      } catch (e) {
        // Ignore
      }
    }

    return {
      subscriptionStatus,
      activePlan,
      organizationId: data.organizationId ?? null,
      userName: data.user?.name ?? null,
      userEmail: data.user?.email ?? null,
      role: data.role ?? null,
    };
  } catch {
    return {
      subscriptionStatus: "active",
      activePlan: null,
      organizationId: null,
      userName: null,
      userEmail: null,
      role: null,
    };
  }
}
