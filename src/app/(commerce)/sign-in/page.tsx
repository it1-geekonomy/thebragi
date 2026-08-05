import { Metadata } from "next";
import dynamic from "next/dynamic";

const AuthForm = dynamic(
  () => import("@/features/auth/components/AuthForm").then((mod) => mod.AuthForm),
  {
    loading: () => <div className="min-h-[28rem] animate-pulse rounded-lg bg-white/[0.04]" aria-busy="true" />,
  },
);

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Bragi or create an account to start a 14-day free trial.",
};

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      <AuthForm />
    </main>
  );
}
