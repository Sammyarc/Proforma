import express from "express";
import multer from "multer";
import Draft from "../models/draft.model.js";
import Attachment from "../models/attachment.model.js";
import Delivery from "../models/delivery.model.js";
import Client from "../models/client.model.js";
import { requireWorkspace } from "../middleware/requireWorkspace.js";
import { normalizeInvoice, validatePdf } from "../services/invoiceData.js";
const router = express.Router();
router.use(requireWorkspace);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1, fields: 2 },
});
router.param("id", (req, res, next, id) =>
  /^[a-f0-9]{24}$/i.test(id)
    ? next()
    : res.status(400).json({ error: "Invalid document ID" }),
);
router.get("/drafts", async (req, res) => {
  try {
    const drafts = await Draft.find({
      userId: req.user.id,
      lifecycle: { $ne: "sent" },
    })
      .select(
        "revision lifecycle data.invoiceNumber data.clientName data.totalMinor updatedAt",
      )
      .sort({ updatedAt: -1 })
      .limit(100);
    res.json({ drafts });
  } catch {
    res.status(503).json({ error: "Could not load drafts." });
  }
});
router.get("/drafts/:id", async (req, res) => {
  try {
    const draft = await Draft.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!draft) return res.sendStatus(404);
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).select("state error");
    res.json({ draft, delivery });
  } catch {
    res.status(503).json({ error: "Could not load this draft." });
  }
});
router.put("/drafts/:id", async (req, res) => {
  try {
    const revision = req.body.revision;
    if (!Number.isSafeInteger(revision) || revision < 0)
      return res.status(400).json({ error: "Invalid draft version." });
    const data = normalizeInvoice(req.body.data);
    if (
      data.clientId &&
      !(await Client.exists({
        _id: data.clientId,
        userId: req.user.id,
        archived: false,
      }))
    )
      return res
        .status(400)
        .json({
          error:
            "This client is archived or unavailable. Restore it before using it on an invoice.",
        });
    const draft = await Draft.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, revision, lifecycle: "draft" },
      {
        $set: { data },
        $inc: { revision: 1 },
        $setOnInsert: { userId: req.user.id, lifecycle: "draft" },
      },
      { new: true, upsert: revision === 0, runValidators: true },
    );
    if (!draft)
      return res.status(409).json({
        error:
          "This invoice changed in another session or is already being sent. Reload before editing.",
      });
    res.json({ draft });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : error.status || 503).json({
      error:
        error.code === 11000
          ? "Draft version conflict. Reload before editing."
          : error.status
            ? error.message
            : "Could not save draft.",
    });
  }
});
router.post(
  "/drafts/:id/attachment",
  (req, res, next) =>
    upload.single("file")(req, res, (error) =>
      error
        ? res.status(400).json({ error: "Upload one PDF up to 4 MB." })
        : next(),
    ),
  async (req, res) => {
    try {
      validatePdf(req.file);
      const draft = await Draft.findOne({
        _id: req.params.id,
        userId: req.user.id,
        revision: Number(req.body.revision),
        lifecycle: "draft",
      });
      if (!draft)
        return res.status(409).json({
          error: "Save the current invoice before uploading its PDF.",
        });
      normalizeInvoice(draft.data, true);
      const attachment = await Attachment.create({
        userId: req.user.id,
        draftId: req.params.id,
        revision: draft.revision,
        filename: `Invoice-${draft.data.invoiceNumber.replace(/[^a-z0-9_-]/gi, "-").slice(0, 80)}.pdf`,
        content: req.file.buffer,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      });
      res.status(201).json({ attachmentId: attachment._id });
    } catch (error) {
      res
        .status(error.status || 503)
        .json({ error: error.status ? error.message : "Could not store PDF." });
    }
  },
);
router.get("/documents/:id", async (req, res) => {
  try {
    const attachment = await Attachment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).select("+content");
    if (
      !attachment ||
      (attachment.expiresAt && attachment.expiresAt < new Date())
    )
      return res.sendStatus(404);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${attachment.filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });
    res.send(attachment.content);
  } catch {
    res.sendStatus(503);
  }
});
export default router;
