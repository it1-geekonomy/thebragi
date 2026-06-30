import { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Bragi account.",
};

export default function SignInPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Bragi ID</p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">Sign in and get back to the work in motion.</h1>
        <p className="mt-5 text-base leading-8 text-white/58">Sign in to access your workspace and projects.</p>
      </section>
      <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6">
        <h2 className="text-2xl font-semibold text-white">Sign in to Bragi</h2>
        <p className="mt-2 text-sm text-white/58">Use your Bragi account to open the app.</p>
        <div className="mt-6"><SignInForm /></div>
        <p className="mt-5 text-sm text-white/52">No account yet? <Link className="text-[#a8dfb3]" href={ROUTES.pricing}>Choose a plan</Link>.</p>
        <p className="mt-3 text-sm text-white/38">Forgot password flow is planned for the next auth pass.</p>
      </section>
    </main>
  );
}
