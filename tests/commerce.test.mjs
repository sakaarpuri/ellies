import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");

function harness() {
  const records = new Map();
  const sent = [];
  const requests = [];
  let failRecipient = "";
  let failAll = false;
  let response = {
    ok: true,
    customerConfirmationStatus: "sent",
    adminAlertStatus: "sent",
  };
  const env = {
    PAYU_MERCHANT_KEY: "test-key",
    PAYU_MERCHANT_SALT: "test-salt",
    PAYU_BASE_URL: "https://test.payu.in/_payment",
    PAYU_CONSULTATION_AMOUNT: "200",
    PAYU_CONSULTATION_PRODUCTINFO: "Ayurvedic Consultation",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    LEADS_WEBHOOK_URL: "https://example.invalid/test",
    LEADS_WEBHOOK_SECRET: "test-secret",
    SMTP_PASSWORD: "test-password",
  };
  const store = {
    readRecord: async (key) => records.get(key) || null,
    writeRecord: async (key, value, onlyIfNew) => {
      if (onlyIfNew && records.has(key)) return false;
      records.set(key, value);
      return true;
    },
    deleteRecord: async (key) => records.delete(key),
    claimDeliveryLease: async (id) => {
      if (records.has(`leases/${id}`)) return null;
      records.set(`leases/${id}`, true);
      return "test-lease";
    },
    releaseDeliveryLease: async (id) => records.delete(`leases/${id}`),
    nextBatch: async (prefix) =>
      [...records.keys()].filter((key) => key.startsWith(prefix)).slice(0, 4),
  };
  const cache = new Map();
  function load(name) {
    if (name === "server-only") return {};
    if (name === "@/lib/commerce-store") return store;
    if (name === "nodemailer") return {
      createTransport: (options) => ({
        sendMail: async (message) => {
          assert.equal(options.host, "smtpout.secureserver.net");
          assert.equal(options.secure, true);
          assert.equal(options.auth.user, "support@elliesbotanics.com");
          if (failAll || message.to === failRecipient) throw Object.assign(Error("Test SMTP failure"), { code: "EAUTH" });
          sent.push(message);
          return { accepted: [message.to] };
        },
        close() {},
      }),
    };
    if (!name.startsWith("@/")) return require(name);
    if (cache.has(name)) return cache.get(name);
    const filename = path.join(process.cwd(), "src", name.slice(2) + ".ts");
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    const loaded = { exports: {} };
    const mockedFetch = async (url, options) => {
      requests.push({ url, ...options });
      if (options?.method !== "POST") return new Response(typeof response === "string" ? response : JSON.stringify({ service: "ellies-records-only-v1" }));
      return new Response(
        typeof response === "string" ? response : JSON.stringify(response),
      );
    };
    new Function(
      "require",
      "module",
      "exports",
      "process",
      "fetch",
      "console",
      output,
    )(load, loaded, loaded.exports, { env, cwd: process.cwd }, mockedFetch, { error() {} });
    cache.set(name, loaded.exports);
    return loaded.exports;
  }
  return {
    load,
    records,
    sent,
    requests,
    env,
    failMail(recipient = "", all = false) { failRecipient = recipient; failAll = all; },
    setResponse(value) {
      response = value;
    },
  };
}

const order = {
  txnid: "EB0123456789abcdef01",
  type: "product",
  amount: "270.00",
  productinfo: "Arohini 200 ml",
  name: "Test Customer",
  email: "test@example.com",
  phone: "9999999999",
  consent: true,
  concernArea: "",
  concern: "",
  quantity: 1,
  shippingAddress: "Test address, Punjab 140001, India",
  createdAt: new Date().toISOString(),
};
function signed(h, changes = {}) {
  const params = {
    key: "test-key",
    txnid: order.txnid,
    amount: order.amount,
    productinfo: order.productinfo,
    firstname: order.name,
    email: order.email,
    status: "success",
    udf1: "arohini",
    udf2: "product",
    ...changes,
  };
  params.hash = h.load("@/lib/payu").generateResponseHash(params, "test-salt");
  return params;
}

