import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import {
  CreateButton,
  Empty,
  ErrorState,
  InvoiceDetails,
  InvoiceTable,
  Loading,
  PageHeading,
  money,
  useResource,
} from "../components/workspace/shared";

function RevenueChart({ values, period }) {
  const [hovered, setHovered] = useState(null);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const end = new Date().getMonth() + 1;
  const start = period === "6" ? Math.max(0, end - 6) : 0;
  const data = values.slice(start, period === "6" ? end : 12);
  const labels = months.slice(start, period === "6" ? end : 12);
  const max = Math.max(...data, 100);
  return (
    <div className="ws-chart" aria-label="Monthly collected revenue">
      <div className="ws-chart-scale">
        {[1, 0.75, 0.5, 0.25, 0].map((n) => (
          <span key={n}>{money(max * n).replace(".00", "")}</span>
        ))}
      </div>
      <div className="ws-chart-plot">
        <div className="ws-chart-grid">
          {[0, 1, 2, 3, 4].map((n) => (
            <i key={n} />
          ))}
        </div>
        <div className="ws-bars">
          {data.map((value, i) => (
            <div className="ws-bar-column" key={labels[i]}>
              <button
                aria-label={labels[i] + " revenue: " + money(value)}
                className={"ws-bar " + (i === end - start - 1 ? "current" : "")}
                style={{ height: Math.max((value / max) * 100, 1.5) + "%" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
              >
                {hovered === i && (
                  <span className="ws-chart-tooltip">
                    {labels[i]} · {money(value)}
                  </span>
                )}
              </button>
              <span className="ws-bar-label">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default function Overview() {
  const { user, connections } = useAuthStore();
  const stats = useResource("/api/invoice/invoices/stats/overview");
  const summary = useResource("/api/invoice/invoices/stats/summary");
  const recent = useResource("/api/invoice/invoices", { limit: 5 });
  const [period, setPeriod] = useState("12");
  const [selected, setSelected] = useState(null);
  const data = stats.data;
  const revenue = summary.data?.monthlyData?.revenue || Array(12).fill(0);
  const total = revenue
    .slice(
      period === "6" ? Math.max(0, new Date().getMonth() - 5) : 0,
      period === "6" ? new Date().getMonth() + 1 : 12,
    )
    .reduce((a, b) => a + b, 0);
  const cards = [
    {
      label: "Total collected",
      value: money(data?.completedPayments?.amount),
      icon: ArrowDownLeft,
      note: (data?.completedPayments?.count || 0) + " paid invoices",
      tone: "green",
    },
    {
      label: "Outstanding",
      value: money(data?.pendingPayments?.amount),
      icon: Clock3,
      note: (data?.pendingPayments?.count || 0) + " awaiting payment",
      tone: "amber",
    },
    {
      label: "Invoices created",
      value: String(data?.totalInvoices || 0).padStart(2, "0"),
      icon: FileText,
      note: "Across your workspace",
      tone: "neutral",
    },
    {
      label: "Failed payments",
      value: money(data?.failedPayments?.amount),
      icon: CircleDollarSign,
      note: (data?.failedPayments?.count || 0) + " need attention",
      tone: "rose",
    },
  ];
  return (
    <>
      <section className="ws-welcome">
        <img src="/images/studio.webp" alt="" className="ws-welcome-photo" />
        <PageHeading
          eyebrow="YOUR INVOICE DASHBOARD"
          title={
            "Welcome back" +
            (user?.name ? ", " + user.name.split(" ")[0] : "") +
            "."
          }
          description="Review sent invoices, payments received, and outstanding balances."
        >
          <CreateButton />
        </PageHeading>
        <div className="ws-welcome-caption">
          <span>
            <Check size={14} /> Invoices, clients, and payments in one place.
          </span>
          <span>PROFORMA / INVOICE OVERVIEW</span>
        </div>
      </section>
      {stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="ws-stat-grid">
          {cards.map(({ label, value, icon: Icon, note, tone }) => (
            <article className={"ws-stat-card " + tone} key={label}>
              <div>
                <span>{label}</span>
                <Icon size={18} strokeWidth={1.6} />
              </div>
              <strong>
                {stats.loading ? (
                  <span className="ws-skeleton-number" />
                ) : (
                  value
                )}
              </strong>
              <small>{note}</small>
            </article>
          ))}
        </div>
      )}
      <div className="ws-overview-grid">
        <section className="ws-panel ws-revenue">
          <div className="ws-panel-heading">
            <div>
              <h2>Revenue overview</h2>
              <p>Payments received by month for the selected period.</p>
            </div>
            <select
              aria-label="Revenue time period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="12">This year</option>
              <option value="6">Last 6 months</option>
            </select>
          </div>
          {summary.error ? (
            <ErrorState message={summary.error} onRetry={summary.reload} />
          ) : summary.loading ? (
            <Loading />
          ) : (
            <>
              <div className="ws-revenue-total">
                {money(total)}
                <span>
                  <i />
                  Collected in {new Date().getFullYear()}
                </span>
              </div>
              <RevenueChart values={revenue} period={period} />
            </>
          )}
        </section>
        <aside className="ws-next-card">
          <span className="ws-eyebrow">KEEP THINGS MOVING</span>
          <div className="ws-next-art" aria-hidden="true">
            <div className="ws-art-paper">
              <span />
              <span />
              <span />
              <div>
                <i />
                <i />
                <i />
              </div>
              <b>
                <Check size={19} />
              </b>
            </div>
            <span className="ws-art-spark">✦</span>
          </div>
          <h2>
            Ready to send
            <br />
            <em>your next invoice?</em>
          </h2>
          <p>
            Add your client, line items, and payment terms to create an invoice.
          </p>
          <Link to="/dashboard/invoices/new">
            Create an invoice <ArrowUpRight size={18} />
          </Link>
          <div className="ws-setup-item">
            <span className={connections?.paypal ? "complete" : ""}>
              {connections?.paypal ? <Check size={13} /> : "1"}
            </span>
            <Link to="/dashboard/settings?tab=connections">
              {connections?.paypal
                ? "Payment account connected"
                : "Connect your payment account"}
            </Link>
            <ChevronRight size={14} />
          </div>
        </aside>
      </div>
      <section className="ws-panel">
        <div className="ws-panel-heading">
          <div>
            <h2>
              Recent invoices{" "}
              <span className="ws-count">{data?.totalInvoices || 0}</span>
            </h2>
            <p>Your most recently sent invoices.</p>
          </div>
          <Link className="ws-text-link" to="/dashboard/invoices">
            View all invoices <ArrowRight size={15} />
          </Link>
        </div>
        {recent.loading ? (
          <Loading />
        ) : recent.error ? (
          <ErrorState message={recent.error} onRetry={recent.reload} />
        ) : recent.data?.invoices?.length ? (
          <InvoiceTable
            invoices={recent.data.invoices}
            onSelect={setSelected}
            compact
          />
        ) : (
          <Empty />
        )}
      </section>
      <InvoiceDetails
        onDeleted={() => {
          recent.reload();
          stats.reload();
          summary.reload();
        }}
        invoice={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
