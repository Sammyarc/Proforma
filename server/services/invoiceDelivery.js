import crypto from "node:crypto";
import mongoose from "mongoose";
import Draft from "../models/draft.model.js";
import Client from "../models/client.model.js";
import Invoice from "../models/invoice.model.js";
import Attachment from "../models/attachment.model.js";
import Delivery from "../models/delivery.model.js";
import { User } from "../models/user.model.js";
import { normalizeInvoice, escapeHtml, InputError } from "./invoiceData.js";
import { usageFor, reserveUsage, releaseUsage } from "./billing.js";
import { generatePayPalPaymentLink } from "./paypalCheckout.js";
import createTransporter from "../mails/email.config.js";

export async function prepareDelivery(userId, body) {
  const id = body.draftId;
  if (typeof id !== "string" || !/^[a-f0-9]{24}$/i.test(id))
    throw new InputError("Choose a saved invoice.");
  const existing = await Delivery.findOne({ _id: id, userId });
  if (existing) return existing;
  if (!/^[a-f0-9]{24}$/i.test(String(body.attachmentId)))
    throw new InputError("Upload this invoice's PDF first.");
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const draft = await Draft.findOne({
        _id: id,
        userId,
        revision: body.revision,
        lifecycle: "draft",
      }).session(session);
      if (!draft)
        throw new InputError(
          "The saved invoice has changed. Reload before sending.",
        );
      const data = normalizeInvoice(draft.data, true);
      if (
        data.clientId &&
        !(await Client.exists({
          _id: data.clientId,
          userId,
          archived: false,
        }).session(session))
      )
        throw new InputError(
          "This client is archived or unavailable. Restore it before sending.",
        );
      const attachment = await Attachment.findOne({
        _id: body.attachmentId,
        userId,
        draftId: id,
        revision: draft.revision,
        expiresAt: { $gt: new Date() },
      }).session(session);
      if (!attachment)
        throw new InputError("PDF does not belong to this invoice version.");
      await Invoice.create(
        [
          {
            _id: id,
            userId,
            ...data,
            structuredData: data,
            description: data.items.map((item) => item.description).join(", "),
            amountNumeric: data.totalMinor / 100,
            invoiceUrl: `${process.env.BACKEND_URL}/api/documents/${attachment._id}`,
            attachmentId: attachment._id,
            invoiceFileName: attachment.filename,
            status: "pending",
            deliveryStatus: "prepared",
            sentDate: null,
          },
        ],
        { session },
      );
      await Delivery.create(
        [{ _id: id, userId, attachmentId: attachment._id, state: "prepared" }],
        { session },
      );
      await Draft.updateOne(
        { _id: id, userId, revision: draft.revision },
        { $set: { lifecycle: "locked" } },
        { session },
      );
      await Attachment.updateOne(
        { _id: attachment._id },
        { $unset: { expiresAt: "" } },
        { session },
      );
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
  } finally {
    await session.endSession();
  }
  const job = await Delivery.findOne({ _id: id, userId });
  if (!job) throw new Error("Could not prepare delivery");
  return job;
}

export function invoiceMail(invoice, attachment, paymentLink) {
  const safe = escapeHtml;
  const amount = `${invoice.amountNumeric.toFixed(2)} USD`;
  // Only a URL returned by the authenticated PayPal service is accepted here.
  const link = new URL(paymentLink);
  if (
    link.protocol !== "https:" ||
    !["www.paypal.com", "www.sandbox.paypal.com"].includes(link.hostname)
  )
    throw new InputError("Invalid payment link.");
  return {
    from: { name: "Proforma", address: process.env.EMAIL },
    to: invoice.clientAddress,
    subject: `Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`,
    messageId: `<invoice-${invoice._id}@proforma-gen.vercel.app>`,
    text: `Hello ${invoice.clientName},\n\nInvoice ${invoice.invoiceNumber} from ${invoice.companyName} is attached. Total: ${amount}.\nPay: ${link.href}\n\n${invoice.structuredData?.notes || "Thank you for your business."}`,
    html: `<h1>Invoice ${safe(invoice.invoiceNumber)}</h1><p>Hello ${safe(invoice.clientName)},</p><p>Your invoice from ${safe(invoice.companyName)} is attached.</p><p>Total due: <strong>${safe(amount)}</strong></p><p><a href="${safe(link.href)}">Pay invoice</a></p><p>${safe(invoice.structuredData?.notes || "Thank you for your business.")}</p>`,
    attachments: [
      {
        filename: attachment.filename,
        content: attachment.content,
        contentType: "application/pdf",
      },
    ],
    disableFileAccess: true,
    disableUrlAccess: true,
  };
}

