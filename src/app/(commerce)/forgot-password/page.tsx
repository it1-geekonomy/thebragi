import { Metadata } from "next";
import dynamic from "next/dynamic";

const ForgotPasswordForm = dynamic(
  () => import("@/features/auth/components/ForgotPasswordForm").then((mod) => mod.ForgotPasswordForm),
  {
    loading: () => <div className="min-h-[28rem] animate-pulse rounded-lg bg-white/[0.04] max-w-md mx-auto" aria-busy="true" />,
  },
);

import { AuthRedirector } from "@/features/auth/components/AuthRedirector";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Bragi password.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      <AuthRedirector />
      <ForgotPasswordForm />
    </main>
  );
}
