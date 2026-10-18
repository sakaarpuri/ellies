// Keep this value identical to Netlify's LEADS_WEBHOOK_SECRET. Never share it publicly.
const SECRET = "REPLACE_WITH_THE_SAME_LEADS_WEBHOOK_SECRET";
const ADMIN_EMAILS = "support@elliesbotanics.com";
const SHEET_ID = "1GqAQSQBcSTpoikrha0NO7zRue_4q6iJVKEiAX4lyZj0";
const TAB = "Website orders and bookings";
const HEADERS = ["Event ID", "Created At", "Event", "Reference", "Type", "Name", "Phone", "Email", "Concern Area", "Concern", "Consent", "Transaction", "Amount INR", "Product", "Quantity", "Delivery Address", "Payment Status", "Verified", "Customer Email", "Admin Email"];

// Run once from the editor as the spreadsheet owner, approve access, then redeploy.
function authorizeAndTest() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  MailApp.sendEmail({
    to: ADMIN_EMAILS, subject: "Ellie's Botanics email setup test",
    body: "Email access is authorised. This is a setup test, not a booking or payment.\n\n" + spreadsheet.getUrl(),
    name: "Ellie's Botanics", replyTo: ADMIN_EMAILS
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!e || !e.postData || !e.postData.contents) return jsonResponse({ ok: false, error: "missing_body" });
    const data = JSON.parse(e.postData.contents);
    const expected = PropertiesService.getScriptProperties().getProperty("LEADS_WEBHOOK_SECRET") || SECRET;
    if (!expected || expected === "REPLACE_WITH_THE_SAME_LEADS_WEBHOOK_SECRET" || data.secret !== expected) return jsonResponse({ ok: false, error: "bad_secret" });
    if (!data.eventId || !/^[A-Za-z0-9_-]{1,160}$/.test(data.eventId)) return jsonResponse({ ok: false, error: "missing_event_id" });
    if (data.eventType === "payment_success" && (data.verified !== "yes" || data.paymentStatus !== "success")) return jsonResponse({ ok: false, error: "unverified_payment" });
    lock.waitLock(20000);
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(TAB) || spreadsheet.insertSheet(TAB);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    const found = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(data.eventId).matchEntireCell(true).findNext() : null;
    let row = found ? found.getRow() : 0;
    if (!row) {
      sheet.appendRow([
        data.eventId, data.createdAt, data.eventType, data.referenceId, data.orderType,
        data.name, data.phone, data.email, data.concernArea, data.concern, data.consent,
        data.txnid, data.amount, data.productinfo, data.quantity, data.shippingAddress,
        data.paymentStatus, data.verified, "pending", "pending"
      ].map(safeCell));
      row = sheet.getLastRow();
      SpreadsheetApp.flush();
    }
    // Save first. Retry each email independently without duplicating the saved row.
    const statuses = sheet.getRange(row, 19, 1, 2).getValues()[0];
    let customer = statuses[0];
    let admin = statuses[1];
    const notifyCustomer = ["request_submitted", "payment_success"].indexOf(data.eventType) >= 0;
    const notifyAdmin = ["request_submitted", "payment_success", "email_opened", "whatsapp_opened"].indexOf(data.eventType) >= 0;
    if (customer !== "sent") {
      customer = "not_applicable";
      if (notifyCustomer && validEmail(data.customerConfirmationTo) && data.customerConfirmationSubject && data.customerConfirmationBody) {
        try {
          MailApp.sendEmail({ to: data.customerConfirmationTo, subject: data.customerConfirmationSubject,
            body: data.customerConfirmationBody, name: "Ellie's Botanics", replyTo: ADMIN_EMAILS });
          customer = "sent";
        } catch (error) { customer = "failed"; console.error("Customer email failed: " + String(error)); }
      }
      sheet.getRange(row, 19).setValue(customer);
      SpreadsheetApp.flush();
    }
    if (admin !== "sent") {
      admin = "not_applicable";
      if (notifyAdmin) {
        try {
          const paid = data.eventType === "payment_success";
          MailApp.sendEmail({
            to: ADMIN_EMAILS,
            subject: (paid ? data.orderType === "product" ? "Paid Arohini order" : "Paid consultation booking" : "New consultation enquiry") + " - " + data.referenceId,
            body: ["A website record needs your attention.", "", "Reference: " + data.referenceId,
              "Type: " + data.orderType, "Event: " + data.eventType,
              "Payment: " + (data.paymentStatus || "Not paid"), "Amount INR: " + (data.amount || "Not applicable"),
              "", "Open the private sheet for contact and delivery details:", spreadsheet.getUrl(),
              "", paid ? "Payment has been verified. Please contact the customer to arrange the next step." : "This is an enquiry, not a confirmed paid booking."].join("\n"),
            name: "Ellie's Botanics", replyTo: validEmail(data.email) ? data.email : ADMIN_EMAILS
          });
          admin = "sent";
        } catch (error) { admin = "failed"; console.error("Admin email failed: " + String(error)); }
      }
      sheet.getRange(row, 20).setValue(admin);
      SpreadsheetApp.flush();
    }
    return jsonResponse({ ok: true, customerConfirmationStatus: customer, adminAlertStatus: admin });
  } catch (error) {
    console.error(String(error));
    return jsonResponse({ ok: false, error: "processing_failed" });
  } finally { if (lock.hasLock()) lock.releaseLock(); }
}

function validEmail(value) { return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function safeCell(value) {
  const text = String(value == null ? "" : value);
  return /^[=+@-]/.test(text) ? "'" + text : text;
}
function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
