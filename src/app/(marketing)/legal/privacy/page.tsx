import { Metadata } from "next";
import { MarketingLayout } from "@/shared/layouts/MarketingLayout";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <main className="mx-auto max-w-3xl px-5 py-16 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold">Privacy Policy</h1>
        <div className="mt-8 grid gap-6 text-sm leading-7 text-white/64">
          <p>Bragi collects only the information needed to provide early access, account management, billing, and product support.</p>
          <p>Authentication and billing flows are designed around cookie-based sessions. Bragi does not require frontend JWT storage.</p>
          <p>For privacy questions, contact connect@thegeekonomy.com.</p>
        </div>
      </main>
    </MarketingLayout>
  );
}
