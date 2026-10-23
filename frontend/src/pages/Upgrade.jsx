import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import { api } from "../components/workspace/shared";
import "../workspace.css";
export default function Upgrade() {
  const { user } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const checkout = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/upgrade/flutterwave-checkout", {
        email: user.email,
        name: user.name,
      });
      if (!data.paymentLink || !data.paymentLink.startsWith("https://"))
        throw new Error("Missing payment link");
      window.location.assign(data.paymentLink);
    } catch {
      toast.error("We couldn’t start checkout. Please try again.");
      setBusy(false);
    }
  };
  return (
    <div className="ws-pricing-page">
      <header>
        <Link className="ws-back" to="/dashboard">
          <ArrowLeft size={16} />
          Back to workspace
        </Link>
        <Link className="ws-result-brand" to="/">
          proforma<span>.</span>
        </Link>
      </header>
      <main>
        <span className="ws-eyebrow">PROFORMA INVOICING PLANS</span>
        <h1>
          Send more invoices. <br /> Upgrade to <em>Pro.</em>
        </h1>
        <p>
          Compare invoice email limits and choose the plan that fits your
          business.
        </p>
        <div className="ws-price-grid">
          <section className="ws-price-card">
            <span className="ws-eyebrow">10 INVOICE EMAILS PER MONTH</span>
            <h2>Free</h2>
            <div className="ws-price-amount">
              $0<span> / free plan</span>
            </div>
            <p>
              Create and download invoices, and send up to 10 invoice emails
              each month.
            </p>
            <ul>
              {[
                "10 invoice emails per month",
                "Customizable invoice styles",
                "PDF and image downloads",
                "Client and payment overview",
              ].map((f) => (
                <li key={f}>
                  <Check size={16} />
                  {f}
                </li>
              ))}
            </ul>
            <Link className="ws-button" to="/dashboard">
              {user?.tier === "pro" ? "Back to workspace" : "Your current plan"}
            </Link>
          </section>
          <section className="ws-price-card featured">
            <span className="ws-price-badge">UNLIMITED INVOICE EMAILS</span>
            <span className="ws-eyebrow">FOR YOUR GROWING BUSINESS</span>
            <h2>Pro</h2>
            <div className="ws-price-amount">
              $9<span> / month, billed annually</span>
            </div>
            <p>$108 billed yearly. Unlimited invoice sending.</p>
            <ul>
              {[
                "Everything in Free",
                "Unlimited invoice emails",
                "All available invoice styles",
                "Your full client and payment overview",
              ].map((f) => (
                <li key={f}>
                  <Check size={16} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="ws-button ws-primary"
              disabled={busy || user?.tier === "pro"}
              onClick={checkout}
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowUpRight size={16} />
              )}
              {user?.tier === "pro"
                ? "Your current plan"
                : busy
                  ? "Opening checkout…"
                  : "Upgrade to Pro"}
            </button>
          </section>
        </div>
        <div className="ws-pricing-note">
          <ShieldCheck size={17} /> Checkout handled securely by Flutterwave.
        </div>
      </main>
    </div>
  );
}
