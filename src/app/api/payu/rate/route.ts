import { NextResponse } from "next/server";
import { getConsultationRate } from "@/lib/payu";

export const runtime = "nodejs";

export function GET() {
  const rate = getConsultationRate();

  return NextResponse.json({
    amount: Number(rate.amount).toFixed(2),
    normalAmount: Number(rate.normalAmount).toFixed(2),
    isFree: true,
    isWeekendOfferActive: rate.isWeekendOfferActive,
    weekendOfferEndsAt: rate.weekendOfferEndsAt,
  });
}
