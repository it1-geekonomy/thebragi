"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { planCatalog } from "@/config/plans";
import { ROUTES } from "@/config/routes";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";
import { formatCurrency } from "@/shared/lib/format-currency";

export function PricingTeaserSection() {
  const activePlan = useAppSelector((state) => state.session.activePlan);

  return (
    <section className="bg-black px-5 py-16 sm:px-8 lg:px-10">
      <SectionHeading eyebrow="Plans" title="Start with the plan that matches your motion">
        Pricing is shown in INR. Per user / month. Terms apply.
      </SectionHeading>
      <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
        {planCatalog.map((plan) => (
          <Card key={plan.slug} className={plan.popular ? "border-[#7dc890]/50 p-6" : "p-6"}>
            <div className="flex min-h-8 items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              {plan.popular ? <Badge>Most popular</Badge> : null}
            </div>
            <p className="mt-3 min-h-12 text-sm leading-6 text-white/58">{plan.description}</p>
            <p className="mt-5 text-3xl font-semibold text-white">
              {formatCurrency(plan.priceMonthly)}{" "}
              <span className="text-sm text-white/42">/user/month</span>
            </p>
            {activePlan === plan.slug ? (
              <Link
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-white/10 px-4 py-3 text-sm font-semibold text-white pointer-events-none cursor-default"
                href={ROUTES.dashboard}
              >
                Current plan
              </Link>
            ) : (
              <Link
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6bad72]"
                href={ROUTES.checkout(plan.slug)}
              >
                Buy now
              </Link>
            )}
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link className="text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>
          Compare every feature
        </Link>
      </div>
    </section>
  );
}
