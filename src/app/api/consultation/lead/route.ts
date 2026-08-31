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

  const eventType = String(body.eventType || "") as LeadEventType;

  if (!allowedEvents.has(eventType)) {
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

  return NextResponse.json({ ok: true });
}
