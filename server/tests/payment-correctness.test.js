import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import axios from "axios";
import Checkout from "../models/checkout.model.js";
import Invoice from "../models/invoice.model.js";
import { User } from "../models/user.model.js";
import {
  minorUnits,
  validatePayPalOrder,
  validateFlutterwave,
} from "../services/paymentValidation.js";

const owner = "aaaaaaaaaaaaaaaaaaaaaaaa",
  other = "bbbbbbbbbbbbbbbbbbbbbbbb",
  invoiceId = "cccccccccccccccccccccccc";
const paypal = {
  _id: "dddddddddddddddddddddddd",
  provider: "paypal",
  reference: `invoice-${invoiceId}`,
  userId: owner,
  invoiceId,
  providerId: "ORDER123",
  merchantId: "MERCHANT123",
  amountMinor: 10800,
  currency: "USD",
  status: "pending",
};
const order = () => ({
  id: "ORDER123",
  status: "COMPLETED",
  purchase_units: [
    {
      invoice_id: invoiceId,
      custom_id: invoiceId,
      payee: { merchant_id: "MERCHANT123" },
      amount: { value: "108.00", currency_code: "USD" },
      payments: {
        captures: [
          {
            id: "CAPTURE123",
            status: "COMPLETED",
            final_capture: true,
            amount: { value: "108.00", currency_code: "USD" },
          },
        ],
      },
    },
  ],
});
const upgrade = {
  _id: "eeeeeeeeeeeeeeeeeeeeeeee",
  provider: "flutterwave",
  reference: "pro-unique",
  userId: owner,
  customerEmail: "owner@example.test",
  amountMinor: 10800,
  currency: "USD",
  status: "pending",
};
const transaction = () => ({
  id: 123,
  tx_ref: "pro-unique",
  status: "successful",
  amount: 108,
  currency: "USD",
  customer: { email: "owner@example.test" },
});

test("payment amounts are exact and PayPal validates invoice, merchant and final capture", () => {
  assert.equal(minorUnits("108.00"), 10800);
  for (const amount of [
    "-1",
    "0",
    "1.001",
    "1e2",
    "NaN",
    "Infinity",
    "9007199254740992",
  ])
    assert.throws(() => minorUnits(amount));
  assert.equal(validatePayPalOrder(paypal, order(), true), "CAPTURE123");
  for (const change of [
    (o) => (o.id = "OTHERORDER"),
    (o) => (o.purchase_units[0].invoice_id = other),
    (o) => (o.purchase_units[0].custom_id = other),
    (o) => (o.purchase_units[0].payee.merchant_id = "ATTACKER"),
    (o) => (o.purchase_units[0].amount.value = "1.00"),
    (o) => (o.purchase_units[0].amount.currency_code = "NGN"),
    (o) => (o.purchase_units[0].payments.captures[0].amount.value = "1.00"),
    (o) => (o.purchase_units[0].payments.captures[0].status = "PENDING"),
    (o) => (o.purchase_units[0].payments.captures[0].final_capture = false),
    (o) => (o.status = "APPROVED"),
    (o) => o.purchase_units.push(o.purchase_units[0]),
  ]) {
    const bad = order();
    change(bad);
    assert.throws(() => validatePayPalOrder(paypal, bad, true));
  }
});

test("Flutterwave checks reference, customer, amount, currency, status and transaction ID", () => {
  validateFlutterwave(upgrade, transaction(), "123");
  for (const change of [
    (p) => (p.id = 999),
    (p) => (p.tx_ref = "another-purchase"),
    (p) => (p.amount = 1),
    (p) => (p.currency = "NGN"),
    (p) => (p.status = "pending"),
    (p) => (p.customer.email = "other@example.test"),
  ]) {
    const bad = transaction();
    change(bad);
    assert.throws(() => validateFlutterwave(upgrade, bad, "123"));
  }
  assert.throws(() =>
    validateFlutterwave(
      { ...upgrade, providerId: "999" },
      transaction(),
      "123",
    ),
  );
  assert.throws(() => validateFlutterwave(null, transaction(), "123"));
});

