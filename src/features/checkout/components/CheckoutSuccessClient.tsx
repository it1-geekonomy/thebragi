"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { clearVerifiedBilling, readVerifiedBilling } from "@/features/checkout/lib/billing-session";
import { Button } from "@/shared/components/ui/Button";

export function CheckoutSuccessClient({ crmLoginUrl }: { crmLoginUrl: string }) {
  const router = useRouter();
  const [billing, setBilling] = useState(readVerifiedBilling);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const verified = readVerifiedBilling();
    if (!verified?.gstin) {
      router.replace(ROUTES.pricing);
      return;
    }
    setBilling(verified);
  }, [router]);

  const goToApp = () => {
    setRedirecting(true);
    clearVerifiedBilling();
    window.location.href = crmLoginUrl;
  };

  if (!billing) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
        <p className="mt-4 text-sm text-white/58">Confirming your billing details…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Payment complete</p>
      <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">You&apos;re all set</h1>
      <p className="mt-4 text-sm leading-7 text-white/58">
        GSTIN verified on this site before checkout. Your tax invoice will be issued to the entity below.
      </p>

      <dl className="mt-8 grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-white/48">Legal name</dt>
          <dd className="text-right font-medium text-white">{billing.legalName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/48">GSTIN</dt>
          <dd className="font-medium text-[#bce8c5]">{billing.gstin}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/48">Place of supply</dt>
          <dd className="text-right text-white/84">{billing.stateName}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" disabled={redirecting} onClick={goToApp}>
          {redirecting ? "Opening app…" : "Continue to Bragi app"}
        </Button>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/8"
          href={ROUTES.pricing}
        >
          Back to plans
        </Link>
      </div>
    </main>
  );
}
