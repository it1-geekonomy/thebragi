import { fetchGstinValidation } from "@/features/checkout/api/gst-validation";
export type GstinLookup = {
  gstin: string;
  valid: boolean;
  legalName: string;
  pan: string;
  message: string;
  address?: string;
};

export function emptyGstLookup(gstin: string, message: string): GstinLookup {
  return { gstin, valid: false, legalName: "", pan: "", message };
}

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function isValidGstinFormat(gstin: string) {
  return GSTIN_RE.test(gstin.toUpperCase());
}

export function stateCodeFromName(stateName: string, statesList: { code: string; name: string }[] = []) {
  if (!stateName.trim()) return "";
  const lower = stateName.trim().toLowerCase();
  return statesList.find((s) => s.name.toLowerCase() === lower)?.code ?? "";
}

/** First 6-digit sequence in free text (Indian pincode). */
export function pincodeFromText(text: string) {
  return text.match(/\b(\d{6})\b/)?.[1] ?? "";
}

export type ResolvedLocation = {
  postalCode: string;
  stateName: string;
  stateCode: string;
  country: string;
  city?: string;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const GSTIN_CACHE_TTL_MS = 5 * 60 * 1000; // Cache per-session lookups; pay flow force-revalidates.
const LOCATION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const isBrowser = typeof window !== "undefined";
const gstinCache = new Map<string, CacheEntry<GstinLookup | null>>();
const locationCache = new Map<string, CacheEntry<ResolvedLocation>>();

function getValidCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

/** Resolve place-of-supply fields from the billing address the user typed. */
export async function resolveLocationFromAddress(
  address: string,
  opts?: { force?: boolean },
): Promise<ResolvedLocation> {
  const postalCode = pincodeFromText(address);
  if (!postalCode) {
    return { postalCode: "", stateName: "", stateCode: "", country: "" };
  }

  if (isBrowser && !opts?.force) {
    const cached = getValidCached(locationCache, postalCode);
    if (cached) return cached;
  }

  try {
    const res = await fetch(`/api/postal-lookup?code=${encodeURIComponent(postalCode)}`);
    if (!res.ok) return { postalCode, stateName: "", stateCode: "", country: "" };
    const data = (await res.json()) as { stateName?: string; countryName?: string; city?: string };
    const stateName = data.stateName?.trim() ?? "";
    const result = {
      postalCode,
      stateName,
      stateCode: stateCodeFromName(stateName),
      country: data.countryName?.trim() ?? "",
      city: data.city?.trim() ?? "",
    };
    if (isBrowser) {
      locationCache.set(postalCode, { value: result, expiresAt: Date.now() + LOCATION_CACHE_TTL_MS });
    }
    return result;
  } catch {
    return { postalCode, stateName: "", stateCode: "", country: "" };
  }
}

/** Live GSTN lookup — legal name + PAN from API only. */
export async function lookupGstin(raw: string, opts?: { force?: boolean }): Promise<GstinLookup | null> {
  const gstin = raw.trim().toUpperCase();
  if (gstin.length < 15) return null;
  if (!isValidGstinFormat(gstin)) return emptyGstLookup(gstin, "Invalid GSTIN format.");

  if (isBrowser && !opts?.force) {
    const cached = getValidCached(gstinCache, gstin);
    if (cached) return cached;
  }

  const result = await fetchGstinValidation(gstin);
  if (isBrowser) {
    gstinCache.set(gstin, { value: result, expiresAt: Date.now() + GSTIN_CACHE_TTL_MS });
  }
  return result;
}

export function renewalDateLabel(cycle: "monthly" | "annual") {
  const date = new Date();
  if (cycle === "annual") date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

