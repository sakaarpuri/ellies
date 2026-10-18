import "server-only";

import crypto from "node:crypto";
import { site } from "@/lib/site";
import { notificationMessages, sendNotificationMail } from "@/lib/notification-mail";
import {
  claimDeliveryLease,
  releaseDeliveryLease,
  deleteRecord,
  nextBatch,
  readRecord,
  writeRecord,
} from "@/lib/commerce-store";

export type LeadEventType =
  | "request_submitted"
  | "payment_started"
  | "payment_success"
  | "payment_failure"
  | "whatsapp_opened"
  | "email_opened";

export type LeadEventInput = {
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
  orderType?: string;
  shippingAddress?: string;
  quantity?: string;
};

type LeadStorageResult = {
  target: "webhook";
  status: "stored" | "skipped" | "failed";
  customerConfirmationStatus?: string;
  adminAlertStatus?: string;
  provider?: string;
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
  const suffix = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

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

function buildCustomerConfirmation(
  fields: ReturnType<typeof normalizeLeadEvent>,
): Record<string, string> {
  if (!fields.email) {
    return {};
  }

  const name = fields.name || "there";
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

  if (
    fields.eventType === "payment_success" &&
    fields.verified === "yes" &&
    fields.paymentStatus === "success"
  ) {
    const amount = fields.amount
      ? formatDisplayAmount(fields.amount)
      : "Recorded";
    const product = fields.orderType === "product";

    return {
      customerConfirmationTo: fields.email,
      customerConfirmationSubject: `${product ? "Order confirmed" : "Consultation payment received"} - ${site.name}`,
      customerConfirmationBody: [
        `Hi ${name},`,
        "",
        `Thank you. Your ${product ? "order" : "consultation payment"} has been received and recorded by ${site.name}.`,
        "",
        `${product ? "Order" : "Booking"} reference: ${fields.referenceId}`,
        `Transaction ID: ${fields.txnid || "Not available"}`,
        `Amount: ${amount}`,
        `Payment status: ${fields.paymentStatus || "success"}`,
        ...(product
          ? [
              `Product: ${fields.productinfo}`,
              `Quantity: ${fields.quantity}`,
              "Delivery: Free within India",
              `Delivery address: ${fields.shippingAddress}`,
            ]
          : []),
        "",
        product
          ? "Our team will prepare your order and contact you with delivery updates. This email confirms payment, not dispatch."
          : "Our team will contact you to arrange your consultation. A consultation time is not confirmed until it is agreed with you.",
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
    consent:
      input.consent === true || input.consent === "true"
        ? "yes"
        : clean(input.consent, 30),
    txnid,
    amount: clean(input.amount, 30),
    productinfo: clean(input.productinfo, 120),
    paymentStatus: clean(input.paymentStatus, 80),
    verified:
      input.verified === true || input.verified === "true"
        ? "yes"
        : clean(input.verified, 30),
    source: clean(input.source || "elliesbotanics.com", 120),
    referenceId: clean(
      input.referenceId || txnid || createReferenceId(eventType),
      80,
    ),
    orderType: clean(input.orderType || "consultation", 30),
    shippingAddress: clean(input.shippingAddress, 600),
    quantity: clean(input.quantity, 10),
  };
}

async function submitWebhook(fields: Record<string, string>) {
  const webhookUrl = process.env.LEADS_WEBHOOK_URL?.trim();
  const webhookSecret = process.env.LEADS_WEBHOOK_SECRET?.trim();

  if (!webhookUrl) {
    return { target: "webhook", status: "skipped" } satisfies LeadStorageResult;
  }

  try {
    // Never POST to a legacy script that could send mail as the owner's personal Gmail.
    const capability = await fetch(webhookUrl, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    const protocol = await capability.json();
    if (!capability.ok || protocol?.service !== "ellies-records-only-v1") {
      return { target: "webhook", status: "failed" } satisfies LeadStorageResult;
    }
    const recordsOnly = Object.fromEntries(Object.entries(fields).filter(([key]) => !key.startsWith("customerConfirmation")));
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        webhookSecret ? { ...recordsOnly, secret: webhookSecret } : recordsOnly,
      ),
      signal: AbortSignal.timeout(12000),
    });
    const responseText = await response.text();
    let responseBody: {
      ok?: unknown;
      customerConfirmationStatus?: unknown;
      adminAlertStatus?: unknown;
    } | null = null;

    try {
      responseBody = JSON.parse(responseText) as {
        ok?: unknown;
        customerConfirmationStatus?: unknown;
        adminAlertStatus?: unknown;
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
      status: response.ok && responseBody?.ok === true ? "stored" : "failed",
      customerConfirmationStatus,
      adminAlertStatus:
        typeof responseBody?.adminAlertStatus === "string"
          ? responseBody.adminAlertStatus
          : undefined,
    } satisfies LeadStorageResult;
  } catch {
    return { target: "webhook", status: "failed" } satisfies LeadStorageResult;
  }
}

export async function recordLeadEvent(input: LeadEventInput) {
  if (
    input.eventType === "payment_success" &&
    (input.verified !== true || input.paymentStatus !== "success")
  ) {
    throw new Error("Unverified payment cannot generate confirmation");
  }
  const fields = normalizeLeadEvent(input);
  const customerConfirmation = buildCustomerConfirmation(fields);
  const formName =
    input.eventType === "payment_success" ||
    input.eventType === "payment_failure"
      ? "consultation_payment"
      : "consultation_lead";

  const eventId = `${fields.referenceId}-${fields.eventType}`;
  const payload = { formName, ...fields, ...customerConfirmation, eventId };
  try {
    await writeRecord(`events/${eventId}`, payload, true);
    await writeRecord(
      `outbox/${eventId}`,
      { createdAt: fields.createdAt },
      true,
    );
    const result = await deliverEvent(eventId);
    return {
      ok: true,
      customerConfirmationSent: result?.customerConfirmationStatus === "sent",
    };
  } catch {
    console.error("Could not persist website event", { eventId });
    return { ok: false, customerConfirmationSent: false };
  }
}

export async function deliverEvent(eventId: string) {
  const fields = await readRecord<Record<string, string>>(`events/${eventId}`);
  if (!fields) return null;
  const token = await claimDeliveryLease(eventId);
  if (!token) return readRecord<LeadStorageResult>(`delivery/${eventId}`);
  try {
    const previous = await readRecord<LeadStorageResult>(`delivery/${eventId}`);
    const messages = notificationMessages(fields);
    const send = async (recipient: "customer" | "admin") => {
      const status = recipient === "customer" ? previous?.customerConfirmationStatus : previous?.adminAlertStatus;
      const key = `mail/${eventId}-${recipient}`;
      if (status === "sent" || (await readRecord<{ status: string }>(key))?.status === "sent") return "sent";
      const message = messages[recipient];
      if (!message) return "not_applicable";
      try {
        const result = await sendNotificationMail(`${eventId}-${recipient}`, message);
        await writeRecord(key, { status: "sent", ...result, acceptedAt: new Date().toISOString() });
        return "sent";
      } catch (error) {
        console.error("Notification mail failed", { eventId, recipient, code: (error as { code?: string }).code || "MAIL_FAILED" });
        return "failed";
      }
    };
    const [sheet, customer, admin] = await Promise.all([
      previous?.status === "stored" ? Promise.resolve(previous) : submitWebhook(fields),
      send("customer"), send("admin"),
    ]);
    const result: LeadStorageResult = {
      target: "webhook", status: sheet.status, provider: "titan-smtp",
      customerConfirmationStatus: customer, adminAlertStatus: admin,
    };
    await writeRecord(`delivery/${eventId}`, { ...result, attemptedAt: new Date().toISOString() });
    if (result.status === "stored" && customer !== "failed" && admin !== "failed") {
      await deleteRecord(`outbox/${eventId}`);
    }
    return result;
  } finally {
    await releaseDeliveryLease(eventId, token);
  }
}

export async function retryNotifications() {
  const keys = await nextBatch("outbox/");
  await Promise.all(
    keys.map((key) => deliverEvent(key.slice("outbox/".length))),
  );
  return keys.length;
}
