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

export type SignupDraft = {
  fullName: string;
  email: string;
  company: string;
  industry: string;
  password: string;
  resume?: boolean;
};

const SIGNUP_KEY = "bragi_signup_draft";

export function saveSignupDraft(draft: SignupDraft) {
  localStorage.setItem(SIGNUP_KEY, JSON.stringify(draft));
}

export function readSignupDraft(): SignupDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SIGNUP_KEY) ?? sessionStorage.getItem(SIGNUP_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as SignupDraft;
    if (!draft.email || !draft.password) return null;
    if (!draft.resume && (!draft.company || !draft.fullName)) return null;
    return draft;
  } catch {
    return null;
  }
}

export function clearSignupDraft() {
  localStorage.removeItem(SIGNUP_KEY);
  sessionStorage.removeItem(SIGNUP_KEY);
}
