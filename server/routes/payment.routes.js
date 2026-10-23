import express from "express";
import { settlePayPal } from "../services/settlePayments.js";
const router = express.Router();
router.get("/success", async (req, res) => {
  try {
    if (
      typeof req.query.invoiceId !== "string" ||
      !/^[a-f0-9]{24}$/i.test(req.query.invoiceId)
    )
      throw new Error("Invalid invoice ID");
    await settlePayPal(req.query.token, req.query.invoiceId, true);
    res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL}/payment-error`);
  }
});
// Leaving checkout must never cancel an outstanding or settled invoice.
router.get("/cancel", (_req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payment-cancelled`);
});
export default router;
