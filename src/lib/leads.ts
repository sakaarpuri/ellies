import "server-only";

import { site } from "@/lib/site";

export type LeadEventType =
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
};

type LeadStorageResult = {
  target: "netlify_forms" | "webhook";
  status: "stored" | "skipped" | "failed";
};

function clean(value: unknown, maxLength = 600) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.url).replace(/\/$/, "");
}

function normalizeLeadEvent(input: LeadEventInput) {
  return {
    eventType: clean(input.eventType, 40),
    createdAt: new Date().toISOString(),
    name: clean(input.name, 80),
    phone: clean(input.phone, 30),
    email: clean(input.email, 120).toLowerCase(),
    concernArea: clean(input.concernArea, 80),
    concern: clean(input.concern, 900),
    consent: input.consent === true || input.consent === "true" ? "yes" : clean(input.consent, 30),
    txnid: clean(input.txnid, 80),
    amount: clean(input.amount, 30),
    productinfo: clean(input.productinfo, 120),
    paymentStatus: clean(input.paymentStatus, 80),
    verified: input.verified === true || input.verified === "true" ? "yes" : clean(input.verified, 30),
    source: clean(input.source || "elliesbotanics.com", 120),
  };
}

async function submitNetlifyForm(formName: string, fields: Record<string, string>) {
  if (process.env.NETLIFY !== "true" && process.env.ENABLE_NETLIFY_FORM_STORAGE !== "true") {
    return { target: "netlify_forms", status: "skipped" } satisfies LeadStorageResult;
  }

  try {
    const response = await fetch(`${getSiteUrl()}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "form-name": formName,
        ...fields,
      }).toString(),
    });

    return {
      target: "netlify_forms",
      status: response.ok ? "stored" : "failed",
    } satisfies LeadStorageResult;
  } catch {
    return { target: "netlify_forms", status: "failed" } satisfies LeadStorageResult;
  }
}

async function submitWebhook(fields: Record<string, string>) {
  const webhookUrl = process.env.LEADS_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return { target: "webhook", status: "skipped" } satisfies LeadStorageResult;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fields),
    });

    return {
      target: "webhook",
      status: response.ok ? "stored" : "failed",
    } satisfies LeadStorageResult;
  } catch {
    return { target: "webhook", status: "failed" } satisfies LeadStorageResult;
  }
}

export async function recordLeadEvent(input: LeadEventInput) {
  const fields = normalizeLeadEvent(input);
  const formName =
    input.eventType === "payment_success" || input.eventType === "payment_failure"
      ? "consultation_payment"
      : "consultation_lead";

  const results = await Promise.all([
    submitNetlifyForm(formName, fields),
    submitWebhook({ formName, ...fields }),
  ]);

  return {
    ok: results.some((result) => result.status === "stored"),
    results,
  };
}
