import { NextResponse } from "next/server";
import { recordLeadEvent, type LeadEventType } from "@/lib/leads";

export const runtime = "nodejs";

const allowedEvents = new Set<LeadEventType>([
  "request_submitted",
  "whatsapp_opened",
  "email_opened",
]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ ok: false }, { status: 400 });

  const eventType = String(body.eventType || "") as LeadEventType;

  if (
    !allowedEvents.has(eventType) ||
    body.consent !== true ||
    String(body.name || "").trim().length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email || "")) ||
    !/^\+?[0-9 ()-]{10,20}$/.test(String(body.phone || "")) ||
    String(body.phone).replace(/\D/g, "").length < 10 ||
    String(body.phone).replace(/\D/g, "").length > 15
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const result = await recordLeadEvent({
    eventType,
    name: String(body.name || ""),
    phone: String(body.phone || ""),
    email: String(body.email || ""),
    concernArea: String(body.concernArea || ""),
    concern: String(body.concern || ""),
    consent: body.consent === true,
    source: "consultation form",
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not save the request right now. Please contact Ellie’s Botanics by WhatsApp or email.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    customerConfirmationSent: result.customerConfirmationSent,
  });
}
