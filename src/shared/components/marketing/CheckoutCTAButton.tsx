"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { useAppSelector } from "@/store/hooks";
import { ROUTES } from "@/config/routes";

export function CheckoutCTAButton({ checkoutPlan, className }: { checkoutPlan: string; className?: string }) {
  const activePlan = useAppSelector((state) => state.session.activePlan);
  const isCurrentPlan = activePlan === checkoutPlan;

  if (isCurrentPlan) {
    return (
      <span
        className={cn(
          "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition bg-white/10 text-white cursor-default pointer-events-none",
          className,
        )}
      >
        Current plan
      </span>
    );
  }

  return (
    <Link
      href={ROUTES.checkout(checkoutPlan)}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dc890] bg-[#5f9965] text-white hover:bg-[#6bad72]",
        className,
      )}
    >
      Buy now
    </Link>
  );
}
