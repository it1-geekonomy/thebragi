"use client";

export type OAuthProvider = "google" | "microsoft";

export type OAuthIdentityDraft = {
  authProvider: OAuthProvider;
  providerUserId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  idToken?: string;
};

type OAuthStatePayload = {
  provider: OAuthProvider;
  mode: "signin" | "signup";
  returnTo: string;
  nonce: string;
};

const OAUTH_STATE_KEY = "bragi_oauth_state";
const OAUTH_DRAFT_KEY = "bragi_oauth_identity";

function randomNonce() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** base64url — avoids `+` being turned into a space by URLSearchParams */
function encodeOAuthState(payload: OAuthStatePayload): string {
  const json = JSON.stringify(payload);
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeOAuthState(state: string): OAuthStatePayload {
  const b64 = state.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return JSON.parse(atob(padded)) as OAuthStatePayload;
}

export function saveOAuthIdentityDraft(draft: OAuthIdentityDraft) {
  sessionStorage.setItem(OAUTH_DRAFT_KEY, JSON.stringify(draft));
}

export function readOAuthIdentityDraft(): OAuthIdentityDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OAUTH_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as OAuthIdentityDraft;
    if (!draft.authProvider || !draft.providerUserId || !draft.email) return null;
    return draft;
  } catch {
    return null;
  }
}

export function clearOAuthIdentityDraft() {
  sessionStorage.removeItem(OAUTH_DRAFT_KEY);
}

export function beginOAuthRedirect(
  provider: OAuthProvider,
  opts: { mode: "signin" | "signup"; returnTo: string },
) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const microsoftClientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID?.trim();
  const redirectUri = `${window.location.origin}/sign-in`;
  const nonce = randomNonce();
  const statePayload: OAuthStatePayload = {
    provider,
    mode: opts.mode,
    returnTo: opts.returnTo,
    nonce,
  };
  const state = encodeOAuthState(statePayload);
  sessionStorage.setItem(OAUTH_STATE_KEY, state);

  if (provider === "google") {
    if (!googleClientId) {
      throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.");
    }
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", googleClientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "id_token");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    window.location.href = url.toString();
    return;
  }

  if (!microsoftClientId) {
    throw new Error("NEXT_PUBLIC_MICROSOFT_CLIENT_ID is not set.");
  }
  // Single-tenant Azure apps cannot use /common (AADSTS50194). Use Directory (tenant) ID.
  const tenant = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID?.trim();
  if (!tenant || tenant === "common" || tenant === "organizations" || tenant === "consumers") {
    throw new Error(
      "Set NEXT_PUBLIC_MICROSOFT_TENANT_ID to your Azure Directory (tenant) ID. Single-tenant apps cannot use /common.",
    );
  }
  const url = new URL(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
  );
  url.searchParams.set("client_id", microsoftClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "id_token");
  url.searchParams.set("response_mode", "fragment");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  window.location.href = url.toString();
}

export function consumeOAuthRedirectResult(): {
  provider: OAuthProvider;
  mode: "signin" | "signup";
  returnTo: string;
  idToken: string;
} | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash?.replace(/^#/, "");
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const idToken = params.get("id_token");
  const state = params.get("state");
  const error = params.get("error_description") || params.get("error");

  // Clear sensitive tokens from the URL bar.
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, "", cleanUrl);

  if (error) {
    throw new Error(error);
  }
  if (!idToken || !state) return null;

  const saved = sessionStorage.getItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);

  // No in-progress OAuth in this tab (browser Back after login, leftover hash
  // after logout, or a refreshed callback URL). Clear the fragment and ignore.
  if (!saved) {
    return null;
  }
  if (saved !== state) {
    throw new Error("OAuth state mismatch. Please try again.");
  }

  let payload: OAuthStatePayload;
  try {
    payload = decodeOAuthState(state);
  } catch {
    throw new Error("Invalid OAuth state.");
  }

  return {
    provider: payload.provider,
    mode: payload.mode,
    returnTo: payload.returnTo,
    idToken,
  };
}
