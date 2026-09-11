import "server-only";

import crypto from "node:crypto";
import { site } from "@/lib/site";

export type LeadEventType =
  | "request_submitted"
  | "payment_started"
  | "payment_success"
  | "payment_failure"
  | "whatsapp_opened"
  | "email_opened";

type LeadEventInput = {
  eventType: LeadEventType;
  name?: string;
  phone?: string;
  email?: string;
  concernArea?: string;
  concern?: string;
  consent?: string | boolean;
  txnid?: string;
  amount?: string;
  productinfo?: string;
  paymentStatus?: string;
  verified?: string | boolean;
  source?: string;
  referenceId?: string;
};

type LeadStorageResult = {
  target: "webhook";
  status: "stored" | "skipped" | "failed";
  customerConfirmationStatus?: string;
};

function clean(value: unknown, maxLength = 600) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function createReferenceId(eventType: LeadEventType) {
  const prefix = eventType === "payment_success" ? "EBP" : "EBR";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

  return `${prefix}-${date}-${suffix}`;
}

function formatDisplayAmount(amount: string) {
  const parsed = Number(amount);

  if (!Number.isFinite(parsed)) {
    return amount;
  }

  return `Rs.${parsed.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: parsed % 1 === 0 ? 0 : 2,
  })}`;
}

function buildCustomerConfirmation(fields: ReturnType<typeof normalizeLeadEvent>): Record<string, string> {
  if (!fields.email) {
    return {};
  }

  const name = fields.name || "there";
  const concernArea = fields.concernArea || "Not specified";
  const submittedAt = new Date(fields.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  if (fields.eventType === "request_submitted") {
    return {
      customerConfirmationTo: fields.email,
      customerConfirmationSubject: `We received your consultation request - ${site.name}`,
      customerConfirmationBody: [
        `Hi ${name},`,
        "",
        `Thank you for contacting ${site.name}. This email confirms that your consultation request has been received and recorded.`,
        "",
        `Reference: ${fields.referenceId}`,
        `Concern area: ${concernArea}`,
        `Submitted: ${submittedAt}`,
        "",
        "Next step: our team will review the details and contact you using the phone, WhatsApp, or email shared in the form.",
        "",
        "This inbox is not monitored for emergency care. If the situation is urgent, please contact a nearby medical facility or local emergency services.",
        "",
        site.name,
        site.email,
        site.domain,
      ].join("\n"),
    };
  }

  if (fields.eventType === "payment_success") {
    const amount = fields.amount ? formatDisplayAmount(fields.amount) : "Recorded";

    return {
      customerConfirmationTo: fields.email,
      customerConfirmationSubject: `Consultation payment received - ${site.name}`,
      customerConfirmationBody: [
        `Hi ${name},`,
        "",
        `Thank you. This email confirms that your consultation payment has been received and recorded by ${site.name}.`,
        "",
        `Booking reference: ${fields.referenceId}`,
        `Transaction ID: ${fields.txnid || "Not available"}`,
        `Amount: ${amount}`,
        `Payment status: ${fields.paymentStatus || "success"}`,
        `Concern area: ${concernArea}`,
        "",
        "Next step: our team will review the booking record and coordinate the consultation follow-up.",
        "",
        "Please keep this email for your records.",
        "",
        site.name,
        site.email,
        site.domain,
      ].join("\n"),
    };
  }

  return {};
}

function normalizeLeadEvent(input: LeadEventInput) {
  const eventType = clean(input.eventType, 40) as LeadEventType;
  const txnid = clean(input.txnid, 80);

  return {
    eventType,
    createdAt: new Date().toISOString(),
    name: clean(input.name, 80),
    phone: clean(input.phone, 30),
    email: clean(input.email, 120).toLowerCase(),
    concernArea: clean(input.concernArea, 80),
    concern: clean(input.concern, 900),
    consent: input.consent === true || input.consent === "true" ? "yes" : clean(input.consent, 30),
    txnid,
    amount: clean(input.amount, 30),
    productinfo: clean(input.productinfo, 120),
    paymentStatus: clean(input.paymentStatus, 80),
    verified: input.verified === true || input.verified === "true" ? "yes" : clean(input.verified, 30),
    source: clean(input.source || "elliesbotanics.com", 120),
    referenceId: clean(input.referenceId || txnid || createReferenceId(eventType), 80),
  };
}

async function submitWebhook(fields: Record<string, string>) {
  const webhookUrl = process.env.LEADS_WEBHOOK_URL?.trim();
  const webhookSecret = process.env.LEADS_WEBHOOK_SECRET?.trim();

  if (!webhookUrl) {
    return { target: "webhook", status: "skipped" } satisfies LeadStorageResult;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookSecret ? { ...fields, secret: webhookSecret } : fields),
    });
    const responseText = await response.text();
    let responseBody: { ok?: unknown; customerConfirmationStatus?: unknown } | null = null;

    try {
      responseBody = JSON.parse(responseText) as {
        ok?: unknown;
        customerConfirmationStatus?: unknown;
      };
    } catch {
      responseBody = null;
    }

    const customerConfirmationStatus =
      typeof responseBody?.customerConfirmationStatus === "string"
        ? responseBody.customerConfirmationStatus
        : undefined;

    return {
      target: "webhook",
      status: response.ok && responseBody?.ok !== false ? "stored" : "failed",
      customerConfirmationStatus,
    } satisfies LeadStorageResult;
  } catch {
    return { target: "webhook", status: "failed" } satisfies LeadStorageResult;
  }
}

export async function recordLeadEvent(input: LeadEventInput) {
  const fields = normalizeLeadEvent(input);
  const customerConfirmation = buildCustomerConfirmation(fields);
  const formName =
    input.eventType === "payment_success" || input.eventType === "payment_failure"
      ? "consultation_payment"
      : "consultation_lead";

  const results = [await submitWebhook({ formName, ...fields, ...customerConfirmation })];

  return {
    ok: results.some((result) => result.status === "stored"),
    customerConfirmationSent: results.some(
      (result) => result.customerConfirmationStatus === "sent",
    ),
    results,
  };
}
