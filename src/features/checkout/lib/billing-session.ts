import type { BillingCycle } from "@/features/checkout/lib/checkout-params";

export type VerifiedBilling = {
  gstin: string;
  legalName: string;
  pan: string;
  stateCode: string;
  stateName: string;
  address: string;
  postalCode: string;
  country: string;
  plan: string;
  seats: number;
  cycle: BillingCycle;
  verifiedAt: number;
};

const KEY = "bragi_checkout_billing_verified";

export function saveVerifiedBilling(billing: VerifiedBilling) {
  sessionStorage.setItem(KEY, JSON.stringify(billing));
}

export function readVerifiedBilling(): VerifiedBilling | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VerifiedBilling;
  } catch {
    return null;
  }
}

export function clearVerifiedBilling() {
  sessionStorage.removeItem(KEY);
}
