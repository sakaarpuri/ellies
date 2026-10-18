import "server-only";
import crypto from "node:crypto";
import nodemailer from "nodemailer";

export const notificationAddress = "support@elliesbotanics.com";

export type NotificationMessage = {
  to: string;
  subject: string;
  text: string;
};

export function notificationMessages(fields: Record<string, string>) {
  const paid = fields.eventType === "payment_success";
  if (paid && (fields.verified !== "yes" || fields.paymentStatus !== "success")) {
    throw new Error("Unverified payment cannot generate email");
  }
  const customer = ["request_submitted", "payment_success"].includes(fields.eventType) &&
    fields.customerConfirmationTo && fields.customerConfirmationSubject && fields.customerConfirmationBody
    ? { to: fields.customerConfirmationTo, subject: fields.customerConfirmationSubject, text: fields.customerConfirmationBody }
    : null;
  const admin = ["request_submitted", "payment_success", "whatsapp_opened", "email_opened"].includes(fields.eventType)
    ? {
        to: notificationAddress,
        subject: `${paid ? fields.orderType === "product" ? "Paid Arohini order" : "Paid consultation booking" : "New consultation enquiry"} - ${fields.referenceId}`,
        text: [
          paid ? "Payment has been verified. Please contact the customer to arrange the next step." : "A consultation enquiry has been received. This is not a confirmed paid booking.",
          "", `Reference: ${fields.referenceId}`, `Transaction ID: ${fields.txnid || "Not applicable"}`,
          `Name: ${fields.name}`, `Email: ${fields.email}`, `Phone / WhatsApp: ${fields.phone}`,
          `Payment: ${fields.paymentStatus || "Not paid"}`, `Amount INR: ${fields.amount || "Not applicable"}`,
          ...(fields.orderType === "product" ? [`Product: ${fields.productinfo}`, `Quantity: ${fields.quantity}`, `Delivery address: ${fields.shippingAddress}`, "Delivery: Free within India"] : []),
          "", "The website has saved this record privately. Google Sheet synchronisation is tracked separately.",
          "https://docs.google.com/spreadsheets/d/1GqAQSQBcSTpoikrha0NO7zRue_4q6iJVKEiAX4lyZj0/edit",
        ].join("\n"),
      }
    : null;
  return { customer, admin };
}

export async function sendNotificationMail(id: string, message: NotificationMessage) {
  const pass = process.env.SMTP_PASSWORD;
  if (!pass) throw new Error("SMTP_PASSWORD is not configured");
  if (!/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(message.to)) throw new Error("Invalid recipient");
  const transport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: { user: notificationAddress, pass },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 10000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  // Stable IDs help mail clients recognise a retry; SMTP does not guarantee exactly-once delivery.
  const messageId = `<${crypto.createHash("sha256").update(id).digest("hex")}@elliesbotanics.com>`;
  const deadline = setTimeout(() => transport.close(), 18000);
  try {
    const result = await transport.sendMail({
      from: { name: "Ellie's Botanics", address: notificationAddress },
      replyTo: notificationAddress,
      envelope: { from: notificationAddress, to: [message.to] },
      to: message.to,
      subject: message.subject.replace(/[\r\n]/g, " "),
      text: message.text,
      messageId,
    });
    if (!result.accepted?.some((address) => String(address).toLowerCase() === message.to.toLowerCase())) {
      throw new Error("SMTP did not accept recipient");
    }
    return { messageId };
  } finally {
    clearTimeout(deadline);
    transport.close();
  }
}
