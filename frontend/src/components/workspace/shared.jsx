import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Modal from "../ui/Modal";
import { API_BASE_URL } from "../../lib/api";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
export const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
export const dateLabel = (value) =>
  value && !Number.isNaN(new Date(value).getTime())
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "P";

export function useResource(path, params = {}) {
  const userId = useAuthStore((s) => s.user?._id);
  const key = JSON.stringify(params);
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    if (!userId) return;
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    api
      .get(path, {
        params: { userId, ...JSON.parse(key) },
        signal: controller.signal,
      })
      .then(({ data }) => setState({ data, loading: false, error: "" }))
      .catch((error) => {
        if (!axios.isCancel(error))
          setState({
            data: null,
            loading: false,
            error: "We couldn’t load this information. Please try again.",
          });
      });
    return () => controller.abort();
  }, [path, key, userId, version]);
  return { ...state, reload };
}
export function PageHeading({
  eyebrow = "YOUR WORKSPACE",
  title,
  description,
  children,
}) {
  return (
    <div className="ws-page-heading">
      <div>
        <span className="ws-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="ws-heading-actions">{children}</div>
    </div>
  );
}
export function CreateButton() {
  return (
    <Link className="ws-button ws-primary" to="/dashboard/invoices/new">
      <Plus size={17} /> Create invoice
    </Link>
  );
}
export function Status({ status }) {
  const labels = {
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
    cancelled: "Cancelled",
    payment_failed: "Failed",
    draft: "Draft",
  };
  return (
    <span className={"ws-status ws-status-" + status}>
      <i />
      {labels[status] || status}
    </span>
  );
}
export function Empty({
  title = "No invoices yet.",
  description = "Your invoices will appear here once you send your first one.",
  action = true,
  icon: Icon = FileText,
}) {
  return (
    <div className="ws-empty">
      <div className="ws-empty-icon">
        <Icon size={25} strokeWidth={1.4} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <CreateButton />}
    </div>
  );
}
export function Loading() {
  return (
    <div className="ws-loading" role="status" aria-label="Loading">
      <div />
      <div />
      <div />
      <span className="sr-only">Loading your workspace…</span>
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div className="ws-error" role="alert">
      <p>{message}</p>
      <button className="ws-button" onClick={onRetry}>
        <RefreshCw size={15} /> Try again
      </button>
    </div>
  );
}
export function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="ws-search">
      <Search size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}
export function InvoiceTable({ invoices, onSelect, compact = false }) {
  return (
    <div className="ws-table-scroll">
      <table className="ws-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Client</th>
            {!compact && <th>Issued</th>}
            <th>Amount</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice._id}>
              <td className="ws-table-number">
                <button
                  className="ws-invoice-link"
                  onClick={() => onSelect(invoice)}
                >
                  <span className="ws-file-icon">
                    <FileText size={16} />
                  </span>
                  {invoice.invoiceNumber || "Invoice"}
                </button>
              </td>
              <td className="ws-table-client">
                <div className="ws-client-cell">
                  <span className="ws-avatar">
                    {initials(invoice.clientName)}
                  </span>
                  <span>
                    <strong>{invoice.clientName}</strong>
                    <small>{invoice.clientAddress}</small>
                  </span>
                </div>
              </td>
              {!compact && (
                <td className="ws-muted ws-table-date">
                  {dateLabel(invoice.invoiceDate)}
                </td>
              )}
              <td className="ws-money">{money(invoice.amountNumeric)}</td>
              <td className="ws-table-status">
                <Status status={invoice.status} />
              </td>
              <td className="ws-table-action">
                <button
                  className="ws-icon-button"
                  onClick={() => onSelect(invoice)}
                  aria-label={"View invoice " + invoice.invoiceNumber}
                >
                  <ArrowRight size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InvoiceDetails({ invoice, onClose, onDeleted }) {
  const userId = useAuthStore((s) => s.user?._id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => setConfirmDelete(false), [invoice?._id]);
  const remove = async () => {
    setDeleting(true);
    try {
      await api.delete("/api/invoice/invoices/" + invoice._id, {
        params: { userId },
      });
      toast.success("Invoice deleted.");
      onDeleted?.();
      onClose();
    } catch {
      toast.error("Could not delete this invoice. Please try again.");
    } finally {
      setDeleting(false);
    }
  };
  const safeUrl =
    invoice?.invoiceUrl && /^https?:\/\//i.test(invoice.invoiceUrl)
      ? invoice.invoiceUrl
      : null;
  return (
    <Modal
      open={!!invoice}
      onClose={() => {
        if (!deleting) onClose();
      }}
      title={confirmDelete ? "Delete this invoice?" : "Invoice details"}
      maxWidth="max-w-xl"
    >
      {invoice &&
        (confirmDelete ? (
          <div className="ws-detail">
            <p>
              This removes invoice <strong>{invoice.invoiceNumber}</strong> from
              your workspace. This cannot be undone and does not reverse a
              payment.
            </p>
            <div className="ws-form-footer">
              <button
                className="ws-button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Keep invoice
              </button>
              <button
                className="ws-button ws-danger"
                onClick={remove}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete invoice"}
              </button>
            </div>
          </div>
        ) : (
          <div className="ws-detail">
            <div className="ws-detail-top">
              <span className="ws-file-icon">
                <FileText size={24} />
              </span>
              <Status status={invoice.status} />
            </div>
            <h3>{invoice.invoiceNumber}</h3>
            <div className="ws-detail-amount">
              {money(invoice.amountNumeric)} <small>USD</small>
            </div>
            <dl>
              {invoice.deliveryStatus && (
                <div>
                  <dt>Email delivery</dt>
                  <dd>
                    {invoice.deliveryStatus === "sent"
                      ? "Accepted by mail server"
                      : invoice.deliveryStatus}
                  </dd>
                </div>
              )}
              <div>
                <dt>Billed to</dt>
                <dd>
                  {invoice.clientName}
                  <small>{invoice.clientAddress}</small>
                </dd>
              </div>
              <div>
                <dt>Issue date</dt>
                <dd>{dateLabel(invoice.invoiceDate)}</dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>{dateLabel(invoice.dueDate)}</dd>
              </div>
              {invoice.paidAt && (
                <div>
                  <dt>Paid on</dt>
                  <dd>{dateLabel(invoice.paidAt)}</dd>
                </div>
              )}
              <div>
                <dt>Description</dt>
                <dd>{invoice.description || "No description provided"}</dd>
              </div>
            </dl>
            <div className="ws-detail-actions">
              {invoice.structuredData && (
                <Link
                  className="ws-button"
                  to={`/dashboard/invoices/new?draft=${invoice._id}`}
                >
                  View saved invoice / delivery
                </Link>
              )}
              {safeUrl && (
                <a
                  className="ws-button ws-primary"
                  href={safeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open invoice PDF <ArrowRight size={16} />
                </a>
              )}
              {!invoice.structuredData && (
                <button
                  className="ws-button ws-danger"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={14} />
                  Delete invoice
                </button>
              )}
            </div>
          </div>
        ))}
    </Modal>
  );
}
