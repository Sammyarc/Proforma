import express from "express";
import Client from "../models/client.model.js";
import Invoice from "../models/invoice.model.js";
import { requireWorkspace } from "../middleware/requireWorkspace.js";
import { InputError } from "../services/invoiceData.js";
const router = express.Router();
router.use(requireWorkspace);
export function clientInput(body) {
  const result = {};
  for (const [key, max] of Object.entries({
    name: 200,
    email: 254,
    company: 200,
    phone: 50,
    billingAddress: 1000,
    notes: 4000,
  })) {
    const value = body[key] ?? "";
    if (typeof value !== "string" || value.length > max)
      throw new InputError(`Invalid ${key}.`);
    result[key] = value.trim();
  }
  result.email = result.email.toLowerCase();
  if (
    !result.name ||
    /[\r\n]/.test(result.name) ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(result.email)
  )
    throw new InputError("Enter a client name and valid email address.");
  return result;
}
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    res
      .status(error.code === 11000 ? 409 : error.status || 503)
      .json({
        error:
          error.code === 11000
            ? "A client with this email already exists. Check active and archived clients."
            : error.status
              ? error.message
              : "Could not update or load clients. Please try again.",
      });
  }
};
router.param("id", (req, res, next, id) =>
  /^[a-f0-9]{24}$/.test(id)
    ? next()
    : res.status(400).json({ error: "Invalid client ID." }),
);
router.get(
  "/",
  handle(async (req, res) => {
    const page = Number(req.query.page || 1),
      search = req.query.search || "";
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > 10000 ||
      typeof search !== "string" ||
      search.length > 200 ||
      ![undefined, "true", "false"].includes(req.query.archived)
    )
      throw new InputError("Invalid client filters.");
    const filter = {
      userId: req.user.id,
      archived: req.query.archived === "true",
    };
    if (search.trim()) {
      const pattern = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["name", "email", "company"].map((key) => ({
        [key]: { $regex: pattern, $options: "i" },
      }));
    }
    const [clients, total] = await Promise.all([
      Client.find(filter)
        .sort({ name: 1, _id: 1 })
        .skip((page - 1) * 24)
        .limit(24),
      Client.countDocuments(filter),
    ]);
    res.json({
      clients,
      pagination: { page, total, pages: Math.ceil(total / 24) },
    });
  }),
);
router.post(
  "/",
  handle(async (req, res) => {
    const client = await Client.create({
      ...clientInput(req.body),
      userId: req.user.id,
    });
    res.status(201).json({ client });
  }),
);
router.get(
  "/:id",
  handle(async (req, res) => {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!client) return res.sendStatus(404);
    res.json({ client });
  }),
);
router.patch(
  "/:id",
  handle(async (req, res) => {
    if (!Number.isSafeInteger(req.body.revision) || req.body.revision < 1)
      throw new InputError("Invalid client version.");
    let changes;
    if (Object.hasOwn(req.body, "archived")) {
      if (typeof req.body.archived !== "boolean")
        throw new InputError("Invalid archive state.");
      changes = { archived: req.body.archived };
    } else changes = clientInput(req.body);
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, revision: req.body.revision },
      { $set: changes, $inc: { revision: 1 } },
      { new: true, runValidators: true },
    );
    if (!client)
      return res
        .status(409)
        .json({
          error: "Client changed or is unavailable. Reload before editing.",
        });
    res.json({ client });
  }),
);
router.get(
  "/:id/invoices",
  handle(async (req, res) => {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!client) return res.sendStatus(404);
    const page = Number(req.query.page || 1);
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000)
      throw new InputError("Invalid page.");
    // Older invoices have no clientId: match the current email without modifying history.
    const escaped = client.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = {
      userId: req.user.id,
      $or: [
        { clientId: String(client._id) },
        {
          clientId: { $exists: false },
          clientAddress: { $regex: `^${escaped}$`, $options: "i" },
        },
      ],
    };
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ invoiceDate: -1, _id: -1 })
        .skip((page - 1) * 10)
        .limit(10),
      Invoice.countDocuments(filter),
    ]);
    res.json({
      invoices,
      pagination: { page, total, pages: Math.ceil(total / 10) },
    });
  }),
);
export default router;