test("verified product payments persist and queue customer/admin confirmation once", async () => {
  const h = harness();
  const orders = h.load("@/lib/orders");
  await orders.saveOrder(order);
  await orders.processPayment(signed(h));
  await orders.processPayment(signed(h));
  assert.equal(
    [...h.records.keys()].filter((k) => k.startsWith("events/")).length,
    1,
  );
  assert.equal(h.records.has(`pending/${order.txnid}`), false);
  const event = h.records.get(`events/${order.txnid}-payment_success`);
  assert.match(event.customerConfirmationSubject, /Order confirmed/);
  assert.match(event.customerConfirmationBody, /Free within India/);
  assert.match(event.customerConfirmationBody, /Typically delivered in 7 days within India/);
  assert.doesNotMatch(event.customerConfirmationBody, /Transaction ID|Payment status/);
  const customer = h.sent.find((message) => message.to === order.email);
  assert.match(customer.html, /Your Arohini order is confirmed/);
  assert.match(customer.html, /Total paid/);
  assert.match(customer.html, /Delivering to/);
  assert.equal(customer.attachments[0].contentType, "image/jpeg");
  assert.ok(Buffer.isBuffer(customer.attachments[0].content));
  assert.ok(customer.html.includes(`src="cid:${customer.attachments[0].cid}"`));
  assert.equal(event.newsletterOptInAt, "");
  assert.equal(event.amount, "270.00");
  assert.equal(
    (await orders.getReceipt(order.txnid, orders.receiptToken(order.txnid)))
      .paid,
    true,
  );
  assert.equal(await orders.getReceipt(order.txnid, "0".repeat(64)), null);
});

test("paid checkout opt-ins stay queued until the subscriber list acknowledges them", async () => {
  const h = harness();
  const orders = h.load("@/lib/orders");
  const eventId = `${order.txnid}-payment_success`;
  await orders.saveOrder({ ...order, newsletterOptIn: true });
  assert.equal(h.requests.length, 0);
  await orders.processPayment(signed(h, { status: "failure" }));
  assert.equal(h.requests.length, 0);
  await orders.processPayment(signed(h));
  assert.equal(h.records.has(`outbox/${eventId}`), true);
  assert.equal(h.sent.length, 2);
  const payload = JSON.parse(h.requests.find((request) => request.method === "POST").body);
  assert.equal(payload.email, order.email);
  assert.equal(payload.newsletterOptInAt, order.createdAt);
  h.setResponse({ ok: true, newsletterStored: true });
  await h.load("@/lib/leads").retryNotifications();
  assert.equal(h.records.has(`outbox/${eventId}`), false);
  assert.equal(h.sent.length, 2);
});

test("orders initiated before a price change retain their saved price and confirmation amount", async () => {
  const h = harness();
  const orders = h.load("@/lib/orders");
  assert.equal(h.load("@/lib/products").arohini.price, 270);
  await orders.saveOrder({ ...order, amount: "250.00" });
  await orders.processPayment(signed(h, { amount: "250.00" }));
  const event = h.records.get(`events/${order.txnid}-payment_success`);
  assert.equal(event.amount, "250.00");
  assert.match(event.customerConfirmationBody, /Rs\.250/);
});

test("invalid hash, different merchant, tampered amount and unknown orders never confirm payment", async () => {
  const h = harness();
  const orders = h.load("@/lib/orders");
  await orders.saveOrder(order);
  for (const params of [
    { ...signed(h), hash: "bad" },
    signed(h, { key: "other" }),
    signed(h, { amount: "1.00" }),
    signed(h, { email: "other@example.com" }),
    signed(h, { txnid: "EBaaaaaaaaaaaaaaaaaa" }),
  ])
    await assert.rejects(orders.processPayment(params));
  assert.equal(h.records.has(`paid/${order.txnid}`), false);
  assert.equal(
    [...h.records.keys()].some((k) => k.startsWith("events/")),
    false,
  );
});

test("failed signed callbacks never send a paid confirmation or downgrade an existing payment", async () => {
  const h = harness();
  const orders = h.load("@/lib/orders");
  await orders.saveOrder(order);
  assert.equal(
    (await orders.processPayment(signed(h, { status: "failure" }))).paid,
    false,
  );
  assert.equal(h.records.has(`paid/${order.txnid}`), false);
  await orders.processPayment(signed(h));
  await orders.processPayment(signed(h, { status: "failure" }));
  assert.equal(h.records.has(`paid/${order.txnid}`), true);
});

