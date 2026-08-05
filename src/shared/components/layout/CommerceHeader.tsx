"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ROUTES } from "@/config/routes";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";

function CommerceHeaderLinks() {
  const plan = useSearchParams().get("plan");
  return (
    <Link className="text-sm font-semibold text-white/64 hover:text-white" href={ROUTES.pricing}>
      {plan ? "Change plan" : "See plans"}
    </Link>
  );
}

export function CommerceHeader() {
  return (
    <header className="border-b border-white/10 bg-black px-5 py-5 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href={ROUTES.home}>
          <BragiLogo />
        </Link>
        <Suspense fallback={<Link className="text-sm font-semibold text-white/64 hover:text-white" href={ROUTES.pricing}>See plans</Link>}>
          <CommerceHeaderLinks />
        </Suspense>
      </div>
    </header>
  );
}
