import { NextRequest, NextResponse } from "next/server";
import { emptyGstLookup, isValidGstinFormat, type GstinLookup } from "@/features/checkout/lib/gst";
import { pickString } from "@/features/checkout/lib/pick-string";

type VendorGstResponse = {
  valid?: boolean;
  gstin?: string;
  legalName?: string;
  tradeName?: string;
  lgnm?: string;
  tradeNam?: string;
  pan?: string;
  status?: string;
  sts?: string;
  message?: string;
  error?: string;
};

function normalize(gstin: string, raw: VendorGstResponse): GstinLookup {
  const legalName = pickString(raw.legalName, raw.lgnm, raw.tradeName, raw.tradeNam);
  const pan = pickString(raw.pan);
  const status = pickString(raw.status, raw.sts).toLowerCase();
  const vendorValid = typeof raw.valid === "boolean" ? raw.valid : status ? status === "active" : true;
  const valid = vendorValid && Boolean(legalName && pan);

  return {
    gstin,
    valid,
    legalName,
    pan,
    message:
      pickString(raw.message, raw.error) ||
      (valid ? "Verified against GSTN" : "GST lookup did not return legal name and PAN."),
  };
}

export async function GET(request: NextRequest) {
  const gstin = request.nextUrl.searchParams.get("gstin")?.trim().toUpperCase() ?? "";
  if (gstin.length !== 15) {
    return NextResponse.json({ error: "gstin required (15 characters)" }, { status: 400 });
  }

  if (!isValidGstinFormat(gstin)) {
    return NextResponse.json(emptyGstLookup(gstin, "Invalid GSTIN format."));
  }

  const apiBase = process.env.GST_VALIDATION_API_URL;
  if (!apiBase) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        gstin,
        valid: true,
        legalName: "Mocked Company Pvt Ltd",
        pan: gstin.substring(2, 12),
        message: "Mock validation (Development Mode)",
      });
    }
    
    return NextResponse.json(
      emptyGstLookup(gstin, "GST validation is not configured. Set GST_VALIDATION_API_URL in .env.local."),
      { status: 503 },
    );
  }

  const apiKey = process.env.GST_VALIDATION_API_KEY;
  const path = process.env.GST_VALIDATION_API_PATH || "/gst/validate";
  const url = `${apiBase.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}`, "x-api-key": apiKey } : {}),
      },
      body: JSON.stringify({ gstin }),
      cache: "no-store",
    });

    const raw = (await res.json()) as VendorGstResponse;

    if (!res.ok) {
      return NextResponse.json(
        emptyGstLookup(gstin, pickString(raw.message, raw.error) || "GSTIN could not be verified."),
      );
    }

    return NextResponse.json(normalize(gstin, raw));
  } catch {
    return NextResponse.json(emptyGstLookup(gstin, "Could not reach GST validation service."), { status: 502 });
  }
}
