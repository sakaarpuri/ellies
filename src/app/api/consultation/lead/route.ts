import { NextResponse } from "next/server";
import { recordLeadEvent, type LeadEventType } from "@/lib/leads";

export const runtime = "nodejs";

const allowedEvents = new Set<LeadEventType>(["whatsapp_opened", "email_opened"]);

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

  await recordLeadEvent({
    eventType,
    name: String(body.name || ""),
    phone: String(body.phone || ""),
    email: String(body.email || ""),
    concernArea: String(body.concernArea || ""),
    concern: String(body.concern || ""),
    consent: body.consent === true,
    source: "consultation form",
  });

  return NextResponse.json({ ok: true });
}
