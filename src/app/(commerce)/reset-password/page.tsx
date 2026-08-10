import { Metadata } from "next";
import dynamic from "next/dynamic";

const ResetPasswordForm = dynamic(
  () => import("@/features/auth/components/ResetPasswordForm").then((mod) => mod.ResetPasswordForm),
  {
    loading: () => <div className="min-h-[28rem] animate-pulse rounded-lg bg-white/[0.04] max-w-md mx-auto" aria-busy="true" />,
  },
);

import { AuthRedirector } from "@/features/auth/components/AuthRedirector";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password for your Bragi account.",
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      <AuthRedirector />
      <ResetPasswordForm />
    </main>
  );
}
