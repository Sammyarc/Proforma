import { grantAnnualPro } from "./billing.js";
﻿import axios from "axios";
import Checkout from "../models/checkout.model.js";
import Invoice from "../models/invoice.model.js";
import { User } from "../models/user.model.js";
import { getValidPayPalAccessToken } from "./paypalClient.js";
import {
  PaymentMismatch,
  minorUnits,
  validatePayPalOrder,
  validateFlutterwave,
} from "./paymentValidation.js";
const requestOptions = (headers) => ({ headers, timeout: 15000 });
export const flutterwaveOptions = () =>
  requestOptions({
    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
  });

// Record a durable receipt first; replay the same idempotent update after a crash.
async function recordSettlement(checkout, providerId, settlementId) {
  const result = await Checkout.findOneAndUpdate(
    {
      _id: checkout._id,
      $or: [{ providerId: { $exists: false } }, { providerId }],
      $and: [{ $or: [{ settlementId: { $exists: false } }, { settlementId }] }],
    },
    {
      $set: {
        providerId,
        settlementId,
        status: "paid",
        paidAt: checkout.paidAt || new Date(),
      },
    },
    { new: true },
  );
  if (!result)
    throw new PaymentMismatch(
      "Checkout already settled by another transaction",
    );
  return result;
}
export async function settlePayPal(
  orderId,
  expectedInvoiceId,
  allowCapture = false,
) {
  if (typeof orderId !== "string" || !/^[A-Z0-9-]{5,100}$/i.test(orderId))
    throw new PaymentMismatch("Invalid order ID");
  const checkout = await Checkout.findOne({
    provider: "paypal",
    providerId: orderId,
  });
  if (
    !checkout ||
    (expectedInvoiceId && checkout.invoiceId !== expectedInvoiceId)
  )
    throw new PaymentMismatch("Unknown invoice checkout");
  const invoice = await Invoice.findOne({
    _id: checkout.invoiceId,
    userId: checkout.userId,
  });
  if (
    !invoice ||
    minorUnits(invoice.amountNumeric) !== checkout.amountMinor ||
    (invoice.status === "paid" && invoice.paymentId !== orderId)
  )
    throw new PaymentMismatch("Invoice cannot accept this payment");
  const accessToken = await getValidPayPalAccessToken(checkout.userId);
  const options = requestOptions({ Authorization: `Bearer ${accessToken}` });
  const endpoint = `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}`;
  let { data: order } = await axios.get(endpoint, options);
  validatePayPalOrder(checkout, order);
  if (order.status === "APPROVED" && allowCapture) {
    await axios.post(
      `${endpoint}/capture`,
      {},
      requestOptions({
        ...options.headers,
        "PayPal-Request-Id": `capture-${checkout.reference}`,
      }),
    );
    ({ data: order } = await axios.get(endpoint, options));
  }
  const captureId = validatePayPalOrder(checkout, order, true);
  const receipt = await recordSettlement(checkout, orderId, captureId);
  const updated = await Invoice.findOneAndUpdate(
    {
      _id: checkout.invoiceId,
      userId: checkout.userId,
      $or: [{ status: { $ne: "paid" } }, { paymentId: orderId }],
    },
    {
      $set: {
        status: "paid",
        paymentId: orderId,
        payerId: order.payer?.payer_id,
        paidAt: receipt.paidAt,
        paymentMethod: "paypal",
      },
    },
    { new: true },
  );
  if (!updated) throw new Error("Could not apply invoice settlement");
  await Checkout.updateOne(
    { _id: checkout._id },
    { $set: { appliedAt: new Date() } },
  );
  return receipt;
}
export async function settleFlutterwave(transactionId, expectedUserId) {
  const id = String(transactionId);
  if (!/^\d{1,30}$/.test(id))
    throw new PaymentMismatch("Invalid transaction ID");
  const { data: response } = await axios.get(
    `https://api.flutterwave.com/v3/transactions/${id}/verify`,
    flutterwaveOptions(),
  );
  const payment = response?.data;
  if (response?.status !== "success" || typeof payment?.tx_ref !== "string")
    throw new PaymentMismatch("Payment verification failed");
  const checkout = await Checkout.findOne({
    provider: "flutterwave",
    reference: payment.tx_ref,
    ...(expectedUserId ? { userId: expectedUserId } : {}),
  });
  validateFlutterwave(checkout, payment, id);
  const receipt = await recordSettlement(checkout, id, id);
  const user = await grantAnnualPro(checkout.userId, receipt);
  if (!user) throw new Error("Could not apply upgrade to account");
  await Checkout.updateOne(
    { _id: checkout._id },
    { $set: { appliedAt: new Date() } },
  );
  return { receipt, user };
}
export async function reconcileCheckout(checkout) {
  await Checkout.updateOne(
    { _id: checkout._id },
    { $set: { lastCheckedAt: new Date() } },
  );
  if (checkout.provider === "paypal") {
    if (!checkout.providerId) return;
    return settlePayPal(checkout.providerId, checkout.invoiceId, false);
  }
  const { data: response } = await axios.get(
    "https://api.flutterwave.com/v3/transactions/verify_by_reference",
    {
      ...flutterwaveOptions(),
      params: { tx_ref: checkout.reference },
    },
  );
  if (response?.data?.id)
    return settleFlutterwave(response.data.id, checkout.userId);
}
