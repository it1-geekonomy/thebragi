"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/Button";
import { beginOAuthRedirect, type OAuthProvider } from "@/features/auth/lib/oauth";

export function SocialLoginButtons({
  returnTo,
  mode,
}: {
  returnTo: string;
  mode: "signin" | "signup";
}) {
  const [busy, setBusy] = useState<OAuthProvider | null>(null);

  function start(provider: OAuthProvider) {
    try {
      setBusy(provider);
      beginOAuthRedirect(provider, { mode, returnTo });
    } catch (err) {
      setBusy(null);
      toast.error(err instanceof Error ? err.message : "Could not start social sign-in.");
    }
  }

  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={busy !== null}
        onClick={() => start("google")}
      >
        {busy === "google" ? "Redirecting..." : "Continue with Google"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={busy !== null}
        onClick={() => start("microsoft")}
      >
        {busy === "microsoft" ? "Redirecting..." : "Continue with Microsoft"}
      </Button>
    </div>
  );
}
