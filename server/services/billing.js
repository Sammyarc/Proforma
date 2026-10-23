import Usage from "../models/usage.model.js";
import InvoiceLog from "../models/invoice.log.js";
import { User } from "../models/user.model.js";
export function hasPro(user, now = new Date()) {
  return (
    user?.tier === "pro" &&
    (!user.proExpiresAt || new Date(user.proExpiresAt) > now)
  );
}
function anniversary(anchor, offset) {
  const date = new Date(anchor);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + offset);
  const last = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date;
}
export function billingPeriod(createdAt, now = new Date()) {
  const anchor = new Date(createdAt);
  if (Number.isNaN(anchor.getTime()))
    throw new Error("Missing account creation date");
  let offset =
    (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    now.getUTCMonth() -
    anchor.getUTCMonth();
  if (anniversary(anchor, offset) > now) offset--;
  return {
    periodStart: anniversary(anchor, offset),
    nextReset: anniversary(anchor, offset + 1),
  };
}
export async function usageFor(user) {
  const { periodStart, nextReset } = billingPeriod(user.createdAt);
  const userId = String(user._id);
  const key = `${userId}:${periodStart.toISOString()}`;
  let usage = await Usage.findById(key);
  if (!usage) {
    // Preserve historical sends; deleting invoices can never reclaim usage.
    const baseline = await InvoiceLog.countDocuments({
      userId,
      createdAt: { $gte: periodStart, $lt: nextReset },
    });
    try {
      usage = await Usage.findOneAndUpdate(
        { _id: key },
        {
          $setOnInsert: {
            userId,
            periodStart,
            nextReset,
            count: baseline,
            invoices: [],
          },
        },
        { upsert: true, new: true },
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      usage = await Usage.findById(key);
    }
  }
  return usage;
}
export async function reserveUsage(user, invoiceId, existingUsage) {
  const usage = existingUsage || (await usageFor(user));
  if (usage.invoices.includes(invoiceId)) return usage._id;
  const reserved = await Usage.findOneAndUpdate(
    {
      _id: usage._id,
      invoices: { $ne: invoiceId },
      ...(hasPro(user) ? {} : { count: { $lt: 10 } }),
    },
    { $inc: { count: 1 }, $addToSet: { invoices: invoiceId } },
    { new: true },
  );
  if (!reserved) {
    const existing = await Usage.findById(usage._id);
    if (!existing.invoices.includes(invoiceId)) {
      const error = new Error(
        "Monthly limit reached. Upgrade to Pro or wait for your next reset.",
      );
      error.status = 403;
      throw error;
    }
  }
  return usage._id;
}
export async function releaseUsage(periodKey, invoiceId) {
  if (periodKey)
    await Usage.updateOne(
      { _id: periodKey, invoices: invoiceId },
      { $inc: { count: -1 }, $pull: { invoices: invoiceId } },
    );
}
export async function grantAnnualPro(userId, receipt) {
  const purchaseId = String(receipt._id);
  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      isDeleted: { $ne: true },
      proPurchases: { $ne: purchaseId },
    },
    [
      {
        $set: {
          tier: "pro",
          proStartedAt: { $ifNull: ["$proStartedAt", receipt.paidAt] },
          proExpiresAt: {
            $dateAdd: {
              startDate: {
                $max: [
                  { $ifNull: ["$proExpiresAt", receipt.paidAt] },
                  receipt.paidAt,
                ],
              },
              unit: "year",
              amount: 1,
            },
          },
          proPurchases: {
            $concatArrays: [{ $ifNull: ["$proPurchases", []] }, [purchaseId]],
          },
        },
      },
    ],
    { new: true },
  );
  return (
    user ||
    User.findOne({
      _id: userId,
      isDeleted: { $ne: true },
      proPurchases: purchaseId,
    })
  );
}
