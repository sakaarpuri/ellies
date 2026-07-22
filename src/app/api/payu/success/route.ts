import { NextResponse } from "next/server";
import { getPayuConfig, verifyPayuResponse } from "@/lib/payu";

export const runtime = "nodejs";

async function handlePayuReturn(request: Request, pathname: string) {
  const formData = await request.formData();
  const params = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  );
  const config = getPayuConfig();
  const verified = config.salt ? verifyPayuResponse(params, config.salt) : false;
  const destination = new URL(pathname, config.siteUrl);

  destination.searchParams.set("verified", verified ? "1" : "0");

  if (params.txnid) {
    destination.searchParams.set("txnid", params.txnid);
  }

  if (params.status) {
    destination.searchParams.set("status", params.status);
  }

  return NextResponse.redirect(destination, 303);
}

export async function POST(request: Request) {
  return handlePayuReturn(request, "/payment/success");
}

export function GET() {
  const destination = new URL("/payment/success", getPayuConfig().siteUrl);

  return NextResponse.redirect(destination, 303);
}
