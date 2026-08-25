"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { ROUTES } from "@/config/routes";
import { Card } from "@/shared/components/ui/Card";
import { Toggle } from "@/shared/components/ui/Toggle";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";
import { formatCurrency } from "@/shared/lib/format-currency";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";

export function PricingTeaserSection() {
  const { activePlan, isAuthenticated } = useAppSelector((state) => state.session);
  const { plans, loading } = useSubscriptionPlans();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  if (loading) {
    return (
      <section className="bg-black px-5 py-16 sm:px-8 lg:px-10 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="bg-black px-5 py-16 sm:px-8 lg:px-10">
      <SectionHeading eyebrow="Plans" title="Start with the plan that matches your motion">
        Pricing is shown in INR. Per user / month. Terms apply.
      </SectionHeading>
      
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full border border-white/12 bg-white/[0.04] p-1">
          <Toggle
            pressed={billingCycle === "monthly"}
            onClick={() => setBillingCycle("monthly")}
            className="border-transparent"
          >
            Monthly
          </Toggle>
          <Toggle
            pressed={billingCycle === "annual"}
            onClick={() => setBillingCycle("annual")}
            className="border-transparent"
          >
            Annual{plans[0]?.annualDiscountPercentage ? ` — save ${plans[0].annualDiscountPercentage}%` : ""}
          </Toggle>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const isAnnual = billingCycle === "annual";
          const price = isAnnual && plan.priceAnnual ? plan.priceAnnual : plan.priceMonthly;
          const perUserCost = isAnnual && plan.perUserCostAnnual ? plan.perUserCostAnnual : plan.perUserCostMonthly || price;
          const discount = plan.annualDiscountPercentage;

          return (
            <Card key={plan.slug} className="p-6">
              <div className="flex min-h-8 items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-white/58">
                {plan.isEnterprise ? null : `Includes up to ${plan.maxUsers || "unlimited"} users.`}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {plan.isEnterprise ? (
                  <p className="text-3xl font-semibold text-white">Custom</p>
                ) : (
                  <p className="text-3xl font-semibold text-white">
                    {formatCurrency(price)}{" "}
                    <span className="text-sm text-white/42">{isAnnual ? "/year" : "/month"}</span>
                  </p>
                )}
                {plan.setupFee > 0 ? (
                  <span className="inline-flex w-fit items-center rounded-md bg-[#7dc890]/10 px-2.5 py-1 text-xs font-medium text-[#7dc890]">
                    + {formatCurrency(plan.setupFee)} one-time setup fee
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-white/46">
                {plan.isEnterprise ? "Tailored to your specific needs" : `+ ${formatCurrency(perUserCost)}${isAnnual ? "/yr" : "/mo"} for each additional user`}
              </p>
              {isAnnual && discount > 0 ? (
                <p className="mt-2 text-xs font-semibold text-[#a8dfb3]">Billed annually — save {discount}%.</p>
              ) : null}
              {activePlan === plan.slug ? (
                <Link
                  className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-white/10 px-4 py-3 text-sm font-semibold text-white pointer-events-none cursor-default"
                  href={ROUTES.dashboard}
                >
                  Current plan
                </Link>
              ) : plan.isEnterprise ? (
                <div className="mt-6 grid gap-2">
                  <Link
                    className="inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6bad72]"
                    href={ROUTES.enterprise}
                  >
                    Contact us
                  </Link>
                </div>
              ) : (
                <div className="mt-6 grid gap-2">
                  <Link
                    className="inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6bad72]"
                    href={
                      isAuthenticated
                        ? ROUTES.checkout(plan.slug, { cycle: billingCycle, mode: "trial" })
                        : ROUTES.signUp(plan.slug, { cycle: billingCycle })
                    }
                  >
                    Start 14-day free trial (limit 5 users)
                  </Link>
                  <Link
                    className="inline-flex w-full items-center justify-center rounded-md border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/8"
                    href={
                      isAuthenticated
                        ? ROUTES.checkout(plan.slug, { cycle: billingCycle, mode: "buy_now" })
                        : ROUTES.signUp(plan.slug, { cycle: billingCycle, mode: "buy_now" })
                    }
                  >
                    Buy now
                  </Link>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Link className="text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>
          See all plans
        </Link>
      </div>
    </section>
  );
}
