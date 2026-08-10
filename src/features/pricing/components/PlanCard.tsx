"use client";

import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { formatCurrency } from "@/shared/lib/format-currency";
import { cn } from "@/shared/lib/cn";
import type { DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";

export function PlanCard({
  plan,
  highlighted,
  selected,
  billingCycle,
  onSelect,
}: {
  plan: DynamicPlan;
  highlighted?: boolean;
  selected?: boolean;
  billingCycle: "monthly" | "annual";
  onSelect?: () => void;
}) {
  const isAnnual = billingCycle === "annual";
  const displayPrice = isAnnual && plan.priceAnnual
    ? Math.round(plan.priceAnnual / 12)
    : plan.priceMonthly;

  const perUserPrice = isAnnual && plan.perUserCostAnnual
    ? Math.round(plan.perUserCostAnnual / 12)
    : plan.perUserCostMonthly || displayPrice;

  const maxUsers = plan.maxUsers ?? 1;
  const discount = plan.annualDiscountPercentage || 20;

  return (
    <Card
      id={plan.slug}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
      className={cn(
        "scroll-mt-28 cursor-pointer p-6 transition duration-200 border-2",
        (highlighted || selected) 
          ? "border-[#7dc890] bg-[#7dc890]/[0.03] shadow-[0_0_0_1px_#7dc890,0_24px_80px_rgba(125,200,144,0.15)]"
          : "border-transparent",
      )}
    >
      <div className="flex min-h-8 items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
        {(highlighted || selected) ? (
          <Badge className="bg-[#7dc890] text-black border-[#7dc890]">Selected</Badge>
        ) : plan.popular ? (
          <Badge>{plan.badge ?? "Most popular"}</Badge>
        ) : null}
      </div>
      <p className="mt-3 min-h-12 text-sm leading-6 text-white/58">
        Includes up to {maxUsers} users.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-semibold text-white">{formatCurrency(displayPrice)}</span>
          <span className="pb-1 text-sm text-white/46">/month</span>
        </div>
        {plan.setupFee > 0 ? (
          <span className="inline-flex w-fit items-center rounded-md bg-[#7dc890]/10 px-2.5 py-1 text-xs font-medium text-[#7dc890]">
            + {formatCurrency(plan.setupFee)} one-time setup fee
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-white/46">
        + {formatCurrency(perUserPrice)}/mo for each additional user
      </p>
      {isAnnual && discount > 0 ? (
        <p className="mt-2 text-xs font-semibold text-[#a8dfb3]">Billed annually — save {discount}%.</p>
      ) : null}
    </Card>
  );
}
