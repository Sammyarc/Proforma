import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import "../../workspace.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ws-auth-layout">
      <header className="ws-auth-header">
        <Link to="/" className="ws-brand" aria-label="Proforma home">
          <img src="/brand/proforma-mark.svg" width="38" height="38" alt="" />
          proforma<span className="ws-brand-dot">.</span>
        </Link>
        <Link to="/" className="ws-auth-back">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </header>
      <aside className="ws-auth-story">
        <img
          className="ws-auth-photo"
          src="/images/studio.webp"
          alt=""
          width="1536"
          height="1024"
        />
        <div className="ws-auth-photo-shade" />
        <div className="ws-auth-story-top">
          <span>
            <i /> INVOICING FOR YOUR BUSINESS
          </span>
          <ArrowUpRight size={21} />
        </div>
        <div className="ws-auth-message">
          <span className="ws-eyebrow">CREATE. SEND. TRACK.</span>
          <h1>
            Your invoices. <br /> Your clients. <br />{" "}
            <em>
              {" "}
              One simple <br /> workspace.{" "}
            </em>
          </h1>
          <p>
            Create branded invoices, email your clients, <br />
            and track payment status from your dashboard.
          </p>
        </div>
        <div className="ws-auth-story-bottom">
          <div className="ws-auth-note">
            <span className="ws-auth-note-icon">
              <Check size={21} />
            </span>
            <div>
              <strong>Online invoicing made simple.</strong>
              <p>Create, send, and track. All in one place.</p>
            </div>
          </div>
          <span className="ws-auth-copyright">
            BUILT FOR FREELANCERS & SMALL BUSINESSES
          </span>
        </div>
      </aside>
      <main className="ws-auth-main">
        <div className="ws-auth-form-wrap">
          <span className="ws-auth-form-kicker">
            <span /> YOUR PROFORMA WORKSPACE
          </span>
          {children}
        </div>
        <p className="ws-auth-footnote">
          Free includes 10 invoice emails per month. No credit card required.
        </p>
      </main>
    </div>
  );
}