export const deliveryProviders = {
  createTransporter,
  generatePayPalPaymentLink,
};
export async function processDelivery(id, userId, confirmUnknown = false) {
  const now = new Date();
  await Delivery.updateOne(
    { _id: id, userId, state: "sending", leaseUntil: { $lt: now } },
    {
      $set: {
        state: "unknown",
        error:
          "Delivery confirmation was interrupted. Check with the recipient before retrying.",
      },
    },
  );
  if (confirmUnknown)
    await Delivery.updateOne(
      { _id: id, userId, state: "unknown" },
      { $set: { state: "failed" } },
    );
  const token = crypto.randomUUID();
  const job = await Delivery.findOneAndUpdate(
    {
      _id: id,
      userId,
      $or: [
        { state: { $in: ["prepared", "failed"] } },
        { state: "processing", leaseUntil: { $lt: now } },
      ],
    },
    {
      $set: {
        state: "processing",
        leaseToken: token,
        leaseUntil: new Date(Date.now() + 5 * 60000),
        error: "",
      },
      $inc: { attempts: 1 },
    },
    { new: true },
  );
  if (!job) {
    const current = await Delivery.findOne({ _id: id, userId });
    if (!current) throw new InputError("Invoice not found.");
    if (current.state === "sent") {
      await Invoice.updateOne(
        { _id: id, userId },
        { $set: { deliveryStatus: "sent", sentDate: current.sentAt } },
      );
      await Draft.updateOne(
        { _id: id, userId },
        { $set: { lifecycle: "sent" } },
      );
    }
    return { state: current.state, error: current.error, invoiceId: id };
  }
  let submitting = false,
    periodKey = job.periodKey;
  try {
    const user = await User.findById(userId);
    if (!user || user.isDeleted || !user.isVerified)
      throw new Error("Account is unavailable.");
    const invoice = await Invoice.findOne({ _id: id, userId });
    const attachment = await Attachment.findOne({
      _id: job.attachmentId,
      userId,
    }).select("+content");
    if (!invoice || !attachment)
      throw new Error("Saved invoice or attachment is missing.");
    if (periodKey) {
      // Retain an already reserved slot across retries and month boundaries.
      const { default: Usage } = await import("../models/usage.model.js");
      const existing = await Usage.findOne({ _id: periodKey, invoices: id });
      if (!existing) periodKey = null;
    }
    if (!periodKey) {
      const usage = await usageFor(user);
      periodKey = usage._id;
      await Delivery.updateOne(
        { _id: id, leaseToken: token },
        { $set: { periodKey } },
      );
      await reserveUsage(user, id, usage);
    }
    if (!invoice.paymentLink) {
      const paymentLink = await deliveryProviders.generatePayPalPaymentLink({
        ...invoice.toObject(),
        amount: invoice.amountNumeric.toFixed(2),
      });
      await Invoice.updateOne({ _id: id, userId }, { $set: { paymentLink } });
      invoice.paymentLink = paymentLink;
    }
    const transporter = await deliveryProviders.createTransporter();
    const mail = invoiceMail(invoice, attachment, invoice.paymentLink);
    // Once SMTP submission starts, an interrupted response is ambiguous. Never
    // automatically resend it: SMTP does not provide an exactly-once contract.
    const claimed = await Delivery.updateOne(
      { _id: id, state: "processing", leaseToken: token },
      { $set: { state: "sending" } },
    );
    if (!claimed.modifiedCount) return { state: "processing", invoiceId: id };
    submitting = true;
    const result = await transporter.sendMail(mail);
    if (!result.accepted?.length) {
      const error = new Error("Recipient was rejected by the mail server.");
      error.definiteRejection = true;
      throw error;
    }
    await Delivery.updateOne(
      { _id: id, leaseToken: token },
      {
        $set: { state: "sent", sentAt: new Date(), error: "" },
        $unset: { leaseUntil: "" },
      },
    );
    await Invoice.updateOne(
      { _id: id, userId },
      { $set: { deliveryStatus: "sent", sentDate: new Date() } },
    );
    await Draft.updateOne({ _id: id, userId }, { $set: { lifecycle: "sent" } });
    return { state: "sent", invoiceId: id };
  } catch (error) {
    const current = await Delivery.findOne({ _id: id, leaseToken: token });
    if (!current) return { state: "processing", invoiceId: id };
    if (current.state === "sent") return { state: "sent", invoiceId: id };
    const definite =
      !submitting ||
      error.definiteRejection ||
      ["EAUTH", "EENVELOPE"].includes(error.code) ||
      (error.responseCode >= 500 && error.responseCode < 600);
    const state = definite ? "failed" : "unknown";
    if (definite) await releaseUsage(periodKey, id);
    const message = definite
      ? error.status
        ? error.message
        : "Delivery failed before acceptance. You can retry this invoice."
      : "Delivery may have been accepted. Check with the recipient before retrying.";
    // A later UI/DB failure cannot downgrade a recorded successful delivery.
    await Delivery.updateOne(
      { _id: id, leaseToken: token, state: { $ne: "sent" } },
      {
        $set: {
          state,
          error: message,
          nextAttemptAt: new Date(Date.now() + 5 * 60000),
        },
        $unset: { leaseUntil: "" },
      },
    );
    await Invoice.updateOne(
      { _id: id, userId, deliveryStatus: { $ne: "sent" } },
      { $set: { deliveryStatus: state } },
    );
    return { state, invoiceId: id, error: message };
  }
}
