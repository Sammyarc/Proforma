import { hasPro } from "../services/billing.js";
﻿import crypto from "node:crypto";
import express from "express";
import axios from "axios";
import { requireWorkspace } from "../middleware/requireWorkspace.js";
import { publicUser } from "../utils/publicUser.js";
import { User } from "../models/user.model.js";
import Checkout from "../models/checkout.model.js";
import {
  settleFlutterwave,
  flutterwaveOptions,
} from "../services/settlePayments.js";
import { PaymentMismatch } from "../services/paymentValidation.js";
const router = express.Router();
router.use(requireWorkspace);
router.post("/flutterwave-checkout", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email name tier proExpiresAt");
    if (hasPro(user))
      return res.status(409).json({ error: "Your account already has Pro." });
    const checkout = await Checkout.create({
      provider: "flutterwave",
      reference: `pro-${crypto.randomUUID()}`,
      userId: req.user.id,
      customerEmail: user.email.toLowerCase(),
      amountMinor: 10800,
      currency: "USD",
    });
    const { data } = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: checkout.reference,
        amount: checkout.amountMinor / 100,
        currency: checkout.currency,
        redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
        customer: { email: user.email, name: user.name },
        customizations: {
          title: "Proforma Pro",
          description: "Pro plan - $108 annual purchase",
        },
      },
      flutterwaveOptions(),
    );
    const link = new URL(data?.data?.link);
    if (
      link.protocol !== "https:" ||
      !(
        link.hostname === "flutterwave.com" ||
        link.hostname.endsWith(".flutterwave.com")
      )
    )
      throw new Error("Invalid checkout URL");
    return res.json({ paymentLink: link.href });
  } catch {
    return res
      .status(502)
      .json({ error: "Could not initialize checkout. Please try again." });
  }
});
router.post("/verify-payment", async (req, res) => {
  try {
    const { user } = await settleFlutterwave(
      req.body.transactionId,
      req.user.id,
    );
    res.json({ status: "success", user: publicUser(user) });
  } catch (error) {
    res
      .status(
        error instanceof PaymentMismatch || error.code === 11000 ? 400 : 502,
      )
      .json({
        status: "failed",
        error: "Payment could not be verified for this account.",
      });
  }
});
export default router;
