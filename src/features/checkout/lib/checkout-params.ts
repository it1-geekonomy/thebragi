export type BillingCycle = "monthly" | "annual";

export type CheckoutParams = {
  plan: string;
  seats: number;
  cycle: BillingCycle;
};

export const MIN_SEATS = 3;
export const DEFAULT_SEATS = 3;

export function parseCheckoutParams(input: {
  plan?: string | null;
  seats?: string | null;
  cycle?: string | null;
}): CheckoutParams {
  const seatsRaw = Number(input.seats);
  const seats = Number.isFinite(seatsRaw) && seatsRaw >= MIN_SEATS ? Math.floor(seatsRaw) : DEFAULT_SEATS;
  const cycle: BillingCycle = input.cycle === "monthly" ? "monthly" : "annual";
  return {
    plan: input.plan || "bragi-full",
    seats,
    cycle,
  };
}

export function buildCheckoutPath(params: Partial<CheckoutParams> & { plan: string }) {
  const seats = params.seats ?? DEFAULT_SEATS;
  const cycle = params.cycle ?? "annual";
  const query = new URLSearchParams({
    plan: params.plan,
    seats: String(seats),
    cycle,
  });
  return `/checkout?${query.toString()}`;
}

export function buildSignInForCheckout(params: CheckoutParams, mode?: "signup") {
  const returnTo = buildCheckoutPath(params);
  const query = new URLSearchParams({ returnTo });
  if (mode === "signup") query.set("mode", "signup");
  query.set("plan", params.plan);
  return `/sign-in?${query.toString()}`;
}
