import type { Plan } from "@/config/plans";
import type { BillingCycle } from "@/features/checkout/lib/checkout-params";
import { computeTax, type TaxBreakdown } from "@/features/checkout/lib/gst";

export function unitPrice(plan: Plan, cycle: BillingCycle) {
  return cycle === "annual" ? Math.round(plan.priceMonthly * 0.8) : plan.priceMonthly;
}

export function computeOrderTotals(plan: Plan, seats: number, cycle: BillingCycle, placeOfSupplyCode: string) {
  const perUser = unitPrice(plan, cycle);
  const subtotal = perUser * seats;
  const tax: TaxBreakdown = computeTax(subtotal, placeOfSupplyCode);
  const total = subtotal + tax.totalTax;
  return { perUser, subtotal, tax, total };
}
