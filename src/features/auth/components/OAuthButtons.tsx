"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  oauthLogin,
  triggerGoogleSignIn,
  triggerMicrosoftSignIn,
  GOOGLE_CLIENT_ID,
  MICROSOFT_CLIENT_ID,
} from "@/features/auth/lib/oauth";
import { type AuthResponse } from "@/features/auth/lib/auth-session";
import { getApiErrorMessage } from "@/shared/lib/api-client";

type OAuthButtonsProps = {
  onOAuthSuccess: (data: AuthResponse, provider: "google" | "microsoft") => void | Promise<void>;
  disabled?: boolean;
};

export function OAuthButtons({ onOAuthSuccess, disabled = false }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "microsoft" | null>(null);

  const handleGoogleSignIn = async () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error("Google login is not configured.");
      return;
    }

    setLoadingProvider("google");
    try {
      const idToken = await triggerGoogleSignIn();
      const authData = await oauthLogin("google", idToken);
      await onOAuthSuccess(authData, "google");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Google sign-in failed."));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleMicrosoftSignIn = async () => {
    if (!MICROSOFT_CLIENT_ID) {
      toast.error("Microsoft login is not configured.");
      return;
    }

    setLoadingProvider("microsoft");
    try {
      const idToken = await triggerMicrosoftSignIn();
      const authData = await oauthLogin("microsoft", idToken);
      await onOAuthSuccess(authData, "microsoft");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Microsoft sign-in failed."));
    } finally {
      setLoadingProvider(null);
    }
  };

  const isAnyLoading = loadingProvider !== null || disabled;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        disabled={isAnyLoading}
        onClick={handleGoogleSignIn}
        className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-white/12 bg-white/[0.04] px-4 text-xs font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08] disabled:opacity-50"
      >
        {loadingProvider === "google" ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.56 0 2.96.54 4.07 1.6l3.05-3.05C17.26 1.83 14.81 1 12 1 7.42 1 3.53 3.6 1.63 7.37l3.69 2.86C6.2 7.39 8.85 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.94 3.71-8.7z"
            />
            <path
              fill="#FBBC05"
              d="M5.32 14.77c-.24-.72-.38-1.49-.38-2.27 0-.78.14-1.55.38-2.27L1.63 7.37C.6 9.44 0 11.66 0 14s.6 4.56 1.63 6.63l3.69-2.86z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.15 0-5.8-2.39-6.68-5.23L1.63 16.01C3.53 19.78 7.42 23 12 23z"
            />
          </svg>
        )}
        <span>Google</span>
      </button>

      <button
        type="button"
        disabled={isAnyLoading}
        onClick={handleMicrosoftSignIn}
        className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-white/12 bg-white/[0.04] px-4 text-xs font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08] disabled:opacity-50"
      >
        {loadingProvider === "microsoft" ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
        )}
        <span>Microsoft</span>
      </button>
    </div>
  );
}
