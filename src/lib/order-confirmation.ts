import "server-only";

import { arohini } from "@/lib/products";
import { site } from "@/lib/site";

export const orderLogoCid = "ellies-order-logo@elliesbotanics.com";

export function formatDisplayAmount(amount: string) {
  if (!amount) return "Recorded";
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return amount;
  return `Rs.${parsed.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: parsed % 1 === 0 ? 0 : 2,
  })}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

export function buildOrderConfirmation(fields: Record<string, string>) {
  const name = fields.name || "there";
  const reference = fields.referenceId;
  const product = fields.productinfo || "Arohini 200 ml";
  const quantity = fields.quantity || "1";
  const amount = formatDisplayAmount(fields.amount);
  const address = fields.shippingAddress?.replace(/,(?:\s*,)+/g, ",") || "";
  const transactionId = fields.txnid && fields.txnid !== reference ? fields.txnid : "";
  const title = "Your Arohini order is confirmed";
  const intro = "Thank you for choosing Arohini. We’ve received your payment and will send you an update when your order is on its way.";
  const orderLines = [
    ["Order reference", reference],
    ...(transactionId ? [["Transaction ID", transactionId]] : []),
    ["Item", `${product} × ${quantity}`],
    ["Delivery", "Free within India"],
    ["Total paid", amount],
  ];
  const help = "Questions about your order? Reply to this email and include your order reference.";
  const orderRows = orderLines.map(([label, value]) => `
    <tr>
      <th scope="row" align="left" style="padding:9px 0;border-bottom:1px solid #dde2d5;font-size:14px;font-weight:normal;color:#475645;">${label}</th>
      <td align="right" style="padding:9px 0 9px 12px;border-bottom:1px solid #dde2d5;font-size:14px;font-weight:bold;color:#283c31;overflow-wrap:anywhere;">${escapeHtml(value)}</td>
    </tr>`).join("");

  return {
    subject: `Order confirmed · Arohini · ${reference}`,
    text: [
      title, "", `Hi ${name},`, "", intro, "",
      ...orderLines.map(([label, value]) => `${label}: ${value}`),
      "", ...(address ? ["Delivering to", address, ""] : []), arohini.deliveryEstimate,
      "", help, "", site.name, site.email, site.url,
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#edf0e8;font-family:Arial,Helvetica,sans-serif;color:#283c31;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf0e8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#fbf8f2;border:1px solid #d7dfd0;border-radius:12px;">
        <tr>
          <td align="center" style="background:#2f3d2a;padding:22px 16px;color:#f6f1ea;border-radius:11px 11px 0 0;">
            <img src="cid:${orderLogoCid}" alt="" width="56" height="56" style="display:block;margin:0 auto 9px;border:0;border-radius:50%;">
            <span style="font-family:Georgia,serif;font-size:20px;">${site.name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 22px 24px;">
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;font-weight:normal;line-height:1.15;">${title}</h1>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.5;">Hi ${escapeHtml(name)},</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">${intro}</p>
            <table aria-label="Order summary" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #dde2d5;">${orderRows}</table>
            ${address ? `<h2 style="margin:20px 0 6px;font-size:15px;">Delivering to</h2>
            <p style="margin:0;font-size:15px;line-height:1.5;">${escapeHtml(address)}</p>` : ""}
            <p style="margin:10px 0 0;color:#475645;font-size:14px;line-height:1.5;">${arohini.deliveryEstimate}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 22px;border-top:1px solid #dde2d5;font-size:13px;line-height:1.5;color:#475645;">
            <p style="margin:0 0 8px;">${help}</p>
            <a href="mailto:${site.email}" style="color:#792641;">${site.email}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
