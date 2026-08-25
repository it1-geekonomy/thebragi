import { NextResponse } from "next/server";
import { Country } from "country-state-city";

export async function GET() {
  try {
    const countries = Country.getAllCountries().map((c) => ({
      code: c.isoCode,
      name: c.name,
    }));
    return NextResponse.json(countries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load countries" }, { status: 500 });
  }
}