test("settlement is scoped, replay-safe and recovers after a failed application write", async (t) => {
  Object.assign(process.env, {
    ENCRYPTION_SECRET: "11".repeat(32),
    PAYPAL_API_URL: "https://api-m.sandbox.paypal.com",
    FRONTEND_URL: "https://app.example.test",
  });
  const { encrypt } = await import("../utils/encrypt.js");
  const { settlePayPal, settleFlutterwave } = await import(
    "../services/settlePayments.js"
  );
  const records = [structuredClone(paypal), structuredClone(upgrade)];
  let invoice = {
    _id: invoiceId,
    userId: owner,
    amountNumeric: 108,
    status: "pending",
  };
  let failApply = false,
    applied = 0,
    captures = 0,
    currentOrder = order();
  t.mock.method(
    Checkout,
    "findOne",
    async (filter) =>
      records.find((r) =>
        Object.entries(filter).every(([k, v]) => r[k] === v),
      ) || null,
  );
  t.mock.method(Checkout, "findOneAndUpdate", async (filter, update) => {
    const record = records.find((r) => r._id === filter._id);
    const fields = update.$set;
    if (record.providerId && record.providerId !== fields.providerId)
      return null;
    if (record.settlementId && record.settlementId !== fields.settlementId)
      return null;
    Object.assign(record, fields);
    return structuredClone(record);
  });
  t.mock.method(Checkout, "updateOne", async (filter, update) =>
    Object.assign(
      records.find((r) => r._id === filter._id),
      update.$set,
    ),
  );
  t.mock.method(Invoice, "findOne", async (filter) =>
    filter._id === invoiceId && filter.userId === owner ? { ...invoice } : null,
  );
  t.mock.method(Invoice, "findOneAndUpdate", async (filter, update) => {
    assert.equal(filter.userId, owner);
    assert.equal(filter._id, invoiceId);
    if (failApply) {
      failApply = false;
      throw new Error("simulated write interruption");
    }
    Object.assign(invoice, update.$set);
    return invoice;
  });
  t.mock.method(User, "findById", async (id) => {
    assert.equal(id, owner);
    return {
      paypal: {
        tokenExpiry: Date.now() + 60000,
        accessToken: encrypt("merchant-token"),
      },
    };
  });
  t.mock.method(User, "findOneAndUpdate", async (filter, update) => {
    assert.equal(filter._id, owner);
    assert.equal(update[0].$set.tier, "pro");
    assert.equal(filter.proPurchases.$ne, upgrade._id);
    applied++;
    return { _id: owner, tier: "pro" };
  });
  t.mock.method(axios, "get", async (url) =>
    url.includes("flutterwave")
      ? { data: { status: "success", data: transaction() } }
      : { data: structuredClone(currentOrder) },
  );
  t.mock.method(axios, "post", async (_url, _body, options) => {
    captures++;
    assert(options.headers["PayPal-Request-Id"]);
    currentOrder = order();
    return { data: currentOrder };
  });
  await assert.rejects(settlePayPal("ORDER123", other, true));
  assert.equal(captures, 0);
  currentOrder = order();
  currentOrder.status = "APPROVED";
  failApply = true;
  await assert.rejects(settlePayPal("ORDER123", invoiceId, true));
  assert.equal(records[0].status, "paid");
  assert.equal(records[0].appliedAt, undefined);
  await settlePayPal("ORDER123", invoiceId, true);
  await settlePayPal("ORDER123", invoiceId, true);
  assert.equal(captures, 1);
  assert.equal(invoice.status, "paid");
  assert(records[0].appliedAt);
  await assert.rejects(settleFlutterwave("123", other));
  assert.equal(applied, 0);
  await settleFlutterwave("123", owner);
  await settleFlutterwave("123", owner);
  assert.equal(records[1].providerId, "123");
  assert.equal(records[1].status, "paid");
  assert.equal(
    records.filter(
      (r) => r.provider === "flutterwave" && r.providerId === "123",
    ).length,
    1,
  );
  assert(
    Checkout.schema
      .indexes()
      .some(([keys, opts]) => keys.providerId && opts.unique),
  );
  assert(
    Checkout.schema
      .indexes()
      .some(([keys, opts]) => keys.settlementId && opts.unique),
  );
});

