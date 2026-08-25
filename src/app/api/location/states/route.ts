import { NextResponse } from "next/server";
import { State } from "country-state-city";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("country");
    
    if (!countryCode) {
      return NextResponse.json({ error: "Missing country code" }, { status: 400 });
    }
    
    const states = State.getStatesOfCountry(countryCode).map((s) => ({
      code: s.isoCode,
      name: s.name,
    }));
    return NextResponse.json(states);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load states" }, { status: 500 });
  }
}
