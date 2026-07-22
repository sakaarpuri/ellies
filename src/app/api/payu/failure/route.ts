import { NextResponse } from "next/server";
import { recordLeadEvent } from "@/lib/leads";
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

  await recordLeadEvent({
    eventType: "payment_failure",
    name: params.firstname,
    phone: params.phone,
    email: params.email,
    concernArea: params.udf1,
    concern: params.udf3,
    txnid: params.txnid,
    amount: params.amount,
    productinfo: params.productinfo,
    paymentStatus: params.status || "failure",
    verified,
    source: "payment return",
  });

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
  return handlePayuReturn(request, "/payment/failure");
}

export function GET() {
  const destination = new URL("/payment/failure", getPayuConfig().siteUrl);

  return NextResponse.redirect(destination, 303);
}
