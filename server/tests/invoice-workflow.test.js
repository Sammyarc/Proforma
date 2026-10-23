import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { normalizeInvoice, validatePdf } from "../services/invoiceData.js";
import {
  billingPeriod,
  hasPro,
  reserveUsage,
  releaseUsage,
  grantAnnualPro,
} from "../services/billing.js";
import {
  invoiceMail,
  processDelivery,
  deliveryProviders,
} from "../services/invoiceDelivery.js";
import Usage from "../models/usage.model.js";
import Delivery from "../models/delivery.model.js";
import Invoice from "../models/invoice.model.js";
import Attachment from "../models/attachment.model.js";
import Draft from "../models/draft.model.js";
import { User } from "../models/user.model.js";

const data = () => ({
  companyName: "Studio",
  clientName: "Client",
  clientAddress: "client@example.com",
  invoiceNumber: "INV-1",
  invoiceDate: "2026-10-23",
  dueDate: "2026-11-23",
  items: [{ description: "Design", quantity: 3, rate: 0.1 }],
  tax: 7.5,
});
test("invoice validation computes cents and rejects invalid dates, headers, currency and precision", () => {
  assert.equal(normalizeInvoice(data(), true).totalMinor, 32);
  for (const change of [
    { dueDate: "2026-02-30" },
    { dueDate: "2026-01-01" },
    { companyName: "Studio\nBcc: attacker" },
    { currency: "NGN" },
    { items: [{ description: "Design", quantity: 1, rate: 0.001 }] },
  ]) {
    assert.throws(() => normalizeInvoice({ ...data(), ...change }, true));
  }
});
test("PDF validation and mail composition prohibit arbitrary attachment URLs and HTML injection", () => {
  const buffer = Buffer.from("%PDF-1.7\nfixture\n%%EOF");
  validatePdf({ mimetype: "application/pdf", size: buffer.length, buffer });
  assert.throws(() =>
    validatePdf({
      mimetype: "application/pdf",
      size: 3,
      buffer: Buffer.from("bad"),
    }),
  );
  assert.throws(() =>
    validatePdf({ mimetype: "text/html", size: buffer.length, buffer }),
  );
  const invoice = {
    ...data(),
    _id: "invoice",
    amountNumeric: 0.32,
    clientName: "<img src=x onerror=alert(1)>",
  };
  const mail = invoiceMail(
    invoice,
    { content: buffer, filename: "invoice.pdf" },
    "https://www.paypal.com/checkoutnow?token=test",
  );
  assert(!mail.html.includes("<img"));
  assert.equal(mail.disableUrlAccess, true);
  assert.equal(mail.disableFileAccess, true);
  assert.equal(mail.attachments[0].content, buffer);
  assert.throws(() => invoiceMail(invoice, {}, "https://attacker.example/pdf"));
});
test("monthly anniversaries preserve January 31 and Pro expiry takes effect", () => {
  const feb = billingPeriod(
    "2024-01-31T12:00:00Z",
    new Date("2024-03-01T00:00:00Z"),
  );
  assert.equal(feb.periodStart.toISOString(), "2024-02-29T12:00:00.000Z");
  assert.equal(feb.nextReset.toISOString(), "2024-03-31T12:00:00.000Z");
  assert.equal(
    hasPro({ tier: "pro", proExpiresAt: "2025-01-01" }, new Date("2026-01-01")),
    false,
  );
  assert.equal(hasPro({ tier: "pro" }), true);
});
test("quota caps competing reservations and releases each failed invoice only once", async () => {
  const state = { _id: "period", count: 0, invoices: [] };
  mock.method(Usage, "findOneAndUpdate", async (query, update) => {
    if (
      state.invoices.includes(query.invoices.$ne) ||
      (query.count && state.count >= query.count.$lt)
    )
      return null;
    state.count++;
    state.invoices.push(update.$addToSet.invoices);
    return { ...state };
  });
  mock.method(Usage, "findById", async () => state);
  mock.method(Usage, "updateOne", async (query) => {
    if (state.invoices.includes(query.invoices)) {
      state.count--;
      state.invoices = state.invoices.filter((id) => id !== query.invoices);
    }
  });
  try {
    const result = await Promise.allSettled(
      Array.from({ length: 20 }, (_, i) =>
        reserveUsage({ tier: "free" }, `invoice-${i}`, {
          ...state,
          invoices: [],
        }),
      ),
    );
    assert.equal(result.filter((r) => r.status === "fulfilled").length, 10);
    assert.equal(state.count, 10);
    await reserveUsage({ tier: "free" }, "invoice-0", state);
    assert.equal(state.count, 10);
    await releaseUsage("period", "invoice-0");
    await releaseUsage("period", "invoice-0");
    assert.equal(state.count, 9);
  } finally {
    mock.restoreAll();
  }
});
test("annual grants guard against receipt replay", async () => {
  let applied = 0;
  const purchases = [];
  mock.method(User, "findOneAndUpdate", async (query, pipeline) => {
    if (purchases.includes(query.proPurchases.$ne)) return null;
    assert.equal(pipeline[0].$set.proExpiresAt.$dateAdd.unit, "year");
    assert.equal(pipeline[0].$set.proExpiresAt.$dateAdd.amount, 1);
    purchases.push(query.proPurchases.$ne);
    applied++;
    return { tier: "pro" };
  });
  mock.method(User, "findOne", async () => ({ tier: "pro" }));
  try {
    const receipt = { _id: "receipt", paidAt: new Date() };
    await grantAnnualPro("owner", receipt);
    await grantAnnualPro("owner", receipt);
    assert.equal(applied, 1);
  } finally {
    mock.restoreAll();
  }
});
test("delivery retries do not resend accepted or uncertain mail; definite failures refund usage", async () => {
  let state,
    submissions = 0,
    released = 0,
    outcome;
  const job = () => ({
    _id: "invoice",
    userId: "owner",
    state,
    attachmentId: "attachment",
    periodKey: "period",
  });
  mock.method(Delivery, "updateOne", async (query, update) => {
    if (typeof query.state === "string" && query.state !== state)
      return { modifiedCount: 0 };
    if (query.state === "sending" && query.leaseUntil)
      return { modifiedCount: 0 };
    if (update.$set?.state) state = update.$set.state;
    return { modifiedCount: 1 };
  });
  mock.method(Delivery, "findOneAndUpdate", async () => {
    if (!["prepared", "failed"].includes(state)) return null;
    state = "processing";
    return job();
  });
  mock.method(Delivery, "findOne", async () => job());
  mock.method(Invoice, "updateOne", async () => ({}));
  mock.method(Draft, "updateOne", async () => ({}));
  mock.method(User, "findById", async () => ({
    _id: "owner",
    isVerified: true,
  }));
  mock.method(Invoice, "findOne", async () => ({
    ...data(),
    _id: "invoice",
    amountNumeric: 0.32,
    paymentLink: "https://www.paypal.com/checkoutnow?token=test",
  }));
  mock.method(Attachment, "findOne", () => ({
    select: async () => ({
      filename: "invoice.pdf",
      content: Buffer.from("test"),
    }),
  }));
  mock.method(Usage, "findOne", async () => ({ _id: "period" }));
  mock.method(Usage, "updateOne", async () => {
    released++;
  });
  mock.method(deliveryProviders, "createTransporter", async () => ({
    sendMail: async () => {
      submissions++;
      if (outcome instanceof Error) throw outcome;
      return outcome;
    },
  }));
  try {
    state = "prepared";
    outcome = { accepted: ["client@example.com"] };
    assert.equal((await processDelivery("invoice", "owner")).state, "sent");
    assert.equal((await processDelivery("invoice", "owner")).state, "sent");
    assert.equal(submissions, 1);
    state = "prepared";
    outcome = Object.assign(new Error("timeout"), { code: "ETIMEDOUT" });
    assert.equal((await processDelivery("invoice", "owner")).state, "unknown");
    assert.equal((await processDelivery("invoice", "owner")).state, "unknown");
    assert.equal(submissions, 2);
    assert.equal(released, 0);
    outcome = { accepted: [] };
    assert.equal(
      (await processDelivery("invoice", "owner", true)).state,
      "failed",
    );
    assert.equal(submissions, 3);
    assert.equal(released, 1);
  } finally {
    mock.restoreAll();
  }
});