test("Sheets failures do not block Titan email; recipient and Sheets retries are independent", async () => {
  const h = harness();
  h.setResponse("<html>MailApp permission denied</html>");
  const leads = h.load("@/lib/leads");
  const input = {
    eventType: "request_submitted",
    name: "Test",
    email: "test@example.com",
    referenceId: "EBR-test",
    consent: true,
  };
  const result = await leads.recordLeadEvent(input);
  assert.equal(result.ok, true); // Independently persisted, even though Google failed.
  assert.equal(result.customerConfirmationSent, true);
  assert.equal(h.sent.length, 2);
  assert.equal(h.requests.some(r => r.method === "POST"), false); // Never call the legacy mail script.
  assert.equal(h.records.has("outbox/EBR-test-request_submitted"), true);
  h.setResponse({ ok: true });
  await leads.retryNotifications();
  assert.equal(h.records.has("outbox/EBR-test-request_submitted"), false);
  assert.equal(h.sent.length, 2);
  const posted = JSON.parse(h.requests.find(r => r.method === "POST").body);
  assert.equal(posted.customerConfirmationTo, undefined);
  assert.equal(posted.customerConfirmationBody, undefined);
});

test("Titan failures stay queued without a personal-email fallback; retry only sends failed recipients", async () => {
  const h = harness();
  h.failMail("support@elliesbotanics.com");
  const leads = h.load("@/lib/leads");
  await leads.recordLeadEvent({ eventType: "request_submitted", referenceId: "retry", email: "customer@example.com", name: "Test" });
  assert.equal(h.sent.length, 1);
  assert.equal(h.records.has("outbox/retry-request_submitted"), true);
  h.failMail();
  await leads.retryNotifications();
  await leads.deliverEvent("retry-request_submitted");
  assert.equal(h.sent.length, 2);
  assert.equal(h.records.has("outbox/retry-request_submitted"), false);
  for (const mail of h.sent) {
    assert.equal(mail.from.address, "support@elliesbotanics.com");
    assert.equal(mail.replyTo, "support@elliesbotanics.com");
    assert.equal(mail.envelope.from, "support@elliesbotanics.com");
    assert.doesNotMatch(JSON.stringify(mail), /puri\.sakaar|gmail\.com/);
  }
});

test("missing SMTP credentials never reports confirmation sent", async () => {
  const h = harness();
  delete h.env.SMTP_PASSWORD;
  const result = await h.load("@/lib/leads").recordLeadEvent({ eventType: "request_submitted", referenceId: "missing", email: "customer@example.com" });
  assert.equal(result.customerConfirmationSent, false);
  assert.equal(h.sent.length, 0);
  assert.equal(h.records.has("outbox/missing-request_submitted"), true);
});

test("concurrent delivery workers cannot send duplicate confirmations", async () => {
  const h = harness();
  const leads = h.load("@/lib/leads");
  h.failMail("", true);
  await leads.recordLeadEvent({ eventType: "request_submitted", referenceId: "concurrent", email: "customer@example.com" });
  h.failMail();
  await Promise.all([leads.deliverEvent("concurrent-request_submitted"), leads.deliverEvent("concurrent-request_submitted")]);
  assert.equal(h.sent.length, 2);
});

test("existing Rs.200 consultations retain their price and never expose private concern text", async () => {
  const h = harness();
  const orders = h.load("@/lib/orders");
  await orders.saveOrder({
    ...order,
    type: "consultation",
    amount: "200.00",
    productinfo: "Ayurvedic Consultation",
    concern: "Private health details",
  });
  await orders.processPayment(
    signed(h, { amount: "200.00", productinfo: "Ayurvedic Consultation" }),
  );
  const event = h.records.get(`events/${order.txnid}-payment_success`);
  assert.equal(event.amount, "200.00");
  assert.match(
    event.customerConfirmationSubject,
    /Consultation payment received/,
  );
  assert.doesNotMatch(
    event.customerConfirmationBody,
    /Private health details|follow-up/,
  );
});

test("additional-charge response hash is verified and unverified event generation rejected", async () => {
  const h = harness();
  const params = signed(h, { additional_charges: "2.00" });
  assert.equal(
    h.load("@/lib/payu").verifyPayuResponse(params, "test-salt"),
    true,
  );
  params.additional_charges = "3.00";
  assert.equal(
    h.load("@/lib/payu").verifyPayuResponse(params, "test-salt"),
    false,
  );
  await assert.rejects(
    h
      .load("@/lib/leads")
      .recordLeadEvent({
        eventType: "payment_success",
        verified: false,
        paymentStatus: "success",
      }),
  );
});

