export type BillingCycle = "monthly" | "annual";
export type PurchaseMode = "trial" | "buy_now";

export type CheckoutParams = {
  plan: string;
  users: number;
  cycle: BillingCycle;
  mode: PurchaseMode;
};

export const DEFAULT_PURCHASE_MODE: PurchaseMode = "buy_now";

export function parseSeatCount(raw?: string | null) {
  const users = Number(raw);
  return Number.isFinite(users) && users > 0 ? Math.floor(users) : 0;
}

export function parseCheckoutParams(input: {
  plan?: string | null;
  users?: string | null;
  cycle?: string | null;
  mode?: string | null;
}): CheckoutParams {
  return {
    plan: (input.plan || "").trim(),
    users: parseSeatCount(input.users),
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
  if (params.users && params.users > 0) query.set("users", String(params.users));
  return `/checkout?${query.toString()}`;
}

export function buildSignInForCheckout(params: CheckoutParams, mode?: "signup") {
  const returnTo = buildCheckoutPath(params);
  const query = new URLSearchParams({ returnTo, purchaseMode: params.mode });
  if (mode === "signup") query.set("mode", "signup");
  query.set("plan", params.plan);
  return `/sign-in?${query.toString()}`;
}
