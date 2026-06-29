import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { planCatalog } from "@/config/plans";
import { ROUTES } from "@/config/routes";
import { formatCurrency } from "@/shared/lib/format-currency";

export function PlanSummaryPanel({ planSlug }: { planSlug?: string }) {
  const plan = planCatalog.find((item) => item.slug === planSlug) ?? planCatalog[2];

  return (
    <Card className="sticky top-24 p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Selected plan</p>
        {plan.popular ? <Badge>Best value</Badge> : null}
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-white">{plan.name}</h2>
      <p className="mt-3 text-sm leading-6 text-white/58">{plan.description}</p>
      <p className="mt-6 text-3xl font-semibold text-white">{formatCurrency(plan.priceMonthly)} <span className="text-sm text-white/42">/ month</span></p>
      <ul className="mt-6 grid gap-3 text-sm text-white/66">
        {plan.modules.map((module) => <li key={module} className="flex gap-2"><span className="text-[#7dc890]">+</span>{module}</li>)}
      </ul>
      <div className="mt-6 rounded-md border border-white/10 bg-black/35 p-4 text-xs leading-5 text-white/46">
        Frontend-only checkout preview. Payment, OTP, and provisioning states are mocked until APIs are connected.
      </div>
      <Link className="mt-5 inline-flex text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>Change plan</Link>
    </Card>
  );
}
