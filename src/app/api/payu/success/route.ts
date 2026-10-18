import { handlePaymentReturn } from "@/lib/payment-return";
export const runtime = "nodejs";
export const POST = handlePaymentReturn;
export function GET(request: Request) {
  return Response.redirect(new URL("/payment/success", request.url), 303);
}
