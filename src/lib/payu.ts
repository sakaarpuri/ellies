import crypto from "node:crypto";
import { site } from "@/lib/site";

export type PayuPaymentFields = {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  hash: string;
};

type PayuConfig = {
  key?: string;
  salt?: string;
  baseUrl: string;
  siteUrl: string;
  amount?: string;
  productinfo: string;
};

export function getPayuConfig(): PayuConfig {
  return {
    key: process.env.PAYU_MERCHANT_KEY?.trim(),
    salt: process.env.PAYU_MERCHANT_SALT?.trim(),
    baseUrl: process.env.PAYU_BASE_URL?.trim() || "https://test.payu.in/_payment",
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.url).replace(/\/$/, ""),
    amount: process.env.PAYU_CONSULTATION_AMOUNT?.trim(),
    productinfo: process.env.PAYU_CONSULTATION_PRODUCTINFO?.trim() || "Ayurvedic Consultation",
  };
}

export function getMissingPayuConfig(config = getPayuConfig()) {
  const missing: string[] = [];

  if (!config.key) {
    missing.push("PAYU_MERCHANT_KEY");
  }

  if (!config.salt) {
    missing.push("PAYU_MERCHANT_SALT");
  }

  if (!config.amount) {
    missing.push("PAYU_CONSULTATION_AMOUNT");
  }

  return missing;
}

export function formatPayuAmount(amount: string) {
  const parsed = Number(amount);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Invalid PAYU_CONSULTATION_AMOUNT");
  }

  return parsed.toFixed(2);
}

export function createPayuTxnId() {
  return `EB${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

export function sanitizePayuField(value: unknown, maxLength = 120) {
  return String(value ?? "")
    .trim()
    .replace(/[|<>]/g, " ")
    .slice(0, maxLength);
}

function sha512(value: string) {
  return crypto.createHash("sha512").update(value).digest("hex");
}

export function generatePaymentHash({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = "",
  udf2 = "",
  udf3 = "",
  udf4 = "",
  udf5 = "",
  salt,
}: Omit<PayuPaymentFields, "hash" | "surl" | "furl" | "phone"> & { salt: string }) {
  return sha512(
    `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`,
  );
}

export function generateResponseHash(params: Record<string, string>, salt: string) {
  return sha512(
    `${salt}|${params.status ?? ""}||||||${params.udf5 ?? ""}|${params.udf4 ?? ""}|${params.udf3 ?? ""}|${params.udf2 ?? ""}|${params.udf1 ?? ""}|${params.email ?? ""}|${params.firstname ?? ""}|${params.productinfo ?? ""}|${params.amount ?? ""}|${params.txnid ?? ""}|${params.key ?? ""}`,
  );
}

export function verifyPayuResponse(params: Record<string, string>, salt: string) {
  const received = params.hash ?? "";
  const expected = generateResponseHash(params, salt);
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}
