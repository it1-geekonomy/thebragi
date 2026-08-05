import { emptyGstLookup, type GstinLookup } from "@/features/checkout/lib/gst";
import { pickString } from "@/features/checkout/lib/pick-string";

type GstValidateApiResponse = Partial<GstinLookup> & {
  tradeName?: string;
  lgnm?: string;
  tradeNam?: string;
  error?: string;
};

/** Calls `/api/gst/validate` — legal name and PAN from GSTN API. */
export async function fetchGstinValidation(gstin: string): Promise<GstinLookup> {
  const res = await fetch(`/api/gst/validate?gstin=${encodeURIComponent(gstin)}`);
  const data = (await res.json()) as GstValidateApiResponse;

  if (!res.ok) {
    return emptyGstLookup(gstin, pickString(data.message, data.error) || "GSTIN could not be verified.");
  }

  return {
    gstin: data.gstin || gstin,
    valid: Boolean(data.valid),
    legalName: pickString(data.legalName, data.lgnm, data.tradeName, data.tradeNam),
    pan: pickString(data.pan),
    message: pickString(data.message) || (data.valid ? "Verified against GSTN" : "GSTIN not found."),
  };
}
