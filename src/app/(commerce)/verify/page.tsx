import { Metadata } from "next";
import Link from "next/link";
import { OtpVerifyForm } from "@/features/auth/components/OtpVerifyForm";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Verify",
  description: "Verify your Bragi sign-in code.",
};

export default function VerifyPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Verification</p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">Confirm the code and continue.</h1>
        <p className="mt-5 text-base leading-8 text-white/58">This screen supports checkout verification and OTP sign-in paths. It is frontend-only until auth APIs are connected.</p>
      </section>
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-2xl font-semibold text-white">Verify your email</h2>
        <p className="mt-2 text-sm text-white/58">Enter the 6 digit code sent to your inbox.</p>
        <div className="mt-6"><OtpVerifyForm /></div>
        <Link className="mt-5 inline-flex text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.signIn}>Back to sign in</Link>
      </section>
    </main>
  );
}
