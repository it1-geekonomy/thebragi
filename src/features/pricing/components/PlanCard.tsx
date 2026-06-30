"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { ROUTES } from "@/config/routes";
import { formatCurrency } from "@/shared/lib/format-currency";
import { cn } from "@/shared/lib/cn";
import type { Plan } from "@/features/pricing/hooks/usePlans";

export function PlanCard({ plan, highlighted, billingCycle }: { plan: Plan; highlighted?: boolean; billingCycle: "monthly" | "annual" }) {
  const activePlan = useAppSelector((state) => state.session.activePlan);
  const isCurrentPlan = activePlan === plan.slug;
  const annualPrice = Math.round(plan.priceMonthly * 12 * 0.84);
  const displayPrice = billingCycle === "annual" ? annualPrice : plan.priceMonthly;
  const suffix = billingCycle === "annual" ? "/ year" : "/ month";

  return (
    <Card
      id={plan.slug}
      className={cn(
        "scroll-mt-28 p-6 transition duration-200",
        highlighted && "border-[#7dc890]/60 shadow-[0_0_0_1px_rgba(125,200,144,0.22),0_24px_80px_rgba(95,153,101,0.14)]",
      )}
    >
      <div className="flex min-h-8 items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
        {plan.popular ? <Badge>Most popular</Badge> : null}
      </div>
      <p className="mt-3 min-h-12 text-sm leading-6 text-white/58">{plan.description}</p>
      <div className="mt-6 flex items-end gap-2">
        <span className="text-4xl font-semibold text-white">{formatCurrency(displayPrice)}</span>
        <span className="pb-1 text-sm text-white/46">{suffix}</span>
      </div>
      {billingCycle === "annual" ? <p className="mt-2 text-xs font-semibold text-[#a8dfb3]">Includes preview annual savings.</p> : null}
      <ul className="mt-6 grid gap-3 text-sm text-white/68">
        {plan.modules.map((module) => <li key={module} className="flex gap-2"><span className="text-[#7dc890]">+</span>{module}</li>)}
      </ul>
      {isCurrentPlan ? (
        <Link className="mt-7 inline-flex w-full items-center justify-center rounded-md bg-white/10 px-4 py-3 text-sm font-semibold text-white cursor-default pointer-events-none" href={ROUTES.dashboard}>Current plan</Link>
      ) : (
        <Link className="mt-7 inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6bad72]" href={ROUTES.checkout(plan.slug)}>Buy now</Link>
      )}
      <Link className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-white/12 px-4 py-3 text-sm font-semibold text-white/72 hover:bg-white/8 hover:text-white" href={`${ROUTES.pricing}?plan=${plan.slug}`}>Focus this plan</Link>
    </Card>
  );
}
