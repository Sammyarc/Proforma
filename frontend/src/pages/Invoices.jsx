import { useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import {
  CreateButton,
  Empty,
  ErrorState,
  InvoiceDetails,
  InvoiceTable,
  Loading,
  PageHeading,
  SearchField,
  useResource,
} from "../components/workspace/shared";

export function InvoiceLibrary({ payments = false }) {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("-1");
  const [selected, setSelected] = useState(null);
  const { data, loading, error, reload } = useResource(
    "/api/invoice/invoices",
    { page, limit: 10, sortOrder, ...(status ? { status } : {}) },
  );
  const rows = (data?.invoices || []).filter((i) =>
    (i.invoiceNumber + " " + i.clientName + " " + i.clientAddress)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow={payments ? "INVOICE PAYMENT TRACKING" : "YOUR INVOICE LIBRARY"}
        title={payments ? "Payments" : "Invoices"}
        description={
          payments
            ? "Filter invoices by payment status and review the amounts due."
            : "Find sent invoices, check their status, and review client details."
        }
      >
        <CreateButton />
      </PageHeading>
      {!payments && <SavedDrafts />}
      <section className="ws-panel ws-library">
        <div className="ws-library-top">
          <div className="ws-tabs" aria-label="Filter by status">
            {[
              ["", "All invoices"],
              ["paid", "Paid"],
              ["pending", "Pending"],
              ["overdue", "Overdue"],
              ["payment_failed", "Failed"],
              ["cancelled", "Cancelled"],
            ].map(([value, label]) => (
              <button
                aria-pressed={status === value}
                className={status === value ? "active" : ""}
                onClick={() => {
                  setStatus(value);
                  setPage(1);
                }}
                key={value}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ws-table-toolbar">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search this page by client or invoice…"
            />
            <label className="ws-sort">
              <SlidersHorizontal size={15} />
              <select
                aria-label="Sort invoices"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
              >
                <option value="-1">Newest first</option>
                <option value="1">Oldest first</option>
              </select>
            </label>
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : rows.length ? (
          <InvoiceTable invoices={rows} onSelect={setSelected} />
        ) : (
          <Empty
            title={
              search || status ? "No matching invoices." : "No invoices yet."
            }
            description={
              search || status
                ? "Try another search or status filter to find your invoice."
                : "Create and send your first invoice to see its details and payment status here."
            }
            action={!search && !status}
          />
        )}
        <div className="ws-pagination">
          <span>
            {data?.pagination?.total || 0} invoices
            {search ? " · Search applies to this page" : " · 10 per page"}
          </span>
          <div>
            <span>
              Page {page} of {Math.max(1, data?.pagination?.pages || 1)}
            </span>
            <button
              className="ws-icon-button"
              aria-label="Previous page"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="ws-icon-button"
              aria-label="Next page"
              disabled={page >= (data?.pagination?.pages || 1) || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <InvoiceDetails
        onDeleted={reload}
        invoice={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
export default function Invoices() {
  return <InvoiceLibrary />;
}

function SavedDrafts() {
  const { data, loading, error, reload } = useResource("/api/drafts");
  return (
    <section className="ws-panel" style={{ marginBottom: 24, padding: 24 }}>
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>Drafts & delivery</h2>
      <p style={{ marginBottom: 16 }}>
        Continue a saved invoice or check a delivery that needs attention.
      </p>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : data?.drafts?.length ? (
        <div style={{ display: "grid", gap: 12 }}>
          {data.drafts.map((draft) => (
            <Link
              className="ws-button"
              style={{
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
              key={draft._id}
              to={`/dashboard/invoices/new?draft=${draft._id}`}
            >
              <span>
                {draft.data.invoiceNumber || "Untitled invoice"} ·{" "}
                {draft.data.clientName || "No client yet"}
              </span>
              <span>
                {draft.lifecycle === "draft"
                  ? "Continue editing"
                  : "Check / retry delivery"}{" "}
                →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p>
          No saved drafts yet. New invoices are saved automatically to your
          workspace.
        </p>
      )}
    </section>
  );
}
