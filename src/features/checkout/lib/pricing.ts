import type { DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";
import type { BillingCycle } from "@/features/checkout/lib/checkout-params";
import { computeTax, type TaxBreakdown } from "@/features/checkout/lib/gst";

export function getBasePrice(plan: DynamicPlan, cycle: BillingCycle) {
  return cycle === "annual" ? plan.priceAnnual : plan.priceMonthly;
}

export function getPerUserPrice(plan: DynamicPlan, cycle: BillingCycle) {
  return cycle === "annual" ? plan.perUserCostAnnual : plan.perUserCostMonthly;
}

export function computeOrderTotals(plan: DynamicPlan, seats: number, cycle: BillingCycle, placeOfSupplyCode: string) {
  const basePrice = getBasePrice(plan, cycle);
  const perUserPrice = getPerUserPrice(plan, cycle);
  
  // Base package covers up to maxUsers. Any extra seats are charged the perUserPrice.
  const overageSeats = plan.maxUsers > 0 ? Math.max(0, seats - plan.maxUsers) : 0;
  
  const recurringSubtotal = plan.maxUsers > 0 
    ? basePrice + (overageSeats * perUserPrice)
    : perUserPrice * seats; // Fallback if there is no maxUsers defined (purely per-seat)

  const setupFee = plan.setupFee || 0;
  const subtotal = recurringSubtotal + setupFee;

  const tax: TaxBreakdown = computeTax(subtotal, placeOfSupplyCode);
  const total = subtotal + tax.totalTax;
  
  return { perUser: perUserPrice, subtotal, recurringSubtotal, setupFee, tax, total, basePrice, overageSeats };
}
