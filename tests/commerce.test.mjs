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
  };
  const store = {
    readRecord: async (key) => records.get(key) || null,
    writeRecord: async (key, value, onlyIfNew) => {
      if (onlyIfNew && records.has(key)) return false;
      records.set(key, value);
      return true;
    },
    deleteRecord: async (key) => records.delete(key),
    nextBatch: async (prefix) =>
      [...records.keys()].filter((key) => key.startsWith(prefix)).slice(0, 4),
  };
  const cache = new Map();
  function load(name) {
    if (name === "server-only") return {};
    if (name === "@/lib/commerce-store") return store;
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
    const mockedFetch = async () =>
      new Response(
        typeof response === "string" ? response : JSON.stringify(response),
      );
    new Function(
      "require",
      "module",
      "exports",
      "process",
      "fetch",
      "console",
      output,
    )(load, loaded, loaded.exports, { env }, mockedFetch, { error() {} });
    cache.set(name, loaded.exports);
    return loaded.exports;
  }
  return {
    load,
    records,
    setResponse(value) {
      response = value;
    },
  };
}

const order = {
  txnid: "EB0123456789abcdef01",
  type: "product",
  amount: "250.00",
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
  assert.equal(event.amount, "250.00");
  assert.equal(
    (await orders.getReceipt(order.txnid, orders.receiptToken(order.txnid)))
      .paid,
    true,
  );
  assert.equal(await orders.getReceipt(order.txnid, "0".repeat(64)), null);
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

test("HTTP 200 Google HTML errors do not count as saved-to-Sheets or email sent; retry remains queued", async () => {
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
  assert.equal(result.customerConfirmationSent, false);
  assert.equal(h.records.has("outbox/EBR-test-request_submitted"), true);
  h.setResponse({
    ok: true,
    customerConfirmationStatus: "sent",
    adminAlertStatus: "failed",
  });
  await leads.retryNotifications();
  assert.equal(h.records.has("outbox/EBR-test-request_submitted"), true);
  h.setResponse({
    ok: true,
    customerConfirmationStatus: "sent",
    adminAlertStatus: "sent",
  });
  await leads.retryNotifications();
  assert.equal(h.records.has("outbox/EBR-test-request_submitted"), false);
});

test("consultation confirmation identifies the booking and never exposes private concern text", async () => {
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

test("checkout sets the price server-side, validates delivery, and preserves consultation pricing", async () => {
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
  assert.equal(result.fields.amount, "500.00");
  assert.equal(result.fields.udf2, "product");
  assert.equal(
    h.records.get(`orders/${result.fields.txnid}`).shippingAddress,
    "Test address, do not fulfil, Chandigarh, Chandigarh 160001, India",
  );
  assert.equal(JSON.stringify(result).includes("test-salt"), false);
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
  const consultation = await (
    await post({
      ...product,
      productId: undefined,
      concernArea: "Knees",
      concern: "Private health information",
    })
  ).json();
  assert.equal(consultation.fields.amount, "200.00");
  assert.equal(consultation.fields.udf2, "consultation");
  assert.equal(
    JSON.stringify(consultation).includes("Private health information"),
    false,
  );
});

test("Apps Script saves before mail, retries failed recipient only, and prevents formula injection", () => {
  const rows = [];
  const delivered = [];
  let failAdmin = true;
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (row) => rows.push(row),
    setFrozenRows() {},
    getRange(row, col) {
      return {
        getValues: () => [[rows[row - 1][18], rows[row - 1][19]]],
        setValue: (value) => {
          rows[row - 1][col - 1] = value;
        },
        createTextFinder: (text) => ({
          matchEntireCell: () => ({
            findNext: () => {
              const index = rows.findIndex((r) => r[0] === text);
              return index < 0 ? null : { getRow: () => index + 1 };
            },
          }),
        }),
      };
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
      openById: () => ({
        getSheetByName: () => sheet,
        getUrl: () => "https://example.com/private-sheet",
      }),
      flush() {},
    },
    MailApp: {
      sendEmail: (message) => {
        assert.equal(rows.length, 2);
        if (message.to === "support@elliesbotanics.com" && failAdmin)
          throw Error("Permission denied");
        delivered.push(message);
      },
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
  const call = () =>
    context.doPost({ postData: { contents: JSON.stringify(data) } });
  const first = call();
  assert.equal(first.ok, true);
  assert.equal(first.customerConfirmationStatus, "sent");
  assert.equal(first.adminAlertStatus, "failed");
  assert.equal(rows[1][5], "'=IMPORTXML(test)");
  failAdmin = false;
  call();
  call();
  assert.equal(rows.length, 2);
  assert.equal(delivered.length, 2);
  assert.equal(context.doPost().error, "missing_body");
});
