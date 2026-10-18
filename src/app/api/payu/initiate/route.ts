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
import { saveOrder } from "@/lib/orders";
import { arohini } from "@/lib/products";

export const runtime = "nodejs";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Please complete the form before payment." },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json(
      { error: "Please complete the form before payment." },
      { status: 400 },
    );

  const config = getPayuConfig();
  const product = body.productId === arohini.id;
  if (body.productId && !product)
    return NextResponse.json(
      { error: "This product is not available." },
      { status: 400 },
    );
  const quantity = product ? Number(body.quantity ?? 1) : 1;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 6)
    return NextResponse.json(
      { error: "Choose between 1 and 6 bottles." },
      { status: 400 },
    );
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
    amount = product
      ? (arohini.price * quantity).toFixed(2)
      : formatPayuAmount(config.amount as string);
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
  const concernArea = product
    ? ""
    : sanitizePayuField(body.concernArea || "Consultation", 60);
  const concern = product ? "" : sanitizePayuField(body.concern, 900);
  const consent = body.consent === true;
  const address = sanitizePayuField(body.address, 250);
  const city = sanitizePayuField(body.city, 80);
  const state = sanitizePayuField(body.state, 80);
  const pincode = sanitizePayuField(body.pincode, 6);
  if (
    product &&
    (address.length < 8 ||
      city.length < 2 ||
      state.length < 2 ||
      !/^[1-9][0-9]{5}$/.test(pincode))
  ) {
    return NextResponse.json(
      {
        error:
          "Please enter a complete Indian delivery address and six-digit PIN code.",
      },
      { status: 400 },
    );
  }

  if (
    firstname.length < 2 ||
    !isEmail(email) ||
    !/^\+?[0-9 ()-]{10,20}$/.test(phone) ||
    phone.replace(/\D/g, "").length < 10 ||
    phone.replace(/\D/g, "").length > 15 ||
    !consent
  ) {
    return NextResponse.json(
      {
        error:
          "Please add your name, email, phone number, and consent before payment.",
      },
      { status: 400 },
    );
  }

  const fieldsWithoutHash = {
    key: config.key as string,
    txnid: createPayuTxnId(),
    amount,
    productinfo: product ? "Arohini 200 ml" : config.productinfo,
    firstname,
    email,
    phone,
    surl: `${config.siteUrl}/api/payu/success`,
    furl: `${config.siteUrl}/api/payu/failure`,
    udf1: product ? arohini.id : "",
    udf2: product ? "product" : "consultation",
    udf3: "",
    udf4: "",
    udf5: "",
  };

  const fields: PayuPaymentFields = {
    ...fieldsWithoutHash,
    hash: generatePaymentHash({
      ...fieldsWithoutHash,
      salt: config.salt as string,
    }),
  };

  try {
    await saveOrder({
      type: product ? "product" : "consultation",
      name: firstname,
      phone,
      email,
      concernArea,
      concern,
      consent,
      txnid: fields.txnid,
      amount,
      productinfo: fields.productinfo,
      quantity,
      shippingAddress: product
        ? `${address}, ${city}, ${state} ${pincode}, India`
        : "",
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "We could not save your request right now. Please contact Ellie’s Botanics by WhatsApp or email.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    action: config.baseUrl,
    fields,
  });
}
