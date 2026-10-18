// Records only. This script never sends email or needs Gmail/email permissions.
// Keep this value identical to Netlify's LEADS_WEBHOOK_SECRET. Never share it publicly.
const SECRET = "REPLACE_WITH_THE_SAME_LEADS_WEBHOOK_SECRET";
const SHEET_ID = "1GqAQSQBcSTpoikrha0NO7zRue_4q6iJVKEiAX4lyZj0";
const TAB = "Website orders and bookings";
const HEADERS = ["Event ID", "Created At", "Event", "Reference", "Type", "Name", "Phone", "Email", "Concern Area", "Concern", "Consent", "Transaction", "Amount INR", "Product", "Quantity", "Delivery Address", "Payment Status", "Verified", "Customer Email", "Admin Email"];

function authorizeRecords() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  console.log("Spreadsheet access confirmed: " + spreadsheet.getName());
}

function doGet() {
  return jsonResponse({ service: "ellies-records-only-v1" });
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
    if (!found) {
      sheet.appendRow([
        data.eventId, data.createdAt, data.eventType, data.referenceId, data.orderType,
        data.name, data.phone, data.email, data.concernArea, data.concern, data.consent,
        data.txnid, data.amount, data.productinfo, data.quantity, data.shippingAddress,
        data.paymentStatus, data.verified, "Managed by website", "Managed by website"
      ].map(safeCell));
      SpreadsheetApp.flush();
    }
    return jsonResponse({ ok: true, service: "ellies-records-only-v1" });
  } catch (error) {
    console.error(String(error));
    return jsonResponse({ ok: false, error: "processing_failed" });
  } finally { if (lock.hasLock()) lock.releaseLock(); }
}

function safeCell(value) {
  const text = String(value == null ? "" : value);
  return /^[=+@-]/.test(text) ? "'" + text : text;
}
function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
