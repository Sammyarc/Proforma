import crypto from "node:crypto";
import express from "express";
import axios from "axios";
import Checkout from "../models/checkout.model.js";
import { requireWorkspace } from "../middleware/requireWorkspace.js";
import {
  reconcileCheckout,
  settleFlutterwave,
  settlePayPal,
} from "../services/settlePayments.js";
import { PaymentMismatch } from "../services/paymentValidation.js";

const router = express.Router();
export function safeEqual(value, secret) {
  if (!secret || typeof value !== "string") return false;
  const a = Buffer.from(value),
    b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

router.post("/webhooks/flutterwave", async (req, res) => {
  if (!safeEqual(req.get("verif-hash"), process.env.FLUTTERWAVE_WEBHOOK_SECRET))
    return res.sendStatus(401);
  if (req.body?.event !== "charge.completed") return res.sendStatus(200);
  try {
    await settleFlutterwave(req.body.data?.id);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(error instanceof PaymentMismatch ? 400 : 503);
  }
});

router.post("/webhooks/paypal", async (req, res) => {
  if (!process.env.PAYPAL_WEBHOOK_ID) return res.sendStatus(503);
  const headers = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ];
  if (headers.some((name) => !req.get(name))) return res.sendStatus(401);
  try {
    const { data: token } = await axios.post(
      `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_SECRET,
        },
        timeout: 15000,
      },
    );
    const { data: verification } = await axios.post(
      `${process.env.PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: req.get("paypal-auth-algo"),
        cert_url: req.get("paypal-cert-url"),
        transmission_id: req.get("paypal-transmission-id"),
        transmission_sig: req.get("paypal-transmission-sig"),
        transmission_time: req.get("paypal-transmission-time"),
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: req.body,
      },
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
        timeout: 15000,
      },
    );
    if (verification.verification_status !== "SUCCESS")
      return res.sendStatus(401);
    const approved = req.body.event_type === "CHECKOUT.ORDER.APPROVED";
    if (!approved && req.body.event_type !== "PAYMENT.CAPTURE.COMPLETED")
      return res.sendStatus(200);
    const orderId = approved
      ? req.body.resource?.id
      : req.body.resource?.supplementary_data?.related_ids?.order_id;
    await settlePayPal(orderId, undefined, approved);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(error instanceof PaymentMismatch ? 400 : 503);
  }
});

// Explicitly authenticated retry for a user's own checkout.
router.post("/reconcile", requireWorkspace, async (req, res) => {
  if (typeof req.body.reference !== "string" || req.body.reference.length > 100)
    return res.sendStatus(400);
  try {
    const checkout = await Checkout.findOne({
      reference: req.body.reference,
      userId: req.user.id,
    });
    if (!checkout) return res.sendStatus(404);
    await reconcileCheckout(checkout);
    const updated = await Checkout.findById(checkout._id).select(
      "status appliedAt",
    );
    res.json({ status: updated.status, applied: Boolean(updated.appliedAt) });
  } catch (error) {
    res
      .status(error instanceof PaymentMismatch ? 409 : 503)
      .json({ error: "Payment is not confirmed yet. Please retry later." });
  }
});

// External scheduler hook. Bounded batches rotate by last check; no in-memory
// timers are needed in serverless deployments. Never accepts account IDs.
router.post("/reconcile-pending", async (req, res) => {
  if (
    !safeEqual(
      req.get("authorization"),
      process.env.PAYMENT_RECONCILE_SECRET &&
        `Bearer ${process.env.PAYMENT_RECONCILE_SECRET}`,
    )
  )
    return res.sendStatus(401);
  try {
    const checkouts = await Checkout.find({
      $or: [
        { status: "pending" },
        { status: "paid", appliedAt: { $exists: false } },
      ],
      createdAt: { $gte: new Date(Date.now() - 30 * 86400000) },
    })
      .sort({ lastCheckedAt: 1, createdAt: 1 })
      .limit(5);
    const outcomes = await Promise.allSettled(checkouts.map(reconcileCheckout));
    res.json({
      checked: outcomes.length,
      retryNeeded: outcomes.filter((item) => item.status === "rejected").length,
    });
  } catch {
    res.sendStatus(503);
  }
});
export default router;
