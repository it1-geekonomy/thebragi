export type PricingModel = "included_overage" | "per_seat";
export type BillingCycle = "monthly" | "annual";

export type PricedPlan = {
  pricingModel: PricingModel;
  includedUsers: number;
  maxUsers: number;
  priceMonthly: number;
  priceAnnual: number;
  perUserCostMonthly: number;
  perUserCostAnnual: number;
  setupFee: number;
};

export const TRIAL_AUTHORIZATION_RUPEES = 1;
export const TRIAL_AUTHORIZATION_PAISE = 100;

export function additionalSeats(seatCount: number, baseUsers: number) {
  return Math.max(0, seatCount - baseUsers);
}

export function clampSeats(seatCount: number, minimumSeats: number, maximumSeats?: number) {
  const next = Math.max(minimumSeats, Math.floor(Number.isFinite(seatCount) ? seatCount : minimumSeats));
  return maximumSeats && maximumSeats > 0 ? Math.min(maximumSeats, next) : next;
}

export function computeOrderTotals(
  plan: PricedPlan,
  users: number,
  cycle: BillingCycle,
) {
  const basePrice = cycle === "annual" ? plan.priceAnnual : plan.priceMonthly;
  const perUserPrice = cycle === "annual" ? plan.perUserCostAnnual : plan.perUserCostMonthly;
  const includedUsers = plan.includedUsers > 0 ? plan.includedUsers : plan.maxUsers;
  const overageSeats = includedUsers > 0 ? additionalSeats(users, includedUsers) : 0;
  const recurringSubtotal =
    plan.pricingModel === "included_overage" && includedUsers > 0
      ? basePrice + overageSeats * perUserPrice
      : perUserPrice * users;
  const setupFee = plan.setupFee || 0;
  const subtotal = recurringSubtotal + setupFee;
  return {
    perUser: perUserPrice,
    subtotal,
    recurringSubtotal,
    setupFee,
    total: subtotal,
    basePrice,
    overageSeats,
  };
}
