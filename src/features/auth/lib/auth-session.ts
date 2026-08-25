import { setMockSession, type AppDispatch, type SubscriptionStatus } from "@/store";
import { apiClient } from "@/shared/lib/api-client";
import { fetchAuthSessionDetails } from "@/features/auth/lib/post-auth-routing";
import { saveSignupDraft, type SignupDraft } from "@/features/checkout/lib/billing-session";

type SessionUser = {
  id?: string;
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  organizationId?: string | null;
};

export type OrganizationSummary = {
  id: string;
  name?: string;
  companyName?: string;
  role?: string;
  status?: string;
  isCurrent?: boolean;
};

export type AuthResponse = {
  accessToken?: string;
  code?: string;
  message?: string;
  pendingTrialId?: string;
  organizationId?: string;
  subscriptionStatus?: string;
  activePlan?: string;
  plan?: string;
  planSlug?: string;
  user?: SessionUser;
  requires_org_selection?: boolean;
  session_key?: string;
  orgs?: OrganizationSummary[];
  authProvider?: "local" | "google" | "microsoft";
  providerUserId?: string;
  email?: string;
  name?: string;
};

export type SessionDetails = {
  subscriptionStatus: SubscriptionStatus;
  activePlan?: string;
  organizationId?: string | null;
  requiresOrgSelection?: boolean;
};

export const ORG_SELECTION_SESSION_KEY = "bragi_org_selection_session";

export type OrgSelectionSessionData = {
  sessionKey: string;
  orgs: OrganizationSummary[];
  email: string;
};

export function saveOrgSelectionSession(sessionKey: string, orgs: OrganizationSummary[], email: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      ORG_SELECTION_SESSION_KEY,
      JSON.stringify({ sessionKey, orgs, email }),
    );
  }
}

export function readOrgSelectionSession(): OrgSelectionSessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ORG_SELECTION_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearOrgSelectionSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ORG_SELECTION_SESSION_KEY);
  }
}

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

export async function applyAuthSession(
  dispatch: AppDispatch,
  data: AuthResponse,
  email: string,
): Promise<{ requiresOrgSelection: boolean }> {
  if (data.requires_org_selection && data.session_key) {
    saveOrgSelectionSession(data.session_key, data.orgs ?? [], email);
    return { requiresOrgSelection: true };
  }

  const rawToken = (data.accessToken ?? "").replace(/^Bearer\s+/i, "");
  if (rawToken) {
    localStorage.setItem("accessToken", rawToken);
  }

  const orgId = data.organizationId ?? data.user?.organizationId ?? null;
  const initialPlan = data.activePlan ?? data.plan ?? data.planSlug ?? null;

  dispatch(
    setMockSession({
      isAuthenticated: true,
      userEmail: email || data.user?.email || null,
      userName: data.user?.name ?? email.split("@")[0],
      scope: "full",
      organizationId: orgId,
      activePlan: initialPlan,
      role: data.user?.role ?? null,
    }),
  );

  return { requiresOrgSelection: false };
}

export async function initAuthSession(
  dispatch: AppDispatch,
  data: AuthResponse,
  email: string,
  isNewSignup = false,
): Promise<SessionDetails> {
  const result = await applyAuthSession(dispatch, data, email);

  if (result.requiresOrgSelection) {
    return {
      subscriptionStatus: "none",
      activePlan: undefined,
      organizationId: null,
      requiresOrgSelection: true,
    };
  }

  const token = localStorage.getItem("accessToken") ?? "";
  const sessionDetails = await fetchAuthSessionDetails(token);

  const resolvedStatus: SubscriptionStatus =
    sessionDetails.subscriptionStatus !== "none"
      ? sessionDetails.subscriptionStatus
      : data.subscriptionStatus
        ? (data.subscriptionStatus.toLowerCase() === "active" || data.subscriptionStatus.toLowerCase() === "completed"
            ? "active"
            : data.subscriptionStatus.toLowerCase() === "trialing"
              ? "trialing"
              : "none")
        : "none";

  const resolvedPlan =
    sessionDetails.activePlan ||
    data.activePlan ||
    data.plan ||
    data.planSlug ||
    null;

  const resolvedOrgId =
    sessionDetails.organizationId ||
    data.organizationId ||
    data.user?.organizationId ||
    null;

  dispatch(
    setMockSession({
      isNewSignup,
      subscriptionStatus: resolvedStatus,
      activePlan: resolvedPlan,
      organizationId: resolvedOrgId,
      userName: sessionDetails.userName || data.user?.name || email.split("@")[0],
      userEmail: sessionDetails.userEmail || email,
      role: sessionDetails.role || data.user?.role || null,
      trialStartedAt: sessionDetails.trialStartedAt,
      trialEndsAt: sessionDetails.trialEndsAt,
    }),
  );

  return {
    subscriptionStatus: resolvedStatus,
    activePlan: resolvedPlan ?? undefined,
    organizationId: resolvedOrgId,
    requiresOrgSelection: false,
  };
}

export async function submitOrganizationSelection(
  dispatch: AppDispatch,
  sessionKey: string,
  organizationId: string,
  email?: string,
): Promise<SessionDetails> {
  const response = await apiClient<{ accessToken: string; user?: SessionUser }>("/auth/select-organization", {
    method: "POST",
    body: JSON.stringify({ sessionKey, organizationId }),
  });

  const selectedToken = (response.accessToken ?? "").replace(/^Bearer\s+/i, "");
  if (selectedToken) {
    localStorage.setItem("accessToken", selectedToken);
  }

  clearOrgSelectionSession();

  const sessionDetails = await fetchAuthSessionDetails(selectedToken);

  dispatch(
    setMockSession({
      isAuthenticated: true,
      scope: "full",
      userEmail: email || sessionDetails.userEmail || response.user?.email || null,
      userName: sessionDetails.userName || response.user?.name || (email ? email.split("@")[0] : "User"),
      role: sessionDetails.role || response.user?.role || null,
      organizationId: sessionDetails.organizationId || organizationId,
      subscriptionStatus: sessionDetails.subscriptionStatus,
      activePlan: sessionDetails.activePlan,
      trialStartedAt: sessionDetails.trialStartedAt,
      trialEndsAt: sessionDetails.trialEndsAt,
    }),
  );

  return {
    subscriptionStatus: sessionDetails.subscriptionStatus,
    activePlan: sessionDetails.activePlan ?? undefined,
    organizationId: sessionDetails.organizationId || organizationId,
    requiresOrgSelection: false,
  };
}