test("cancellation does not mutate invoices; webhook forgery and unsigned reconciliation are rejected", async (t) => {
  Object.assign(process.env, {
    ENCRYPTION_SECRET: "11".repeat(32),
    FRONTEND_URL: "https://app.example.test",
    PAYPAL_WEBHOOK_ID: "test-webhook",
    FLUTTERWAVE_WEBHOOK_SECRET: "test-secret",
  });
  const { default: payments } = await import("../routes/payment.routes.js");
  const { default: events } = await import("../routes/paymentEvents.routes.js");
  for (const name of ["findByIdAndUpdate", "findOneAndUpdate", "updateOne"])
    t.mock.method(Invoice, name, () =>
      assert.fail("Cancellation must not write to invoices"),
    );
  t.mock.method(axios, "post", async (url) => ({
    data: url.includes("verify-webhook")
      ? { verification_status: "FAILURE" }
      : { access_token: "test" },
  }));
  const app = express();
  app.use(express.json());
  app.use(payments, events);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const origin = `http://127.0.0.1:${server.address().port}`;
  const cancel = await fetch(`${origin}/cancel?invoiceId=${invoiceId}`, {
    redirect: "manual",
  });
  assert.equal(cancel.status, 302);
  assert.equal(
    cancel.headers.get("location"),
    "https://app.example.test/payment-cancelled",
  );
  for (const path of [
    "/webhooks/flutterwave",
    "/webhooks/paypal",
    "/reconcile-pending",
  ]) {
    const response = await fetch(origin + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    assert.equal(response.status, 401);
  }
  const spoof = await fetch(`${origin}/webhooks/paypal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paypal-auth-algo": "SHA256withRSA",
      "paypal-cert-url": "https://example.test/cert",
      "paypal-transmission-id": "fake",
      "paypal-transmission-sig": "fake",
      "paypal-transmission-time": new Date().toISOString(),
    },
    body: JSON.stringify({ event_type: "PAYMENT.CAPTURE.COMPLETED" }),
  });
  assert.equal(spoof.status, 401);
});

test("checkout creation persists ownership and expected amounts before returning payment links", async (t) => {
  Object.assign(process.env, {
    ENCRYPTION_SECRET: "11".repeat(32),
    JWT_SECRET: "checkout-test",
    PAYPAL_API_URL: "https://api-m.sandbox.paypal.com",
    BACKEND_URL: "https://api.example.test",
    FRONTEND_URL: "https://app.example.test",
  });
  const { encrypt } = await import("../utils/encrypt.js");
  const { generatePayPalPaymentLink } = await import(
    "../services/paypalCheckout.js"
  );
  const { default: upgrades } = await import("../routes/upgrade.routes.js");
  let saved,
    attached = false,
    invoiceRequests = 0;
  const account = {
    email: "owner@example.test",
    name: "Owner",
    tier: "free",
    isVerified: true,
    isDeleted: false,
    paypal: {
      tokenExpiry: Date.now() + 60000,
      accessToken: encrypt("merchant-token"),
    },
  };
  t.mock.method(User, "findById", (id) => {
    assert.equal(id, owner);
    return {
      select: async () => account,
      then: (resolve, reject) => Promise.resolve(account).then(resolve, reject),
    };
  });
  t.mock.method(Checkout, "findOne", async () => null);
  t.mock.method(Checkout, "create", async (data) => {
    saved = {
      _id: "ffffffffffffffffffffffff",
      ...data,
      save: async () => {
        attached = true;
      },
    };
    return saved;
  });
  const originalFetch = globalThis.fetch;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (!String(url).includes("api-m.sandbox.paypal.com"))
      return originalFetch(url, options);
    invoiceRequests++;
    assert.equal(saved.userId, owner);
    assert.equal(saved.amountMinor, 10800);
    assert.equal(saved.invoiceId, invoiceId);
    assert.equal(options.headers["PayPal-Request-Id"], `invoice-${invoiceId}`);
    const payload = JSON.parse(options.body);
    assert.equal(payload.purchase_units[0].custom_id, invoiceId);
    return {
      ok: true,
      json: async () => ({
        ...order(),
        status: "CREATED",
        links: [
          {
            rel: "approve",
            href: "https://www.sandbox.paypal.com/checkoutnow?token=ORDER123",
          },
        ],
      }),
    };
  });
  const link = await generatePayPalPaymentLink({
    _id: invoiceId,
    userId: owner,
    amount: "108.00",
    invoiceNumber: "INV-001",
    companyName: "Owner",
  });
  assert(link.includes("ORDER123"));
  assert(attached);
  assert.equal(invoiceRequests, 1);
  assert.equal(saved.providerId, "ORDER123");
  assert.equal(saved.merchantId, "MERCHANT123");
  t.mock.method(axios, "post", async (_url, payload) => {
    assert.equal(saved.provider, "flutterwave");
    assert.equal(saved.userId, owner);
    assert.equal(saved.customerEmail, "owner@example.test");
    assert.equal(payload.tx_ref, saved.reference);
    assert.equal(payload.amount, 108);
    assert.equal(payload.customer.email, "owner@example.test");
    return {
      data: { data: { link: "https://checkout.flutterwave.com/test" } },
    };
  });
  const app = express();
  app.use(express.json(), cookieParser());
  app.use(upgrades);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const response = await originalFetch(
    `http://127.0.0.1:${server.address().port}/flutterwave-checkout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${jwt.sign({ userId: owner }, process.env.JWT_SECRET)}`,
      },
      body: JSON.stringify({
        userId: other,
        email: "attacker@example.test",
        amount: 1,
      }),
    },
  );
  assert.equal(response.status, 200);
  assert.equal(
    (await response.json()).paymentLink,
    "https://checkout.flutterwave.com/test",
  );
});
