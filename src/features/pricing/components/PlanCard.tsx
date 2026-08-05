"use client";

import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { formatCurrency } from "@/shared/lib/format-currency";
import { cn } from "@/shared/lib/cn";
import type { Plan } from "@/config/plans";

export function PlanCard({
  plan,
  highlighted,
  selected,
  billingCycle,
  onSelect,
}: {
  plan: Plan;
  highlighted?: boolean;
  selected?: boolean;
  billingCycle: "monthly" | "annual";
  onSelect?: () => void;
}) {
  const displayPrice =
    billingCycle === "annual" ? Math.round(plan.priceMonthly * 0.8) : plan.priceMonthly;

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
        "scroll-mt-28 cursor-pointer p-6 transition duration-200",
        (highlighted || selected) && "border-[#7dc890]/60 shadow-[0_0_0_1px_rgba(125,200,144,0.22),0_24px_80px_rgba(95,153,101,0.14)]",
      )}
    >
      <div className="flex min-h-8 items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
        {plan.popular ? <Badge>{plan.badge ?? "Most popular"}</Badge> : null}
      </div>
      <p className="mt-3 min-h-12 text-sm leading-6 text-white/58">{plan.description}</p>
      <div className="mt-6 flex items-end gap-2">
        <span className="text-4xl font-semibold text-white">{formatCurrency(displayPrice)}</span>
        <span className="pb-1 text-sm text-white/46">/user/month</span>
      </div>
      {billingCycle === "annual" ? (
        <p className="mt-2 text-xs font-semibold text-[#a8dfb3]">Billed annually — save 20%.</p>
      ) : null}
      <ul className="mt-6 grid gap-3 text-sm">
        {plan.features.map((feature) => (
          <li
            key={feature.label}
            className={cn("flex gap-2", feature.included ? "text-white/68" : "text-white/28")}
          >
            <span className={feature.included ? "text-[#7dc890]" : "text-white/20"}>
              {feature.included ? "✓" : "–"}
            </span>
            {feature.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
