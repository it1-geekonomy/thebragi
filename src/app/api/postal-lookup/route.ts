import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Valid 6-digit pincode required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(code)}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return NextResponse.json({ error: "lookup failed" }, { status: 502 });

    const data = await res.json();
    const row = Array.isArray(data) ? data[0] : data;
    const po = row?.PostOffice?.[0];
    if (row?.Status !== "Success" || !po) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({
      countryName: "India",
      stateName: String(po.State || ""),
      city: String(po.District || po.Name || ""),
    });
  } catch {
    return NextResponse.json({ error: "lookup failed" }, { status: 502 });
  }
}
