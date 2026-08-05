import { NextRequest, NextResponse } from "next/server";
import { isValidGstinFormat } from "@/features/checkout/lib/gst";

type ValidateBody = {
  gstin?: string;
};

const KNOWN_GSTINS: Record<string, { legalName: string; tradeName?: string }> = {
  "29AAJCG1234M1Z5": {
    legalName: "Geekonomy Technology Private Limited",
    tradeName: "Geekonomy",
  },
};

function panFromGstin(gstin: string) {
  return gstin.slice(2, 12);
}

function isAuthorized(request: NextRequest) {
  const expected = process.env.GST_VALIDATION_API_KEY;
  if (!expected) return true;

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const apiKey = request.headers.get("x-api-key")?.trim();
  return bearer === expected || apiKey === expected;
}

/** Mock GST vendor — POST { gstin } → { valid, legalName, pan, ... } */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ valid: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: ValidateBody;
  try {
    body = (await request.json()) as ValidateBody;
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const gstin = body.gstin?.trim().toUpperCase() ?? "";
  if (gstin.length !== 15) {
    return NextResponse.json({ valid: false, error: "gstin required (15 characters)" }, { status: 400 });
  }

  if (!isValidGstinFormat(gstin)) {
    return NextResponse.json({ valid: false, gstin, message: "Invalid GSTIN format." });
  }

  const known = KNOWN_GSTINS[gstin];
  const pan = panFromGstin(gstin);

  return NextResponse.json({
    valid: true,
    gstin,
    legalName: known?.legalName ?? `Registered Business (${pan})`,
    tradeName: known?.tradeName,
    pan,
    status: "active",
  });
}
