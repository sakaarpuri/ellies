import { NextResponse } from "next/server";
import directory from "@/data/india-postal-localities.json";

const postalDirectory: Record<string, string[][]> = directory;

export function GET(request: Request) {
  const pin = new URL(request.url).searchParams.get("pin") ?? "";
  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    return NextResponse.json({ error: "Enter a six-digit PIN code." }, { status: 400 });
  }

  const areas = (postalDirectory[pin] ?? [])
    .flatMap(([city, state, ...localities]) => localities.map((locality) => ({ locality, city, state })))
    .sort((first, second) => first.locality.localeCompare(second.locality, "en-IN"));

  return NextResponse.json(areas, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
