"use client";

import { useEffect } from "react";

export default function MicrosoftCallbackPage() {
  useEffect(() => {
    try {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get("id_token");
      const error = params.get("error_description") || params.get("error");

      if (window.opener) {
        if (idToken) {
          window.opener.postMessage(
            { type: "MS_OAUTH_TOKEN", idToken },
            window.location.origin,
          );
        } else if (error) {
          window.opener.postMessage(
            { type: "MS_OAUTH_ERROR", error },
            window.location.origin,
          );
        }
        window.close();
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b08] text-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
        <p className="mt-4 text-sm text-white/70">Completing Microsoft authentication...</p>
      </div>
    </div>
  );
}
