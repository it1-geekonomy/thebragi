import { NextRequest, NextResponse } from "next/server";
import { Country, State } from "country-state-city";

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

    const countryName = String(po.Country || "India");
    const stateName = String(po.State || "");
    const city = String(po.District || po.Name || "");

    const resolvedCountry = Country.getAllCountries().find(
      (c) =>
        c.name.toLowerCase() === countryName.toLowerCase() ||
        c.isoCode.toLowerCase() === countryName.toLowerCase(),
    );
    const countryCode = resolvedCountry?.isoCode || "IN";

    const resolvedState = State.getStatesOfCountry(countryCode).find(
      (s) =>
        s.name.toLowerCase() === stateName.toLowerCase() ||
        s.isoCode.toLowerCase() === stateName.toLowerCase(),
    );

    return NextResponse.json({
      countryName: resolvedCountry?.name || countryName,
      countryCode: countryCode,
      stateName: resolvedState?.name || stateName,
      stateCode: resolvedState?.isoCode || "",
      city,
    });
  } catch {
    return NextResponse.json({ error: "lookup failed" }, { status: 502 });
  }
}