test("product checkout validates delivery and rejects new consultation charges", async () => {
  const h = harness();
  const { POST } = h.load("@/app/api/payu/initiate/route");
  const product = {
    productId: "arohini",
    quantity: 2,
    amount: "1.00",
    name: "Test Customer",
    email: "test@example.com",
    phone: "9999999999",
    address: "Test address, do not fulfil",
    city: "Chandigarh",
    state: "Chandigarh",
    pincode: "160001",
    consent: true,
  };
  const post = (body) =>
    POST(
      new Request("http://localhost/api/payu/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
  const response = await post(product);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.fields.amount, "540.00");
  assert.equal(result.fields.udf2, "product");
  assert.equal(h.records.get(`orders/${result.fields.txnid}`).newsletterOptIn, false);
  assert.equal(
    h.records.get(`orders/${result.fields.txnid}`).shippingAddress,
    "Test address, do not fulfil, Chandigarh, Chandigarh 160001, India",
  );
  assert.equal(JSON.stringify(result).includes("test-salt"), false);
  const optedIn = await (await post({ ...product, newsletterOptIn: true })).json();
  assert.equal(h.records.get(`orders/${optedIn.fields.txnid}`).newsletterOptIn, true);
  assert.equal(optedIn.fields.newsletterOptIn, undefined);
  for (const [quantity, expected] of [[1, "270.00"], [3, "729.00"], [4, "999.00"], [5, "1269.00"], [6, "1458.00"]]) {
    const bundled = await (await post({
      ...product,
      quantity,
      address: "Flat 5, Test Building,",
      addressLine2: "Test Road,",
      landmark: "Test Library",
    })).json();
    assert.equal(bundled.fields.amount, expected);
    const saved = h.records.get(`orders/${bundled.fields.txnid}`);
    assert.equal(saved.amount, expected);
    assert.equal(saved.shippingAddress, "Flat 5, Test Building, Test Road, Near Test Library, Chandigarh, Chandigarh 160001, India");
  }
  for (const invalid of [
    null,
    [],
    { ...product, quantity: -1 },
    { ...product, quantity: 1.5 },
    { ...product, pincode: "123" },
    { ...product, productId: "fake" },
    { ...product, consent: false },
    { ...product, phone: "(        )" },
  ])
    assert.equal((await post(invalid)).status, 400);
  const countBefore = h.records.size;
  const consultation = await post({
      ...product,
      productId: undefined,
      age: "46",
      gender: "Female",
      concern: "Private health information",
    });
  assert.equal(consultation.status, 409);
  const blocked = await consultation.json();
  assert.match(blocked.error, /free/i);
  assert.equal(blocked.fields, undefined);
  assert.equal(h.records.size, countBefore);
});

test("free consultation requests require demographics and retain them privately", async () => {
  const h = harness();
  const { POST } = h.load("@/app/api/consultation/lead/route");
  const request = (body) => POST(new Request("http://localhost/api/consultation/lead", {
    method: "POST",
    body: JSON.stringify(body),
  }));
  const lead = {
    eventType: "request_submitted",
    name: "Test Visitor",
    email: "visitor@example.com",
    phone: "9999999999",
    consent: true,
    concern: "Fatigue and changes in sleep",
    age: "46",
    gender: "Female",
  };
  assert.equal((await request(lead)).status, 200);
  const sheetRequest = h.requests.find((entry) => entry.method === "POST");
  const record = JSON.parse(sheetRequest.body);
  assert.equal(record.age, "46");
  assert.equal(record.gender, "Female");
  assert.equal(record.concern, "Age: 46\nGender: Female\nFatigue and changes in sleep");
  assert.equal(record.concernArea, "");
  assert.equal(record.amount, "0");
  assert.equal(record.paymentStatus, "not_required");
  assert.ok(h.sent.every((message) => !message.text.includes(lead.concern)));
  assert.equal((await request({ ...lead, age: "", gender: "" })).status, 400);
  assert.equal((await request({ ...lead, age: "" })).status, 400);
  assert.equal((await request({ ...lead, gender: "" })).status, 400);
  assert.equal((await request({ ...lead, age: "121" })).status, 400);
  assert.equal((await request({ ...lead, age: "0" })).status, 400);
  assert.equal((await request({ ...lead, age: "40.5" })).status, 400);
  assert.equal((await request({ ...lead, gender: "Male" })).status, 200);
  assert.equal((await request({ ...lead, gender: "Non-binary" })).status, 400);
  assert.equal((await request({ ...lead, concern: " " })).status, 400);
  assert.equal((await request({ ...lead, gender: "invalid" })).status, 400);
});

test("consultations are free despite the previous paid environment rate", async () => {
  const h = harness();
  const { GET } = h.load("@/app/api/payu/rate/route");
  const rate = await GET().json();
  assert.equal(rate.amount, "0.00");
  assert.equal(rate.normalAmount, "0.00");
  assert.equal(rate.isFree, true);
  assert.equal(rate.isWeekendOfferActive, false);
  assert.equal(h.load("@/lib/payu").getPayuConfig().amount, "0");
});

test("Apps Script stores records idempotently without any email permission and prevents formula injection", () => {
  const sheets = new Map();
  const spreadsheet = {
    getSheetByName: (name) => sheets.get(name),
    insertSheet(name) {
      const rows = [];
      const sheet = {
        rows,
        getLastRow: () => rows.length,
        appendRow: (row) => rows.push(row),
        setFrozenRows() {},
        getRange(row, col, count) {
          return {
            createTextFinder: (text) => ({
              matchEntireCell: () => ({
                findNext: () => rows.slice(row - 1, row - 1 + count).find((record) => record[col - 1] === text),
              }),
            }),
          };
        },
      };
      sheets.set(name, sheet);
      return sheet;
    },
  };
  const context = vm.createContext({
    console: { error() {} },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }),
    },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: () => "test-secret" }),
    },
    LockService: {
      getScriptLock: () => ({
        waitLock() {},
        hasLock: () => true,
        releaseLock() {},
      }),
    },
    SpreadsheetApp: {
      openById: () => spreadsheet,
      flush() {},
    },
    MailApp: {
      sendEmail: () => assert.fail("The record-only script must never send mail"),
    },
  });
  vm.runInContext(
    fs.readFileSync("docs/google-apps-script-leads.gs", "utf8"),
    context,
  );
  const data = {
    secret: "test-secret",
    eventId: "test-request_submitted",
    eventType: "request_submitted",
    name: "=IMPORTXML(test)",
    email: "test@example.com",
    referenceId: "test",
    customerConfirmationTo: "test@example.com",
    customerConfirmationSubject: "Received",
    customerConfirmationBody: "Test record",
  };
  const call = (changes = {}) =>
    context.doPost({ postData: { contents: JSON.stringify({ ...data, ...changes }) } });
  const first = call({ newsletterOptInAt: order.createdAt });
  assert.equal(first.ok, true);
  assert.equal(first.service, "ellies-records-only-v1");
  assert.equal(context.doGet().service, "ellies-records-only-v1");
  const rows = sheets.get("Website orders and bookings").rows;
  assert.equal(rows[1][5], "'=IMPORTXML(test)");
  call();
  call();
  assert.equal(rows.length, 2);
  assert.equal(sheets.has("Arohini newsletter and feedback"), false);
  const paidEvent = {
    eventId: "paid-payment_success",
    eventType: "payment_success",
    orderType: "product",
    paymentStatus: "success",
    verified: "yes",
    email: "TEST@example.com",
    referenceId: "paid",
    newsletterOptInAt: order.createdAt,
  };
  assert.equal(call({ ...paidEvent, verified: "no" }).error, "unverified_payment");
  assert.equal(call({ ...paidEvent, newsletterOptInAt: "" }).newsletterStored, undefined);
  assert.equal(sheets.has("Arohini newsletter and feedback"), false);
  assert.equal(call(paidEvent).newsletterStored, true);
  const subscriberRows = sheets.get("Arohini newsletter and feedback").rows;
  assert.deepEqual(Array.from(subscriberRows[1]), [order.email, order.createdAt, "paid", "Subscribed"]);
  subscriberRows[1][3] = "Unsubscribed";
  assert.equal(call({ ...paidEvent, eventId: "repeat-payment_success" }).newsletterStored, true);
  assert.equal(subscriberRows.length, 2);
  assert.equal(subscriberRows[1][3], "Unsubscribed");
  assert.doesNotMatch(fs.readFileSync("docs/google-apps-script-leads.gs", "utf8"), /MailApp|GmailApp/);
  assert.equal(context.doPost().error, "missing_body");
});
