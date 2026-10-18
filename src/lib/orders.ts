import "server-only";
import crypto from "node:crypto";
import {
  deleteRecord,
  nextBatch,
  readRecord,
  writeRecord,
} from "@/lib/commerce-store";
import { recordLeadEvent } from "@/lib/leads";
import { getPayuConfig, verifyPayuResponse } from "@/lib/payu";

export type Order = {
  txnid: string;
  type: "product" | "consultation";
  amount: string;
  productinfo: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
  concernArea: string;
  concern: string;
  quantity: number;
  shippingAddress: string;
  createdAt: string;
};

export async function saveOrder(order: Order) {
  await writeRecord(`orders/${order.txnid}`, order, true);
  await writeRecord(
    `pending/${order.txnid}`,
    { createdAt: order.createdAt },
    true,
  );
}

export function receiptToken(txnid: string) {
  const salt = getPayuConfig().salt;
  if (!salt) throw new Error("Payment configuration unavailable");
  return crypto
    .createHmac("sha256", salt)
    .update(`receipt:${txnid}`)
    .digest("hex");
}

export async function getReceipt(txnid: string, token: string) {
  if (!/^EB[a-f0-9]{18}$/.test(txnid) || !/^[a-f0-9]{64}$/.test(token))
    return null;
  if (
    !crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(receiptToken(txnid)),
    )
  )
    return null;
  const order = await readRecord<Order>(`orders/${txnid}`);
  if (!order) return null;
  const paid = Boolean(await readRecord(`paid/${txnid}`));
  const delivery = await readRecord<{ customerConfirmationStatus?: string }>(
    `delivery/${txnid}-payment_success`,
  );
  return {
    txnid,
    type: order.type,
    amount: order.amount,
    productinfo: order.productinfo,
    quantity: order.quantity,
    paid,
    emailSent: delivery?.customerConfirmationStatus === "sent",
  };
}

async function settle(order: Order, status: string) {
  if (status !== "success") return false;
  // Immutable paid markers prevent failed/duplicate callbacks from downgrading payment.
  await writeRecord(
    `paid/${order.txnid}`,
    { paidAt: new Date().toISOString() },
    true,
  );
  const result = await recordLeadEvent({
    ...order,
    eventType: "payment_success",
    paymentStatus: "success",
    verified: true,
    orderType: order.type,
    quantity: String(order.quantity),
    source: "verified payment",
  });
  if (!result.ok) throw new Error("Payment notification could not be queued");
  await deleteRecord(`pending/${order.txnid}`);
  return true;
}

export async function processPayment(params: Record<string, string>) {
  const config = getPayuConfig();
  if (
    !config.salt ||
    params.key !== config.key ||
    !verifyPayuResponse(params, config.salt)
  )
    throw new Error("Invalid payment signature");
  if (!/^EB[a-f0-9]{18}$/.test(params.txnid || ""))
    throw new Error("Invalid transaction");
  const order = await readRecord<Order>(`orders/${params.txnid}`);
  if (
    !order ||
    !Number.isFinite(Number(params.amount)) ||
    Number(params.amount) !== Number(order.amount) ||
    params.productinfo !== order.productinfo ||
    params.email?.toLowerCase() !== order.email
  )
    throw new Error("Payment does not match order");
  const paid = await settle(order, params.status);
  return { txnid: order.txnid, paid, token: receiptToken(order.txnid) };
}

export async function reconcilePayments() {
  const config = getPayuConfig();
  if (!config.key || !config.salt) return 0;
  const merchantKey = config.key;
  let checked = 0;
  const keys = await nextBatch("pending/");
  await Promise.all(
    keys.map(async (key) => {
      const txnid = key.slice("pending/".length);
      const order = await readRecord<Order>(`orders/${txnid}`);
      if (!order) return;
      const age = Date.now() - new Date(order.createdAt).getTime();
      if (age < 5 * 60_000) return;
      if (age > 7 * 86400_000) {
        await deleteRecord(key);
        return;
      }
      const command = "verify_payment";
      const hash = crypto
        .createHash("sha512")
        .update(`${config.key}|${command}|${txnid}|${config.salt}`)
        .digest("hex");
      const endpoint = config.baseUrl.includes("test.payu.in")
        ? "https://test.payu.in/merchant/postservice?form=2"
        : "https://info.payu.in/merchant/postservice.php?form=2";
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new URLSearchParams({
            key: merchantKey,
            command,
            var1: txnid,
            hash,
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) return;
        const body = await response.json();
        const payment = body.transaction_details?.[txnid];
        if (
          payment?.status === "success" &&
          Number(payment.amt) === Number(order.amount) &&
          payment.productinfo === order.productinfo
        )
          await settle(order, "success");
        checked++;
      } catch {
        console.error("Payment reconciliation will retry", { txnid });
      }
    }),
  );
  return checked;
}
