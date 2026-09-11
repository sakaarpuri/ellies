const SECRET = "REPLACE_WITH_THE_SAME_LEADS_WEBHOOK_SECRET";
const ADMIN_EMAILS = "support@elliesbotanics.com";
const BRAND_NAME = "Ellie's Botanics";
const REPLY_TO = "support@elliesbotanics.com";

const HEADERS = [
  "Created At",
  "Event Type",
  "Reference ID",
  "Name",
  "Phone",
  "Email",
  "Concern Area",
  "Concern",
  "Consent",
  "Transaction ID",
  "Amount",
  "Product Info",
  "Payment Status",
  "Verified",
  "Source",
  "Customer Confirmation",
  "Admin Alert"
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "missing_body" });
    }

    const data = JSON.parse(e.postData.contents);

    if (data.secret !== SECRET) {
      return jsonResponse({ ok: false, error: "bad_secret" });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ensureHeaders(sheet);

    const customerConfirmationStatus = sendCustomerConfirmation(data);
    const adminAlertStatus = sendAdminAlert(data);

    sheet.appendRow([
      data.createdAt || new Date().toISOString(),
      data.eventType || "",
      data.referenceId || "",
      data.name || "",
      data.phone || "",
      data.email || "",
      data.concernArea || "",
      data.concern || "",
      data.consent || "",
      data.txnid || "",
      data.amount || "",
      data.productinfo || "",
      data.paymentStatus || "",
      data.verified || "",
      data.source || "",
      customerConfirmationStatus,
      adminAlertStatus
    ]);

    return jsonResponse({
      ok: true,
      customerConfirmationStatus: customerConfirmationStatus,
      adminAlertStatus: adminAlertStatus
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
}

function sendCustomerConfirmation(data) {
  if (!data.customerConfirmationTo || !data.customerConfirmationSubject || !data.customerConfirmationBody) {
    return "not_applicable";
  }

  MailApp.sendEmail({
    to: data.customerConfirmationTo,
    subject: data.customerConfirmationSubject,
    body: data.customerConfirmationBody,
    name: BRAND_NAME,
    replyTo: REPLY_TO
  });

  return "sent";
}

function sendAdminAlert(data) {
  if (!ADMIN_EMAILS) {
    return "not_configured";
  }

  const subject = buildAdminSubject(data);
  const body = [
    "New website record from Ellie's Botanics",
    "",
    "Event: " + (data.eventType || ""),
    "Reference: " + (data.referenceId || ""),
    "Name: " + (data.name || ""),
    "Phone / WhatsApp: " + (data.phone || ""),
    "Email: " + (data.email || ""),
    "Concern area: " + (data.concernArea || ""),
    "",
    "Concern:",
    data.concern || "",
    "",
    "Transaction ID: " + (data.txnid || ""),
    "Amount: " + (data.amount || ""),
    "Payment status: " + (data.paymentStatus || ""),
    "Verified: " + (data.verified || ""),
    "",
    "Open the Google Sheet for the full record."
  ].join("\n");

  MailApp.sendEmail({
    to: ADMIN_EMAILS,
    subject: subject,
    body: body,
    name: BRAND_NAME,
    replyTo: data.email || REPLY_TO
  });

  return "sent";
}

function buildAdminSubject(data) {
  if (data.eventType === "payment_success") {
    return "Paid consultation booking - " + (data.name || "Website visitor");
  }

  if (data.eventType === "request_submitted") {
    return "New consultation request - " + (data.name || "Website visitor");
  }

  return "Ellie's Botanics website record - " + (data.eventType || "new event");
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
