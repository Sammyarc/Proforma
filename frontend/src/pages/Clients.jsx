import { useState } from "react";
import {
  ArrowUpRight,
  Mail,
  Users,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../components/ui/Modal";
import {
  api,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
  SearchField,
  dateLabel,
  initials,
  useResource,
  money,
  Status,
  InvoiceDetails,
} from "../components/workspace/shared";
const blank = {
  name: "",
  email: "",
  company: "",
  phone: "",
  billingAddress: "",
  notes: "",
};
export default function Clients() {
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false),
    [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource("/api/clients", {
    search,
    archived,
    page,
  });
  const [editing, setEditing] = useState(null),
    [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false),
    [formError, setFormError] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null),
    [history, setHistory] = useState(null);
  const openEditor = (client = {}) => {
    setEditing(client);
    setForm({ ...blank, ...client });
    setFormError("");
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing._id) await api.patch(`/api/clients/${editing._id}`, form);
      else await api.post("/api/clients", form);
      toast.success(editing._id ? "Client updated." : "Client added.");
      setEditing(null);
      reload();
    } catch (e) {
      setFormError(
        e.response?.data?.error ||
          "Could not save this client. Your edits are still here.",
      );
    } finally {
      setSaving(false);
    }
  };
  const archive = async () => {
    setSaving(true);
    setFormError("");
    try {
      await api.patch(`/api/clients/${archiveTarget._id}`, {
        archived: !archiveTarget.archived,
        revision: archiveTarget.revision,
      });
      toast.success(
        archiveTarget.archived ? "Client restored." : "Client archived.",
      );
      setArchiveTarget(null);
      reload();
    } catch (e) {
      setFormError(e.response?.data?.error || "Could not update this client.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="YOUR CLIENT DIRECTORY"
        title="Your clients"
        description="Keep billing details together, follow invoice history, and start your next invoice in a click."
      >
        <button className="ws-button ws-primary" onClick={() => openEditor()}>
          <Plus size={16} /> Add client
        </button>
      </PageHeading>
      <div className="ws-client-toolbar">
        <h2>
          {archived ? "Archived clients" : "Active clients"}{" "}
          <span className="ws-count">{data?.pagination?.total || 0}</span>
        </h2>
        <div>
          <SearchField
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Find name, email or company…"
          />
          <select
            aria-label="Client status"
            value={String(archived)}
            onChange={(e) => {
              setArchived(e.target.value === "true");
              setPage(1);
            }}
          >
            <option value="false">Active</option>
            <option value="true">Archived</option>
          </select>
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data?.clients?.length ? (
        <div className="ws-client-grid">
          {data.clients.map((client, i) => (
            <article className="ws-client-card" key={client._id}>
              <div className="ws-client-card-top">
                <span className={`ws-avatar ws-avatar-large tone-${i % 4}`}>
                  {initials(client.name)}
                </span>
                <button
                  className="ws-icon-button"
                  aria-label={`Edit ${client.name}`}
                  onClick={() => openEditor(client)}
                >
                  <Pencil size={16} />
                </button>
              </div>
              <h2>{client.name}</h2>
              {client.company && <p>{client.company}</p>}
              <a className="ws-client-email" href={`mailto:${client.email}`}>
                <Mail size={14} />
                {client.email}
              </a>
              <div className="ws-client-card-bottom">
                <button
                  className="ws-button"
                  onClick={() => setHistory(client)}
                >
                  Invoice history
                </button>
                {!client.archived && (
                  <Link
                    className="ws-icon-button"
                    aria-label={`Create invoice for ${client.name}`}
                    to={`/dashboard/invoices/new?${new URLSearchParams({ clientId: client._id, client: client.name, email: client.email, address: client.billingAddress || "" })}`}
                  >
                    <ArrowUpRight size={19} />
                  </Link>
                )}
                <button
                  className="ws-icon-button"
                  aria-label={`${client.archived ? "Restore" : "Archive"} ${client.name}`}
                  onClick={() => {
                    setArchiveTarget(client);
                    setFormError("");
                  }}
                >
                  {client.archived ? (
                    <RotateCcw size={16} />
                  ) : (
                    <Archive size={16} />
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="ws-panel">
          <Empty
            action={false}
            icon={Users}
            title={
              search
                ? "No matching clients."
                : archived
                  ? "No archived clients."
                  : "Your next client starts here."
            }
            description={
              search
                ? "Try another name, email or company."
                : archived
                  ? "Archived clients stay available with their billing history."
                  : "Add a client before creating an invoice. To view older invoice history, use the same billing email."
            }
          />
        </section>
      )}
      <Pager page={page} pagination={data?.pagination} setPage={setPage} />
      <Modal
        open={editing !== null}
        onClose={() => {
          if (!saving) setEditing(null);
        }}
        title={editing?._id ? "Edit client" : "Add client"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={save}>
          <div className="ws-form-grid">
            {Object.entries({
              name: "Client name",
              email: "Billing email",
              company: "Company (optional)",
              phone: "Phone (optional)",
            }).map(([key, label]) => (
              <label className="ws-field" key={key}>
                <span>{label}</span>
                <input
                  required={["name", "email"].includes(key)}
                  maxLength={
                    { name: 200, email: 254, company: 200, phone: 50 }[key]
                  }
                  type={
                    key === "email" ? "email" : key === "phone" ? "tel" : "text"
                  }
                  value={form[key]}
                  disabled={saving}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          {[
            ["billingAddress", "Billing address (optional)", 1000],
            ["notes", "Private notes (optional)", 4000],
          ].map(([key, label, maxLength]) => (
            <label className="ws-field" key={key}>
              <span>{label}</span>
              <textarea
                rows={3}
                maxLength={maxLength}
                value={form[key]}
                disabled={saving}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <p>
            Client updates apply to future invoices. Existing invoice details
            stay unchanged.
          </p>
          {formError && <p role="alert">{formError}</p>}
          <div className="ws-form-footer">
            <button
              type="button"
              className="ws-button"
              disabled={saving}
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button className="ws-button ws-primary" disabled={saving}>
              {saving ? "Saving…" : "Save client"}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!archiveTarget}
        onClose={() => {
          if (!saving) setArchiveTarget(null);
        }}
        title={archiveTarget?.archived ? "Restore client?" : "Archive client?"}
      >
        <p>
          {archiveTarget?.archived
            ? "This client will be available for new invoices again."
            : "This hides the client from active clients and new invoices. Invoice history stays available, and you can restore the client anytime."}
        </p>
        {formError && <p role="alert">{formError}</p>}
        <div className="ws-form-footer">
          <button
            className="ws-button"
            disabled={saving}
            onClick={() => setArchiveTarget(null)}
          >
            Cancel
          </button>
          <button
            className="ws-button ws-primary"
            disabled={saving}
            onClick={archive}
          >
            {saving
              ? "Updating…"
              : archiveTarget?.archived
                ? "Restore client"
                : "Archive client"}
          </button>
        </div>
      </Modal>
      {history && <History client={history} onClose={() => setHistory(null)} />}
    </>
  );
}
function Pager({ page, pagination, setPage }) {
  if (!pagination || (pagination.pages <= 1 && page === 1)) return null;
  return (
    <div className="ws-form-footer">
      <button
        className="ws-button"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </button>
      <span>
        Page {page} of {Math.max(page, pagination.pages)}
      </span>
      <button
        className="ws-button"
        disabled={page >= pagination.pages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
function History({ client, onClose }) {
  const [page, setPage] = useState(1),
    [invoice, setInvoice] = useState(null);
  const { data, loading, error, reload } = useResource(
    `/api/clients/${client._id}/invoices`,
    { page },
  );
  return (
    <>
      <Modal
        open={!invoice}
        onClose={onClose}
        title={`${client.name} · Invoice history`}
        maxWidth="max-w-2xl"
      >
        <p>
          Older invoices without a saved client link are matched by the current
          billing email.
        </p>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data?.invoices?.length ? (
          <div className="ws-client-history">
            {data.invoices.map((item) => (
              <button
                className="ws-button"
                key={item._id}
                onClick={() => setInvoice(item)}
              >
                <span>
                  {item.invoiceNumber}
                  <small>{dateLabel(item.invoiceDate)}</small>
                </span>
                <span>{money(item.amountNumeric)}</span>
                <Status status={item.status} />
              </button>
            ))}
          </div>
        ) : (
          <Empty
            action={false}
            title="No invoices yet."
            description="Invoices linked to this client will appear here."
          />
        )}
        <Pager page={page} pagination={data?.pagination} setPage={setPage} />
      </Modal>
      <InvoiceDetails
        invoice={invoice}
        onClose={() => setInvoice(null)}
        onDeleted={reload}
      />
    </>
  );
}
