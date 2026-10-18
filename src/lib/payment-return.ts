import { NextResponse } from "next/server";
import { processPayment } from "@/lib/orders";
import { getPayuConfig } from "@/lib/payu";

export async function handlePaymentReturn(request: Request) {
  const destination = new URL("/payment/success", getPayuConfig().siteUrl);
  try {
    const form = await request.formData();
    const params = Object.fromEntries(
      Array.from(form.entries()).map(([key, value]) => [key, String(value)]),
    );
    const result = await processPayment(params);
    destination.searchParams.set("txnid", result.txnid);
    destination.searchParams.set("token", result.token);
  } catch {
    console.error(
      "Payment return could not be confirmed; reconciliation will check saved orders",
    );
  }
  return NextResponse.redirect(destination, 303);
}
