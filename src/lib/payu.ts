import "server-only";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
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

let localEnvCache: Record<string, string> | null = null;

function readLocalEnv() {
  if (localEnvCache) {
    return localEnvCache;
  }

  localEnvCache = {};

  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const content = fs.readFileSync(envPath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      if (key && value) {
        localEnvCache[key] = value;
      }
    }
  } catch {
    // Production hosts should provide payment values as real environment variables.
  }

  return localEnvCache;
}

function getEnvValue(key: string) {
  return process.env[key]?.trim() || readLocalEnv()[key]?.trim();
}

export function getPayuConfig(): PayuConfig {
  return {
    key: getEnvValue("PAYU_MERCHANT_KEY"),
    salt: getEnvValue("PAYU_MERCHANT_SALT"),
    baseUrl: getEnvValue("PAYU_BASE_URL") || "https://test.payu.in/_payment",
    siteUrl: (getEnvValue("NEXT_PUBLIC_SITE_URL") || site.url).replace(/\/$/, ""),
    amount: getEnvValue("PAYU_CONSULTATION_AMOUNT"),
    productinfo: getEnvValue("PAYU_CONSULTATION_PRODUCTINFO") || "Ayurvedic Consultation",
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
  const normalizedAmount = amount
    .trim()
    .replace(/^inr\s*/i, "")
    .replace(/^rs\.?\s*/i, "")
    .replace(/[₹,\s]/g, "")
    .replace(/\/-$/, "");
  const parsed = Number(normalizedAmount);

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
