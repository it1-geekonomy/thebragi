import Link from "next/link";
import { planCatalog } from "@/config/plans";
import { ROUTES } from "@/config/routes";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";
import { formatCurrency } from "@/shared/lib/format-currency";

export function PricingTeaserSection() {
  return (
    <section className="bg-black px-5 py-16 sm:px-8 lg:px-10">
      <SectionHeading eyebrow="Plans" title="Start with the plan that matches your motion">
        Preview pricing is shown in INR. Final pricing will come from the plans API when commerce is connected.
      </SectionHeading>
      <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
        {planCatalog.map((plan) => (
          <Card key={plan.slug} className={plan.popular ? "border-[#7dc890]/50 p-6" : "p-6"}>
            <div className="flex min-h-8 items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              {plan.popular ? <Badge>Most popular</Badge> : null}
            </div>
            <p className="mt-3 min-h-12 text-sm leading-6 text-white/58">{plan.description}</p>
            <p className="mt-5 text-3xl font-semibold text-white">{formatCurrency(plan.priceMonthly)} <span className="text-sm text-white/42">/ month</span></p>
            <Link className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6bad72]" href={ROUTES.checkout(plan.slug)}>Buy now</Link>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center"><Link className="text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>Compare every feature</Link></div>
    </section>
  );
}
