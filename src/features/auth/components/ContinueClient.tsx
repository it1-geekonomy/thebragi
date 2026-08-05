"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/components/ui/Button";
import { useAppSelector } from "@/store/hooks";

export function ContinueClient() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.session.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.signIn);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Bragi App</p>
      <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">Your workspace is ready</h1>
      <p className="mt-4 text-sm leading-7 text-white/58">Continue when you&apos;re ready to open the app.</p>
      <Button className="mt-8 w-full sm:w-auto" onClick={() => router.push(ROUTES.dashboard)}>
        Continue to Bragi App
      </Button>
    </main>
  );
}
