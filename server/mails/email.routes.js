import express from "express";
import { requireWorkspace } from "../middleware/requireWorkspace.js";
import {
  prepareDelivery,
  processDelivery,
} from "../services/invoiceDelivery.js";
import Delivery from "../models/delivery.model.js";
import { safeEqual } from "../routes/paymentEvents.routes.js";
const router = express.Router();
router.post("/send-email", requireWorkspace, async (req, res) => {
  try {
    const job = await prepareDelivery(req.user.id, req.body);
    const result = await processDelivery(
      job._id,
      req.user.id,
      req.body.confirmUnknown === true,
    );
    res
      .status(
        result.state === "sent"
          ? 200
          : result.state === "processing" || result.state === "sending"
            ? 202
            : 409,
      )
      .json(result);
  } catch (error) {
    res
      .status(error.status || 503)
      .json({
        error: error.status
          ? error.message
          : "Could not prepare invoice delivery. Your saved draft is retained.",
      });
  }
});
router.post("/deliveries/retry-pending", async (req, res) => {
  if (
    !safeEqual(
      req.get("authorization"),
      process.env.DELIVERY_RETRY_SECRET &&
        `Bearer ${process.env.DELIVERY_RETRY_SECRET}`,
    )
  )
    return res.sendStatus(401);
  try {
    const jobs = await Delivery.find({
      attempts: { $lt: 5 },
      $or: [
        { state: "prepared" },
        { state: "failed", nextAttemptAt: { $lte: new Date() } },
        { state: "processing", leaseUntil: { $lt: new Date() } },
      ],
    })
      .sort({ updatedAt: 1 })
      .limit(3);
    const outcomes = await Promise.allSettled(
      jobs.map((job) => processDelivery(job._id, job.userId)),
    );
    res.json({ processed: outcomes.length });
  } catch {
    res.sendStatus(503);
  }
});
export default router;
