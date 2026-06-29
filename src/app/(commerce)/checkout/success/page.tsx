import { Metadata } from "next";
import Link from "next/link";
import { SetPasswordForm } from "@/features/auth/components/SetPasswordForm";
import { ROUTES } from "@/config/routes";
import { Spinner } from "@/shared/components/ui/Spinner";
import { StepIndicator } from "@/shared/components/ui/StepIndicator";

export const metadata: Metadata = { title: "Checkout Success" };

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Success</p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">Payment received. Workspace setup is next.</h1>
        <p className="mt-5 text-base leading-8 text-white/58">The production version will poll provisioning status here, then move the user into onboarding.</p>
        <div className="mt-8"><StepIndicator steps={["Paid", "Provisioning", "Password", "Onboarding"]} active={1} /></div>
      </section>
      <section className="grid gap-6">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-3"><Spinner /><p className="font-semibold text-white">Setting up your workspace...</p></div>
          <p className="mt-4 text-sm leading-6 text-white/58">Provisioning polling will connect to GET /v1/checkout/status/:id when the checkout API is ready.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-semibold text-white">Create your password</h2>
          <p className="mt-3 text-sm text-white/58">This appears after provisioning for new users.</p>
          <div className="mt-6"><SetPasswordForm /></div>
          <Link className="mt-5 inline-flex text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.onboarding}>Preview onboarding</Link>
        </div>
      </section>
    </main>
  );
}
