import { setMockSession, type AppDispatch, type SubscriptionStatus } from "@/store";
import { apiClient } from "@/shared/lib/api-client";
import { fetchAuthSessionDetails } from "@/features/auth/lib/post-auth-routing";
import { saveSignupDraft, type SignupDraft } from "@/features/checkout/lib/billing-session";

type SessionUser = {
  name?: string;
  organizationId?: string | null;
};

export type AuthResponse = {
  accessToken?: string;
  code?: string;
  user?: SessionUser & { email?: string; company?: string };
  requires_org_selection?: boolean;
  session_key?: string;
  orgs?: { id: string }[];
  pendingTrialId?: string;
};

export type SessionDetails = {
  subscriptionStatus: SubscriptionStatus;
  activePlan?: string;
  organizationId?: string | null;
};

export function applyPendingSession(dispatch: AppDispatch, draft: SignupDraft) {
  saveSignupDraft(draft);
  dispatch(
    setMockSession({
      isAuthenticated: true,
      scope: "checkout",
      userEmail: draft.email,
      userName: draft.fullName,
      subscriptionStatus: "none",
      activePlan: null,
      organizationId: null,
      isNewSignup: true,
    }),
  );
}

export async function applyAuthSession(dispatch: AppDispatch, data: AuthResponse, email: string) {
  const rawToken = (data.accessToken ?? "").replace(/^Bearer\s+/i, "");
  localStorage.setItem("accessToken", rawToken);

  if (data.requires_org_selection) {
    const orgs = data.orgs ?? [];
    const selected = await apiClient<{ accessToken: string; user: SessionUser }>("/auth/select-organization", {
      method: "POST",
      body: JSON.stringify({ sessionKey: data.session_key, organizationId: orgs[0]?.id }),
    });
    const selectedToken = (selected.accessToken ?? "").replace(/^Bearer\s+/i, "");
    localStorage.setItem("accessToken", selectedToken);
    dispatch(
      setMockSession({
        isAuthenticated: true,
        userEmail: email,
        userName: selected.user?.name ?? email.split("@")[0],
        scope: "full",
        organizationId: selected.user?.organizationId ?? orgs[0]?.id,
      }),
    );
    return;
  }

  dispatch(
    setMockSession({
      isAuthenticated: true,
      userEmail: email,
      userName: data.user?.name ?? email.split("@")[0],
      scope: "full",
      organizationId: data.user?.organizationId ?? null,
    }),
  );
}

export async function initAuthSession(
  dispatch: AppDispatch,
  data: AuthResponse,
  email: string,
  isNewSignup = false,
): Promise<SessionDetails> {
  await applyAuthSession(dispatch, data, email);

  const token = localStorage.getItem("accessToken") ?? "";
  const sessionDetails = await fetchAuthSessionDetails(token);

  dispatch(
    setMockSession({
      isNewSignup,
      subscriptionStatus: sessionDetails.subscriptionStatus,
      activePlan: sessionDetails.activePlan,
      organizationId: sessionDetails.organizationId,
      trialStartedAt: sessionDetails.trialStartedAt,
      trialEndsAt: sessionDetails.trialEndsAt,
    }),
  );

  return {
    subscriptionStatus: sessionDetails.subscriptionStatus,
    activePlan: sessionDetails.activePlan ?? undefined,
    organizationId: sessionDetails.organizationId,
  };
}
