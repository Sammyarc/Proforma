import {
  LayoutDashboard,
  FileText,
  Users,
  ArrowUpRight,
  Plus,
  ArrowRight,
} from "lucide-react";
export function Invoice({ theme }: { theme: string }) {
  return (
    <div className={`lp-invoice lp-invoice-${theme.toLowerCase()}`}>
      <div className="lp-paper-top">
        <span className="lp-studio-mark">a.</span>
        <span>
          INVOICE
          <br />
          <b>INV-024</b>
        </span>
      </div>
      <h3>
        Project invoice.
        <br />
        <em>Ready for payment.</em>
      </h3>
      <div className="lp-invoice-parties">
        <div>
          <small>FROM</small>
          <strong>Atelier Studio</strong>
          <span>hello@atelier.example</span>
        </div>
        <div>
          <small>BILL TO</small>
          <strong>Olive & Co.</strong>
          <span>October 22, 2026</span>
        </div>
      </div>
      <div className="lp-invoice-row lp-invoice-label">
        <span>DESCRIPTION</span>
        <span>AMOUNT</span>
      </div>
      <div className="lp-invoice-row">
        <span>
          Brand identity design<small>Strategy, identity & guidelines</small>
        </span>
        <b>$2,400.00</b>
      </div>
      <div className="lp-invoice-row">
        <span>
          Website art direction<small>Digital design system</small>
        </span>
        <b>$800.00</b>
      </div>
      <div className="lp-invoice-total">
        <span>
          Total due <small>USD</small>
        </span>
        <strong>$3,200.00</strong>
      </div>
      <div className="lp-paper-bottom">
        <span>Thank you for the collaboration.</span>
        <span>Made with proforma.</span>
      </div>
    </div>
  );
}

export function WorkspacePreview() {
  return (
    <div
      className="lp-workspace-preview"
      aria-label="Illustrative Proforma dashboard"
    >
      <aside>
        <div className="lp-preview-brand">
          p<span>proforma.</span>
        </div>
        <span className="lp-preview-nav active">
          <LayoutDashboard size={16} />
          Overview
        </span>
        <span className="lp-preview-nav">
          <FileText size={16} />
          Invoices
        </span>
        <span className="lp-preview-nav">
          <Users size={16} />
          <span>Clients</span>
        </span>
        <span className="lp-preview-nav">
          <ArrowUpRight size={16} />
          <span>Payments</span>
        </span>
        <div className="lp-preview-profile">
          <span>AS</span>
          <div>
            Atelier Studio<small>Personal workspace</small>
          </div>
        </div>
      </aside>
      <div className="lp-preview-content">
        <div className="lp-preview-top">
          <span>YOUR BUSINESS, AT A GLANCE</span>
          <span>Sample workspace</span>
        </div>
        <div className="lp-preview-title">
          <div>
            <h3>Your invoice overview</h3>
            <p>Track sent invoices and payments received.</p>
          </div>
          <span className="lp-preview-new">
            <Plus size={14} /> New invoice
          </span>
        </div>
        <div className="lp-preview-metrics">
          <div>
            <span>Total invoiced</span>
            <strong>
              $12,800<span>.00</span>
            </strong>
            <small>Across 8 invoices</small>
          </div>
          <div>
            <span>Payments received</span>
            <strong>
              $9,600<span>.00</span>
            </strong>
            <small>
              <i /> 6 invoices paid
            </small>
          </div>
          <div>
            <span>Awaiting payment</span>
            <strong>
              $3,200<span>.00</span>
            </strong>
            <small>2 outstanding invoices</small>
          </div>
        </div>
        <div className="lp-preview-table-title">
          <strong>Recent invoices</strong>
          <span>
            View all <ArrowRight size={13} />
          </span>
        </div>
        <div className="lp-preview-table">
          <div className="lp-preview-table-head">
            <span>CLIENT / INVOICE</span>
            <span>AMOUNT</span>
            <span>STATUS</span>
          </div>
          {[
            ["OC", "Olive & Co.", "INV-024", "$3,200.00", "Pending"],
            ["FM", "Forma Magazine", "INV-023", "$2,400.00", "Paid"],
            ["NS", "North Studio", "INV-022", "$1,800.00", "Paid"],
          ].map(([initial, name, id, amount, status]) => (
            <div key={id}>
              <span className="lp-preview-client">
                <i>{initial}</i>
                <span>
                  <b>{name}</b>
                  <small>{id}</small>
                </span>
              </span>
              <strong>{amount}</strong>
              <span>
                <span className={`lp-status ${status.toLowerCase()}`}>
                  <i />
                  {status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
