import crypto from "node:crypto";
import { retryNotifications } from "@/lib/leads";
import { reconcilePayments } from "@/lib/orders";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  const expected = process.env.LEADS_WEBHOOK_SECRET || "";
  const supplied =
    request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  if (
    !expected ||
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  )
    return Response.json({ ok: false }, { status: 401 });
  try {
    const [payments, notifications] = await Promise.all([
      reconcilePayments(),
      retryNotifications(),
    ]);
    return Response.json({ ok: true, payments, notifications });
  } catch (error) {
    console.error("Commerce recovery failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ ok: false, error: error instanceof Error ? error.name : "Error" }, { status: 503 });
  }
}
