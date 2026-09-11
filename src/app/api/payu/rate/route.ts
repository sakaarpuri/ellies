import { NextResponse } from "next/server";
import { formatPayuAmount, getConsultationRate } from "@/lib/payu";

export const runtime = "nodejs";

export function GET() {
  const rate = getConsultationRate();

  return NextResponse.json({
    amount: rate.amount ? formatPayuAmount(rate.amount) : null,
    normalAmount: rate.normalAmount ? formatPayuAmount(rate.normalAmount) : null,
    isWeekendOfferActive: rate.isWeekendOfferActive,
    weekendOfferEndsAt: rate.weekendOfferEndsAt,
  });
}
