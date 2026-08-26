import { apiClient } from "@/shared/lib/api-client";
import { type AuthResponse } from "@/features/auth/lib/auth-session";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
export const MICROSOFT_CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "";
export const MICROSOFT_TENANT_ID = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || "common";

export type OAuthProvider = "google" | "microsoft";

export type OAuthIdentityDraft = {
  authProvider: OAuthProvider;
  providerUserId: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  idToken?: string;
};

const OAUTH_DRAFT_KEY = "bragi_oauth_identity_draft";
const OAUTH_REDIRECT_KEY = "bragi_oauth_redirect_pending";

export function saveOAuthIdentityDraft(draft: OAuthIdentityDraft) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(OAUTH_DRAFT_KEY, JSON.stringify(draft));
  }
}

export function readOAuthIdentityDraft(): OAuthIdentityDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OAUTH_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearOAuthIdentityDraft() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(OAUTH_DRAFT_KEY);
  }
}

export async function oauthLogin(
  authProvider: "google" | "microsoft",
  idToken: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/oauth", {
    method: "POST",
    body: JSON.stringify({ authProvider, idToken }),
  });
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as unknown as { google?: { accounts?: { id?: unknown } } }).google?.accounts?.id) {
      return resolve();
    }
    const existing = document.getElementById("google-gsi-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In script"));
    document.head.appendChild(script);
  });
}

export function triggerGoogleSignIn(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      return reject(new Error("Google Client ID is not configured."));
    }

    try {
      await loadGoogleScript();
    } catch (err) {
      return reject(err);
    }

    const google = (window as unknown as { google?: any }).google;
    if (!google?.accounts?.id) {
      return reject(new Error("Google Identity Services not available."));
    }

    let isResolved = false;

    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential?: string }) => {
          if (response?.credential && !isResolved) {
            isResolved = true;
            resolve(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render a hidden Google Button to programmatically trigger standard popup UX
      const hiddenContainer = document.createElement("div");
      hiddenContainer.style.position = "absolute";
      hiddenContainer.style.top = "-9999px";
      hiddenContainer.style.left = "-9999px";
      hiddenContainer.style.opacity = "0";
      document.body.appendChild(hiddenContainer);

      google.accounts.id.renderButton(hiddenContainer, {
        type: "standard",
        theme: "outline",
        size: "large",
        click_listener: () => { },
      });

      // Find the inner button and click it to open Google's consent popup
      const btn = hiddenContainer.querySelector("div[role=button]") as HTMLElement;
      if (btn) {
        btn.click();
      } else {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            if (!isResolved) {
              if (document.body.contains(hiddenContainer)) {
                document.body.removeChild(hiddenContainer);
              }
              reject(new Error("Google Sign-In prompt was dismissed or unavailable."));
            }
          }
        });
      }

      setTimeout(() => {
        if (document.body.contains(hiddenContainer)) {
          document.body.removeChild(hiddenContainer);
        }
      }, 5000);
    } catch (err) {
      reject(err);
    }
  });
}

export function triggerMicrosoftSignIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!MICROSOFT_CLIENT_ID) {
      return reject(new Error("Microsoft Client ID is not configured."));
    }

    const tenant = MICROSOFT_TENANT_ID || "common";
    const redirectUri = `${window.location.origin}/auth/callback/microsoft`;
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const state = Math.random().toString(36).substring(2, 15);

    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${encodeURIComponent(
      MICROSOFT_CLIENT_ID,
    )}&response_type=id_token&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=openid%20profile%20email&response_mode=fragment&state=${state}&nonce=${nonce}`;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "microsoft_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=no`,
    );

    if (!popup) {
      return reject(new Error("Popup blocked. Please allow popups for this site."));
    }

    let isDone = false;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "MS_OAUTH_TOKEN" && event.data?.idToken) {
        isDone = true;
        window.removeEventListener("message", handleMessage);
        resolve(event.data.idToken);
      } else if (event.data?.type === "MS_OAUTH_ERROR") {
        isDone = true;
        window.removeEventListener("message", handleMessage);
        reject(new Error(event.data.error || "Microsoft login failed."));
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosedInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosedInterval);
        window.removeEventListener("message", handleMessage);
        if (!isDone) {
          reject(new Error("Microsoft login cancelled."));
        }
      }
    }, 800);
  });
}

export function beginOAuthRedirect(
  provider: OAuthProvider,
  opts: { mode: "signin" | "signup"; returnTo?: string },
) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      OAUTH_REDIRECT_KEY,
      JSON.stringify({ provider, mode: opts.mode, returnTo: opts.returnTo }),
    );
  }
  if (provider === "google") {
    triggerGoogleSignIn().then((idToken) => {
      window.postMessage({ type: "OAUTH_REDIRECT_SUCCESS", provider, idToken }, window.location.origin);
    });
  } else {
    triggerMicrosoftSignIn().then((idToken) => {
      window.postMessage({ type: "OAUTH_REDIRECT_SUCCESS", provider, idToken }, window.location.origin);
    });
  }
}

export function consumeOAuthRedirectResult(): {
  provider: OAuthProvider;
  idToken: string;
  mode?: "signin" | "signup";
  returnTo?: string;
} | null {
  return null;
}
