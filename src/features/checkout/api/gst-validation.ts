import { emptyGstLookup, type GstinLookup } from "@/features/checkout/lib/gst";
import { pickString } from "@/features/checkout/lib/pick-string";
import { apiClient } from "@/shared/lib/api-client";

type GstValidateApiResponse = Partial<GstinLookup> & {
  error?: string;
};

/** Calls `/gst/validate` on the CRM backend */
export async function fetchGstinValidation(gstin: string): Promise<GstinLookup> {
  try {
    const data = await apiClient<GstValidateApiResponse>(`/gst/validate?gstin=${encodeURIComponent(gstin)}`);
    
    return {
      gstin: data.gstin || gstin,
      valid: Boolean(data.valid),
      legalName: pickString(data.legalName),
      pan: pickString(data.pan),
      address: pickString(data.address),
      message: pickString(data.message) || (data.valid ? "Verified against GSTN" : "GSTIN not found."),
    };
  } catch (error: unknown) {
    const message = error && typeof error === "object" && "message" in error ? String((error as { message: string }).message) : "";
    return emptyGstLookup(gstin, pickString(message) || "GSTIN could not be verified.");
  }
}
