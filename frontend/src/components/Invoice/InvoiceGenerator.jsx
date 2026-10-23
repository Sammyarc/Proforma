import useServerDraft from "../../hooks/useServerDraft";
import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Download,
  Eye,
  FileText,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";
import { useInvoiceStore } from "../../store/invoiceStore";
import Modal from "../ui/Modal";
import { api, dateLabel, money } from "../workspace/shared";

const themes = [
  { id: "studio", name: "Studio", color: "#255c4c" },
  { id: "minimal", name: "Minimal", color: "#25292c" },
  { id: "clay", name: "Clay", color: "#a15c43" },
];
const localDate = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

export default function InvoiceGenerator() {
  const { user, connections } = useAuthStore();
  const { fetchInvoiceCount } = useInvoiceStore();
  const [params] = useSearchParams();
  const draftKey = "proforma:draft:" + user?._id;
  const [draft, setDraft] = useState(() => {
    if (!params.get("client")) {
      try {
        const saved = JSON.parse(localStorage.getItem(draftKey));
        if (saved?.items?.length && saved.companyName !== undefined)
          return saved;
      } catch {
        /* Start clean if the draft is unavailable. */
      }
    }
    return {
      companyName: user?.businessName || user?.name || "",
      companyAddress: user?.email || "",
      clientName: params.get("client") || "",
      clientAddress: params.get("email") || "",
      clientId: params.get("clientId") || undefined,
      clientBillingAddress: params.get("address") || "",
      invoiceNumber: "INV-" + Date.now().toString().slice(-6),
      invoiceDate: localDate(),
      dueDate: "",
      items: [{ description: "", quantity: 1, rate: 0 }],
      tax: 0,
      notes: "Thank you for your business. It’s a pleasure working with you.",
      theme: "studio",
      logo: user?.logoUrl || "",
      terms: "",
    };
  });
  const [busy, setBusy] = useState("");
  const serverDraft = useServerDraft(draft, setDraft);
  const { saved } = serverDraft;
  const [sendOpen, setSendOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const preview = useRef(null);
  const formRef = useRef(null);
  const subtotal = draft.items.reduce(
    (sum, item) =>
      sum +
      Math.round(
        (Math.round(Number(item.quantity) * 100) *
          Math.round(Number(item.rate) * 100)) /
          100,
      ) /
        100,
    0,
  );
  const tax =
    Math.round(
      (Math.round(subtotal * 100) * Math.round(Number(draft.tax) * 100)) /
        10000,
    ) / 100;
  const total = subtotal + tax;
  const theme = themes.find((t) => t.id === draft.theme) || themes[0];
  const update = (field, value) => {
    setDraft((d) => ({ ...d, [field]: value }));
  };
  const uploadLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      toast.error("Choose a PNG or JPG up to 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("logo", reader.result);
    reader.readAsDataURL(file);
  };
  const updateItem = (index, field, value) => {
    update(
      "items",
      draft.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };
  const saveDraft = async () => {
    try {
      await serverDraft.save();
      toast.success("Draft saved to your workspace.");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  };
  const captureInvoice = async () => {
    const { default: html2canvas } = await import("html2canvas");
    await document.fonts.ready;
    const column = preview.current.closest(".ws-preview-column");
    const previousStyle = column.getAttribute("style");
    column.style.cssText =
      "display:block;position:fixed;left:-10000px;top:0;width:800px";
    try {
      return await html2canvas(preview.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (cloned) => {
          const paper = cloned.getElementById("invoice");
          if (paper) {
            paper.style.width = "760px";
            paper.style.maxWidth = "none";
          }
        },
      });
    } finally {
      if (previousStyle === null) column.removeAttribute("style");
      else column.setAttribute("style", previousStyle);
    }
  };
  const makePdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const canvas = await captureInvoice();
    const pdf = new jsPDF("p", "mm", "a4");
    const pagePixels = Math.floor((canvas.width * 277) / 190);
    for (let offset = 0; offset < canvas.height; offset += pagePixels) {
      if (offset) pdf.addPage();
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = Math.min(pagePixels, canvas.height - offset);
      slice
        .getContext("2d")
        .drawImage(
          canvas,
          0,
          offset,
          canvas.width,
          slice.height,
          0,
          0,
          canvas.width,
          slice.height,
        );
      pdf.addImage(
        slice.toDataURL("image/png"),
        "PNG",
        10,
        10,
        190,
        (slice.height * 190) / canvas.width,
      );
    }
    return pdf;
  };
  const download = async () => {
    setBusy("download");
    try {
      const name = draft.invoiceNumber.replace(/[^a-z0-9_-]/gi, "-");
      if (exportFormat === "pdf") {
        const pdf = await makePdf();
        pdf.save(name + ".pdf");
      } else {
        const canvas = await captureInvoice();
        const link = document.createElement("a");
        link.href = canvas.toDataURL(
          exportFormat === "png" ? "image/png" : "image/jpeg",
          0.95,
        );
        link.download = name + "." + exportFormat;
        link.click();
      }
    } catch {
      toast.error("Could not export your invoice. Please try again.");
    } finally {
      setBusy("");
    }
  };
  const reviewSend = () => {
    if (!serverDraft.ready) return;
    if (serverDraft.locked) {
      setSent(serverDraft.delivery?.state === "sent");
      setSendOpen(true);
      return;
    }
    if (!formRef.current.checkValidity()) {
      setMobilePreview(false);
      requestAnimationFrame(() => formRef.current.reportValidity());
      return;
    }
    if (total <= 0) {
      toast.error("Add an item with a total greater than zero.");
      return;
    }
    if (draft.dueDate < draft.invoiceDate) {
      toast.error("The due date must be on or after the issue date.");
      return;
    }
    setSent(false);
    setSendOpen(true);
  };
  const send = async () => {
    if (!connections?.paypal) return;
    serverDraft.setPaused(true);
    setBusy("Preparing invoice");
    try {
      let payload = { draftId: serverDraft.id };
      if (!serverDraft.locked) {
        const revision = await serverDraft.save();
        const pdf = await makePdf();
        const body = new FormData();
        body.append("file", pdf.output("blob"), draft.invoiceNumber + ".pdf");
        body.append("revision", String(revision));
        setBusy("Uploading invoice");
        const { data: upload } = await api.post(
          "/api/drafts/" + serverDraft.id + "/attachment",
          body,
        );
        payload = { ...payload, revision, attachmentId: upload.attachmentId };
      }
      if (serverDraft.delivery?.state === "unknown") {
        if (
          !window.confirm(
            "This invoice may already have reached the recipient. Resending could deliver it twice. Have you checked and want to resend?",
          )
        )
          return;
        payload.confirmUnknown = true;
      }
      setBusy("Sending invoice");
      const { data } = await api.post("/api/send-email", payload);
      serverDraft.setLocked(true);
      serverDraft.setDelivery(data);
      if (data.state === "sent") {
        setSent(true);
        try {
          localStorage.removeItem(draftKey);
        } catch {}
        fetchInvoiceCount(user._id);
        toast.success(
          "Invoice accepted by the mail server for " + draft.clientName + ".",
        );
      } else
        toast.info("Delivery is processing. Check its status before retrying.");
    } catch (error) {
      await serverDraft.refreshDelivery().catch(() => {});
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Could not send the invoice.",
      );
    } finally {
      setBusy("");
      serverDraft.setPaused(false);
    }
  };
  const field = (
    key,
    label,
    type = "text",
    placeholder = "",
    required = true,
  ) => (
    <label className="ws-field">
      {label}
      <input
        type={type}
        value={draft[key]}
        placeholder={placeholder}
        required={required}
        onChange={(e) => update(key, e.target.value)}
      />
    </label>
  );
  return (
    <div className="ws-editor">
      <div role="status" style={{ padding: "12px 0", fontSize: 14 }}>
        {serverDraft.error ||
          (serverDraft.locked
            ? "This invoice is locked for delivery. Its saved details cannot be changed."
            : serverDraft.status)}
        {serverDraft.error && (
          <button
            className="ws-button"
            onClick={() => window.location.reload()}
          >
            Reload saved invoice
          </button>
        )}
        {serverDraft.delivery && (
          <p>
            Delivery: {serverDraft.delivery.state}. {serverDraft.delivery.error}
          </p>
        )}
      </div>
      <Link className="ws-back" to="/dashboard/invoices">
        <ArrowLeft size={15} /> All invoices
      </Link>
      <div className="ws-editor-heading">
        <div>
          <span className="ws-eyebrow">MAKE YOUR WORK OFFICIAL</span>
          <h1>
            Create an invoice
            <span className="ws-draft-dot" />
          </h1>
          <p>
            Add your business, client, and line items. Preview your invoice
            before downloading or sending.
          </p>
        </div>
        <div className="ws-editor-actions">
          <button
            className="ws-button"
            onClick={saveDraft}
            disabled={!!busy || !serverDraft.ready || serverDraft.locked}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Saved to workspace" : "Save draft"}
          </button>
          <select
            aria-label="Export format"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
          <button
            className="ws-button"
            aria-label="Download invoice"
            onClick={download}
            disabled={!!busy || !serverDraft.ready}
          >
            {busy === "download" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download
          </button>
          <button
            className="ws-button ws-primary"
            onClick={reviewSend}
            disabled={!!busy || !serverDraft.ready}
          >
            <Send size={16} />
            Review & send
          </button>
        </div>
      </div>
      <div className="ws-editor-mobile-tabs">
        <button
          className={!mobilePreview ? "active" : ""}
          onClick={() => setMobilePreview(false)}
        >
          <FileText size={16} />
          Details
        </button>
        <button
          className={mobilePreview ? "active" : ""}
          onClick={() => setMobilePreview(true)}
        >
          <Eye size={16} />
          Preview
        </button>
      </div>
      <div
        className={"ws-editor-grid " + (mobilePreview ? "show-preview" : "")}
      >
        <form
          ref={formRef}
          className="ws-editor-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <fieldset
            disabled={!!busy || !serverDraft.ready || serverDraft.locked}
            style={{
              border: 0,
              padding: 0,
              margin: 0,
              minWidth: 0,
              display: "grid",
              gap: 20,
            }}
          >
            <section className="ws-panel ws-editor-section">
              <div className="ws-section-title">
                <span>01</span>
                <h2>Business and client details</h2>
              </div>
              <div className="ws-form-grid">
                {field("companyName", "From", "text", "Your business name")}
                {field(
                  "companyAddress",
                  "Your email",
                  "email",
                  "hello@studio.com",
                )}
                {field(
                  "clientName",
                  "Bill to",
                  "text",
                  "Client or company name",
                )}
                {field(
                  "clientAddress",
                  "Client email",
                  "email",
                  "client@company.com",
                )}
                {field("invoiceNumber", "Invoice number")}
                <label className="ws-field">
                  Client billing address (optional)
                  <textarea
                    aria-label="Client billing address (optional)"
                    rows={3}
                    maxLength={1000}
                    value={draft.clientBillingAddress || ""}
                    onChange={(e) =>
                      update("clientBillingAddress", e.target.value)
                    }
                  />
                </label>
                {field("invoiceDate", "Issue date", "date")}
                {field("dueDate", "Due date", "date")}
                <label className="ws-field">
                  Currency
                  <input value="USD — US Dollar" readOnly />
                </label>
              </div>
            </section>
            <section className="ws-panel ws-editor-section">
              <div className="ws-section-title">
                <span>02</span>
                <h2>Invoice line items</h2>
              </div>
              <div className="ws-line-items">
                {draft.items.map((item, i) => (
                  <div className="ws-line-item" key={i}>
                    <label className="ws-field ws-item-description">
                      Item {i + 1}
                      <input
                        required
                        placeholder="e.g. Brand identity design"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(i, "description", e.target.value)
                        }
                      />
                    </label>
                    <label className="ws-field">
                      Qty
                      <input
                        required
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(i, "quantity", e.target.value)
                        }
                      />
                    </label>
                    <label className="ws-field">
                      Rate ($)
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(i, "rate", e.target.value)}
                      />
                    </label>
                    <button
                      className="ws-icon-button"
                      type="button"
                      aria-label={"Remove item " + (i + 1)}
                      disabled={draft.items.length === 1}
                      onClick={() =>
                        update(
                          "items",
                          draft.items.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="ws-text-link ws-add-item"
                type="button"
                onClick={() =>
                  update("items", [
                    ...draft.items,
                    { description: "", quantity: 1, rate: 0 },
                  ])
                }
              >
                <Plus size={16} />
                Add a line item
              </button>
              <div className="ws-editor-totals">
                <label className="ws-field">
                  Tax (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={draft.tax}
                    onChange={(e) => update("tax", e.target.value)}
                  />
                </label>
                <div>
                  <span>
                    Subtotal <strong>{money(subtotal)}</strong>
                  </span>
                  <span>
                    Tax <strong>{money(tax)}</strong>
                  </span>
                  <span className="total">
                    Total <strong>{money(total)}</strong>
                  </span>
                </div>
              </div>
            </section>
            <section className="ws-panel ws-editor-section">
              <div className="ws-section-title">
                <span>03</span>
                <h2>Notes and payment terms</h2>
              </div>
              <label className="ws-field">
                Note to your client
                <textarea
                  rows={3}
                  value={draft.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </label>
              <label className="ws-field" style={{ marginTop: 18 }}>
                Payment terms
                <textarea
                  rows={2}
                  placeholder="Optional payment terms"
                  value={draft.terms || ""}
                  onChange={(e) => update("terms", e.target.value)}
                />
              </label>
              <div
                className="ws-logo-upload"
                style={{ marginTop: 20, paddingBottom: 0, borderBottom: 0 }}
              >
                {draft.logo && <img src={draft.logo} alt="Invoice logo" />}
                <label className="ws-button">
                  Upload logo
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={uploadLogo}
                  />
                </label>
                {draft.logo && (
                  <button
                    className="ws-icon-button"
                    type="button"
                    aria-label="Remove invoice logo"
                    onClick={() => update("logo", "")}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <span className="ws-field-label">Invoice style</span>
              <div className="ws-theme-options">
                {themes.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    aria-pressed={draft.theme === t.id}
                    className={draft.theme === t.id ? "active" : ""}
                    onClick={() => update("theme", t.id)}
                  >
                    <span style={{ background: t.color }} />
                    {t.name}
                    {draft.theme === t.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </section>
          </fieldset>
        </form>
        <div className="ws-preview-column">
          <div className="ws-preview-label">
            <span>
              <Eye size={15} /> LIVE PREVIEW
            </span>
            <span>A4 · USD</span>
          </div>
          <div className="ws-preview-stage">
            <div
              ref={preview}
              id="invoice"
              className={"ws-invoice-paper theme-" + draft.theme}
              style={{ "--invoice-accent": theme.color }}
            >
              <div className="ws-paper-top">
                <div>
                  {draft.logo ? (
                    <img
                      className="ws-paper-logo"
                      src={draft.logo}
                      alt="Business logo"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="ws-paper-monogram">
                      {(draft.companyName || "P")[0].toUpperCase()}
                    </span>
                  )}
                  <h2>{draft.companyName || "Your business"}</h2>
                  <p>{draft.companyAddress || "hello@yourbusiness.com"}</p>
                </div>
                <div>
                  <h1>INVOICE</h1>
                  <p>{draft.invoiceNumber}</p>
                </div>
              </div>
              <div className="ws-paper-billing">
                <div>
                  <span>BILL TO</span>
                  <h3>{draft.clientName || "Your client"}</h3>
                  <p>{draft.clientAddress || "client@company.com"}</p>
                  {draft.clientBillingAddress && (
                    <p style={{ whiteSpace: "pre-line" }}>
                      {draft.clientBillingAddress}
                    </p>
                  )}
                </div>
                <div>
                  <span>ISSUED</span>
                  <p>{dateLabel(draft.invoiceDate)}</p>
                  <span>DUE DATE</span>
                  <p>{dateLabel(draft.dueDate)}</p>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description || "Your service or product"}</td>
                      <td>{item.quantity || 0}</td>
                      <td>{money(item.rate)}</td>
                      <td>
                        {money(Number(item.quantity) * Number(item.rate))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="ws-paper-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <div>
                  <span>Tax ({draft.tax || 0}%)</span>
                  <strong>{money(tax)}</strong>
                </div>
                <div className="grand-total">
                  <span>Total due</span>
                  <strong>
                    {money(total)}
                    <small> USD</small>
                  </strong>
                </div>
              </div>
              <div className="ws-paper-note">
                <span>A NOTE FOR YOU</span>
                <p>{draft.notes}</p>
                {draft.terms && <p style={{ marginTop: 12 }}>{draft.terms}</p>}
              </div>
              <div className="ws-paper-footer">
                <span>Made with Proforma</span>
                <span>Thank you for your business.</span>
              </div>
            </div>
          </div>
          <p className="ws-preview-hint">
            <ShieldNote /> Ready for your client. Designed to make an
            impression.
          </p>
        </div>
      </div>
      <Modal
        open={sendOpen}
        onClose={() => {
          if (!busy) setSendOpen(false);
        }}
        title={sent ? "Invoice sent." : "Ready to send?"}
      >
        <div className="ws-detail">
          {sent ? (
            <>
              <div className="ws-send-success">
                <Check size={32} />
              </div>
              <p>
                Your invoice has been sent to{" "}
                <strong>{draft.clientAddress}</strong>.
              </p>
              <Link className="ws-button ws-primary" to="/dashboard/invoices">
                Back to invoices
              </Link>
            </>
          ) : !connections?.paypal ? (
            <>
              <p>
                Connect your PayPal account before sending an invoice with a
                payment link.
              </p>
              <Link
                className="ws-button ws-primary"
                to="/dashboard/settings?tab=connections"
              >
                Connect PayPal
              </Link>
              <p className="ws-small-note">
                You can still download your invoice as a PDF.
              </p>
            </>
          ) : (
            <>
              <p>
                Your client will receive a PDF invoice and a PayPal payment
                link.
              </p>
              <dl>
                <div>
                  <dt>Recipient</dt>
                  <dd>{draft.clientAddress}</dd>
                </div>
                <div>
                  <dt>Invoice</dt>
                  <dd>{draft.invoiceNumber}</dd>
                </div>
                <div>
                  <dt>Total due</dt>
                  <dd>{money(total)} USD</dd>
                </div>
              </dl>
              <button
                className="ws-button ws-primary"
                onClick={send}
                disabled={!!busy}
              >
                {busy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {busy
                  ? busy + "…"
                  : serverDraft.locked
                    ? "Retry / check delivery"
                    : "Send invoice"}
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
function ShieldNote() {
  return <Check size={13} />;
}
