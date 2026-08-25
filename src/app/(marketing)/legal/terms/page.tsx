import { Metadata } from "next";
import { MarketingLayout } from "@/shared/layouts/MarketingLayout";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <MarketingLayout>
      <main className="mx-auto max-w-3xl px-5 py-16 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Legal</p>
        <h1 className="mt-4 text-[clamp(1.75rem,5vw,2.25rem)] font-semibold sm:text-4xl">Terms of Service</h1>
        <div className="mt-8 grid gap-6 text-sm leading-7 text-white/64">
          <p>These preview terms describe the intended Bragi commercial model while the frontend and backend are being implemented.</p>
          <p>Paid plans, renewals, and payment handling will be governed by the final checkout and billing terms at launch.</p>
          <p>For terms questions, contact connect@thegeekonomy.com.</p>
        </div>
      </main>
    </MarketingLayout>
  );
}
