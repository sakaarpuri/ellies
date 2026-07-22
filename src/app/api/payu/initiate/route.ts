import { NextResponse } from "next/server";
import {
  createPayuTxnId,
  formatPayuAmount,
  generatePaymentHash,
  getMissingPayuConfig,
  getPayuConfig,
  sanitizePayuField,
  type PayuPaymentFields,
} from "@/lib/payu";

export const runtime = "nodejs";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please complete the form before payment." }, { status: 400 });
  }

  const config = getPayuConfig();
  const missing = getMissingPayuConfig(config);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        error:
          "Online payment is temporarily unavailable. Please send your request by WhatsApp or email.",
      },
      { status: 503 },
    );
  }

  let amount: string;

  try {
    amount = formatPayuAmount(config.amount as string);
  } catch {
    return NextResponse.json(
      {
        error:
          "Online payment is temporarily unavailable. Please send your request by WhatsApp or email.",
      },
      { status: 503 },
    );
  }

  const firstname = sanitizePayuField(body.name, 60);
  const email = sanitizePayuField(body.email, 100).toLowerCase();
  const phone = sanitizePayuField(body.phone, 20);
  const concernArea = sanitizePayuField(body.concernArea || "Consultation", 60);
  const consent = body.consent === true;

  if (firstname.length < 2 || !isEmail(email) || phone.length < 6 || !consent) {
    return NextResponse.json(
      { error: "Please add your name, email, phone number, and consent before payment." },
      { status: 400 },
    );
  }

  const fieldsWithoutHash = {
    key: config.key as string,
    txnid: createPayuTxnId(),
    amount,
    productinfo: config.productinfo,
    firstname,
    email,
    phone,
    surl: `${config.siteUrl}/api/payu/success`,
    furl: `${config.siteUrl}/api/payu/failure`,
    udf1: concernArea,
    udf2: "consultation",
    udf3: "",
    udf4: "",
    udf5: "",
  };

  const fields: PayuPaymentFields = {
    ...fieldsWithoutHash,
    hash: generatePaymentHash({ ...fieldsWithoutHash, salt: config.salt as string }),
  };

  return NextResponse.json({
    action: config.baseUrl,
    fields,
  });
}
