export type BillingCycle = "monthly" | "annual";
export type PurchaseMode = "trial" | "buy_now";

export type CheckoutParams = {
  plan: string;
  seats: number;
  cycle: BillingCycle;
  mode: PurchaseMode;
};

export const DEFAULT_PURCHASE_MODE: PurchaseMode = "buy_now";

export function parseSeatCount(raw?: string | null) {
  const seats = Number(raw);
  return Number.isFinite(seats) && seats > 0 ? Math.floor(seats) : 0;
}

export function parseCheckoutParams(input: {
  plan?: string | null;
  seats?: string | null;
  cycle?: string | null;
  mode?: string | null;
}): CheckoutParams {
  return {
    plan: (input.plan || "").trim(),
    seats: parseSeatCount(input.seats),
    cycle: input.cycle === "monthly" ? "monthly" : "annual",
    mode: input.mode === "trial" ? "trial" : "buy_now",
  };
}

export function buildCheckoutPath(params: Partial<CheckoutParams> & { plan: string }) {
  const cycle = params.cycle ?? "annual";
  const mode = params.mode ?? DEFAULT_PURCHASE_MODE;
  const query = new URLSearchParams({
    plan: params.plan,
    cycle,
    mode,
  });
  if (params.seats && params.seats > 0) query.set("seats", String(params.seats));
  return `/checkout?${query.toString()}`;
}

export function buildSignInForCheckout(params: CheckoutParams, mode?: "signup") {
  const returnTo = buildCheckoutPath(params);
  const query = new URLSearchParams({ returnTo, purchaseMode: params.mode });
  if (mode === "signup") query.set("mode", "signup");
  query.set("plan", params.plan);
  return `/sign-in?${query.toString()}`;
}
