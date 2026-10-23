import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Check,
  Menu,
  X,
  FileText,
  Send,
  Download,
  Plus,
  Minus,
  CircleCheck,
  Paperclip,
  Sparkles,
  Asterisk,
  SlidersHorizontal,
  MousePointer2,
  Wallet,
  Users,
} from "lucide-react";
import {
  Invoice,
  WorkspacePreview,
} from "../components/landing/ProductPreview";
import "../components/landing/preview.css";
import "../landing.css";
import MobileMenu from "../components/landing/MobileMenu";

const start = "/signup?mode=register";
const demoSteps = [
  {
    title: "Create an invoice.",
    caption: "Add your logo, items, and client details.",
    icon: FileText,
  },
  {
    title: "Email your client.",
    caption: "Send an invoice with a PayPal payment link.",
    icon: Send,
  },
  {
    title: "Track payments.",
    caption: "See paid, pending, and overdue invoices.",
    icon: Wallet,
  },
];
const questions = [
  [
    "What is included in the free plan?",
    "Your free workspace includes customizable invoice styles, PDF and image downloads, client and payment overviews, and 10 invoice emails per month. No credit card is required to get started.",
  ],
  [
    "How do my clients pay?",
    "Connect your PayPal account in Settings to include a payment link when you email an invoice. Follow the payment status from your workspace.",
  ],
  [
    "Can I use my own branding?",
    "Absolutely. Add your logo, choose a style, and customize line items, tax, notes, and payment terms. Your live preview updates as you work.",
  ],
  [
    "Can I download my invoices?",
    "Yes. Download a finished invoice as a PDF, PNG, or JPG. You can also save drafts to your workspace and continue from another device.",
  ],
  [
    "Which currencies are supported?",
    "The current invoice editor uses US dollars (USD).",
  ],
  [
    "How does Pro billing work?",
    "Pro is $108 billed annually, equivalent to $9 per month, and includes unlimited invoice emails. Start free and upgrade from your workspace when you need to send more invoice emails.",
  ],
];
function Brand() {
  return (
    <Link to="/" className="pf-brand" aria-label="Proforma home">
      <img
        className="pf-logo-mark"
        src="/brand/proforma-mark.svg"
        width="40"
        height="40"
        alt=""
      />
      proforma<span className="pf-brand-period">.</span>
    </Link>
  );
}
function DemoEmail() {
  return (
    <div className="pf-email">
      <div className="pf-window-bar">
        <span>
          <i />
          <i />
          <i />
        </span>
        <span>Invoice delivery preview</span>
        <Send size={15} />
      </div>
      <div className="pf-email-body">
        <span className="pf-label">READY FOR THEIR INBOX</span>
        <h3>
          Your invoice. <br />
          Ready to send.
        </h3>
        <div className="pf-mail-line">
          <span>To</span>
          <b>Olive & Co.</b>
        </div>
        <div className="pf-mail-line">
          <span>Subject</span>
          <b>Your invoice from Atelier Studio</b>
        </div>
        <p>
          Hi Olive team,
          <br />
          <br />
          It's been a pleasure bringing your brand to life. Your invoice is
          attached below.
          <br />
          <br />
          Thank you for the collaboration.
        </p>
        <div className="pf-attachment">
          <span>
            <FileText size={22} />
          </span>
          <div>
            Invoice-024.pdf<small>Brand identity & art direction</small>
          </div>
          <Paperclip size={16} />
        </div>
        <div className="pf-email-payment">
          <span>Amount due</span>
          <b>$3,200.00</b>
        </div>
        <div className="pf-pay-label">
          PayPal payment link included <ArrowUpRight size={15} />
        </div>
      </div>
    </div>
  );
}
function DemoPayments() {
  return (
    <div className="pf-payment-demo">
      <div className="pf-window-bar">
        <span>
          <i />
          <i />
          <i />
        </span>
        <span>Payment overview preview</span>
        <Wallet size={16} />
      </div>
      <div className="pf-payment-body">
        <span className="pf-label">PAYMENT TRACKING</span>
        <h3>Invoice payments at a glance.</h3>
        <div className="pf-payment-total">
          <span>Payments received</span>
          <strong>
            $9,600<span>.00</span>
          </strong>
          <small>
            <CircleCheck size={13} /> 6 paid invoices
          </small>
        </div>
        <div className="pf-chart" aria-label="Illustrative payment chart">
          {[32, 48, 38, 67, 55, 92].map((height, i) => (
            <div key={i}>
              <span style={{ height: `${height}%` }} />
              <small>{["May", "Jun", "Jul", "Aug", "Sep", "Oct"][i]}</small>
            </div>
          ))}
        </div>
        <div className="pf-payment-row">
          <span>
            <i>FM</i>Forma Magazine
          </span>
          <b>$2,400.00</b>
          <small>Paid</small>
        </div>
        <div className="pf-payment-row">
          <span>
            <i>NS</i>North Studio
          </span>
          <b>$1,800.00</b>
          <small>Paid</small>
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demo, setDemo] = useState(0);
  const [theme, setTheme] = useState("Studio");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const closeMenu = () => setMenuOpen(false);
  const tabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % 3;
    else if (e.key === "ArrowLeft") next = (index + 2) % 3;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 2;
    else return;
    e.preventDefault();
    setDemo(next);
    document.getElementById(`demo-tab-${next}`)?.focus();
  };
  return (
    <div className="landing-page pf-page">
      <a className="pf-skip" href="#main">
        Skip to content
      </a>
      <header className="pf-header">
        <nav className="pf-desktop-nav" aria-label="Main navigation">
          <a href="#product">Invoice features</a>
          <a href="#workflow">How it works</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <Brand />
        <div className="pf-header-actions">
          <Link className="pf-login" to="/signup">
            Log in
          </Link>
          <Link className="pf-button pf-button-small" to={start}>
            Start for free{" "}
            <span>
              <ArrowUpRight size={16} />
            </span>
          </Link>
          <button
            ref={menuRef}
            className="pf-menu-button"
            aria-expanded={menuOpen}
            aria-controls="pf-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeMenu();
            }}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} triggerRef={menuRef} />
      <main id="main" tabIndex={-1}>
        <section className="pf-hero" aria-labelledby="pf-hero-title">
          <div className="pf-hero-meta">
            <span className="pf-label">
              <i /> INVOICING FOR FREELANCERS & SMALL BUSINESSES
            </span>
            <span>
              Create. Send. Track. <ArrowUpRight size={13} />
            </span>
          </div>
          <div className="pf-hero-intro">
            <h1 id="pf-hero-title">
              Online invoices.
              <br />
              <span>Made simple.</span>
              <Asterisk className="pf-hero-star" aria-hidden="true" />
            </h1>
            <div className="pf-hero-copy">
              <p>
                From your first invoice <br /> to your next payment.
              </p>
              <span>
                Proforma is a free invoice generator for freelancers and small
                businesses. Create branded invoices, download PDFs, email
                clients, and track payment status in one place.
              </span>
              <Link to={start} className="pf-button">
                Create your first invoice{" "}
                <span>
                  <ArrowUpRight size={18} />
                </span>
              </Link>
              <small>
                <Check size={13} /> Free to start. No credit card needed.
              </small>
            </div>
          </div>
          <div className="pf-scene">
            <img
              src="/images/studio.webp"
              srcSet="/images/studio-mobile.webp 768w, /images/studio.webp 1536w"
              sizes="100vw"
              width="1536"
              height="1024"
              fetchPriority="high"
              alt="A sunlit creative studio with a walnut desk and views of olive trees"
            />
            <div className="pf-scene-shade" />
            <div className="pf-scene-top">
              <span>
                <i /> CREATE, SEND, AND TRACK INVOICES
              </span>
              <span>PROFORMA / YOUR INVOICE WORKSPACE</span>
            </div>
            <div className="pf-scene-story">
              <div className="pf-scene-orbit">
                <Asterisk size={42} strokeWidth={1.2} />
              </div>
              <h2>
                Your invoices. <br /> From draft to <br /> <em>payment.</em>
              </h2>
              <p>
                Customize your invoice. <br />
                Send it directly to your client.
              </p>
              <a
                href="#product"
                className="pf-circle-link"
                aria-label="Explore the workspace"
              >
                <ArrowDown size={21} />
              </a>
            </div>
            <div className="pf-demo-wrap">
              <div className="pf-floating-label">
                <CircleCheck size={15} />
                <span>Branded invoices, ready to send.</span>
              </div>
              <div
                id="demo-panel"
                role="tabpanel"
                aria-labelledby={`demo-tab-${demo}`}
                className={`pf-demo-panel pf-demo-panel-${demo}`}
              >
                <div key={demo} className="pf-demo-enter">
                  {demo === 0 ? (
                    <Invoice theme="Studio" />
                  ) : demo === 1 ? (
                    <DemoEmail />
                  ) : (
                    <DemoPayments />
                  )}
                </div>
              </div>
              <span className="pf-sample-label">
                PRODUCT PREVIEW &middot; SAMPLE DATA
              </span>
            </div>
            <div
              className="pf-scene-tabs"
              role="tablist"
              aria-label="Explore the invoice workflow"
            >
              {demoSteps.map((step, i) => (
                <button
                  key={step.title}
                  id={`demo-tab-${i}`}
                  role="tab"
                  aria-selected={demo === i}
                  aria-controls="demo-panel"
                  tabIndex={demo === i ? 0 : -1}
                  onKeyDown={(e) => tabKey(e, i)}
                  onClick={() => setDemo(i)}
                >
                  <span className="pf-tab-index">0{i + 1}</span>
                  <span>
                    {step.title}
                    <small>{step.caption}</small>
                  </span>
                  <step.icon size={20} />
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="pf-belief pf-container" data-reveal>
          <div className="pf-section-kicker">
            <span className="pf-label">
              01 / BUILT FOR INDEPENDENT BUSINESSES
            </span>
            <Asterisk size={22} />
          </div>
          <div className="pf-belief-grid">
            <p className="pf-side-note">
              For the freelancers.
              <br />
              The studio owners.
              <br />
              The small business owners.
            </p>
            <h2>
              Less invoice admin. <br /> Fewer scattered{" "}
              <span className="pf-crossed">spreadsheets.</span> <br /> One place
              to <br /> <em>manage billing.</em>
              <span className="pf-inline-arrow">
                <ArrowUpRight />
              </span>
            </h2>
          </div>
          <div className="pf-belief-bottom">
            <span>YOUR INVOICING WORKSPACE.</span>
            <p>
              Create invoices for your projects and services, keep client
              details together, and review payment status from your dashboard.
              Proforma brings the everyday steps of invoicing into one
              workspace.
            </p>
          </div>
        </section>
        <section id="product" className="pf-workspace">
          <div className="pf-container">
            <div className="pf-section-kicker">
              <span className="pf-label">
                02 / INVOICES, CLIENTS & PAYMENTS
              </span>
              <span className="pf-mini-word">Your billing, in one place.</span>
            </div>
            <div className="pf-section-title" data-reveal>
              <h2>
                Manage invoices. <br /> <span>Track every payment.</span>
              </h2>
              <p>
                View sent invoices, review client history, and see paid and
                outstanding amounts from your invoicing dashboard.
              </p>
            </div>
            <div className="pf-workspace-frame" data-reveal>
              <div className="pf-browser-chrome">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <span>proforma / your workspace</span>
                <span>DEMO VIEW</span>
              </div>
              <WorkspacePreview />
            </div>
            <div className="pf-capabilities">
              {[
                {
                  icon: FileText,
                  title: "Branded invoice templates",
                  text: "Invoices that carry your logo, your style, and your attention to detail.",
                },
                {
                  icon: Users,
                  title: "Client invoice history",
                  text: "Client details and invoice history, together in one clear view.",
                },
                {
                  icon: Wallet,
                  title: "Invoice payment tracking",
                  text: "See paid and outstanding invoices without piecing things together.",
                },
              ].map(({ icon: Icon, title, text }, i) => (
                <div key={title} data-reveal>
                  <span className="pf-capability-icon">
                    <Icon size={22} />
                  </span>
                  <span className="pf-capability-number">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="workflow" className="pf-craft pf-container">
          <div className="pf-section-kicker">
            <span className="pf-label">03 / HOW TO CREATE AN INVOICE</span>
            <span className="pf-mini-word">Customize. Preview. Send.</span>
          </div>
          <div className="pf-craft-grid">
            <div className="pf-craft-copy" data-reveal>
              <h2>
                Your invoice. <br /> <em>Your branding.</em>
              </h2>
              <p>
                Choose an invoice template, upload your logo, and add your
                business and client details. Enter line items, tax, notes, and
                payment terms, then check the live preview before sending.
              </p>
              <div
                className="pf-theme-controls"
                role="group"
                aria-label="Choose an invoice style"
              >
                {[
                  ["Studio", "Confident & considered"],
                  ["Minimal", "Clean & understated"],
                  ["Clay", "Warm & distinctive"],
                ].map(([name, desc], i) => (
                  <button
                    key={name}
                    aria-pressed={theme === name}
                    onClick={() => setTheme(name)}
                  >
                    <span
                      className={`pf-theme-swatch pf-theme-${name.toLowerCase()}`}
                    />
                    <span>
                      {name}
                      <small>{desc}</small>
                    </span>
                    <span className="pf-theme-choice">
                      {theme === name ? (
                        <Check size={15} />
                      ) : (
                        <span>0{i + 1}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <span className="pf-try-hint">
                <MousePointer2 size={13} /> Try a different style. Make it your
                own.
              </span>
            </div>
            <div
              className={`pf-design-board pf-design-board-${theme.toLowerCase()}`}
              data-reveal
            >
              <div className="pf-board-top">
                <span>
                  <SlidersHorizontal size={14} /> THE INVOICE STUDIO
                </span>
                <span>LIVE STYLE PREVIEW</span>
              </div>
              <div className="pf-board-paper">
                <Invoice theme={theme} />
              </div>
              <div className="pf-board-stamp">
                <Sparkles size={17} />
                <span>
                  YOUR BRAND.
                  <br />
                  EVERY DETAIL.
                </span>
              </div>
              <div className="pf-board-bottom">
                <span>YOUR FINISHING TOUCH</span>
                <span>
                  {theme} edition <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          </div>
          <div className="pf-process-grid">
            {[
              {
                n: "01",
                icon: FileText,
                title: "1. Add your invoice details",
                text: "Add your logo, client, and project details. Fine-tune your invoice with a live preview.",
              },
              {
                n: "02",
                icon: Send,
                title: "2. Email your invoice",
                text: "Review, then email your invoice. Connect PayPal to include a payment link for your client.",
              },
              {
                n: "03",
                icon: Download,
                title: "3. Download or save a draft",
                text: "Download a PDF, PNG, or JPG. Save drafts to your workspace and continue editing across devices.",
              },
            ].map(({ n, icon: Icon, title, text }) => (
              <article key={n} data-reveal>
                <div>
                  <span>{n}</span>
                  <Icon size={22} strokeWidth={1.4} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="pf-interlude">
          <img
            src="/images/studio.webp"
            width="1536"
            height="1024"
            alt=""
            loading="lazy"
          />
          <div className="pf-interlude-overlay" />
          <div>
            <span className="pf-label">ONLINE INVOICING FOR YOUR BUSINESS</span>
            <h2>
              Finished the work? <br /> Send your <em>next invoice.</em>
            </h2>
            <Link to={start} className="pf-button pf-button-lime">
              Create a free account{" "}
              <span>
                <ArrowUpRight size={19} />
              </span>
            </Link>
          </div>
          <span className="pf-interlude-bottom">
            YOUR LOGO. YOUR CLIENTS. YOUR INVOICES. <Asterisk size={26} />
          </span>
        </section>
        <section id="pricing" className="pf-pricing pf-container">
          <div className="pf-section-kicker">
            <span className="pf-label">04 / INVOICE GENERATOR PRICING</span>
            <span className="pf-mini-word">Free and Pro invoicing plans.</span>
          </div>
          <div className="pf-section-title" data-reveal>
            <h2>
              Start free. <br /> <em>Send more with Pro.</em>
            </h2>
            <p>
              Create and download invoices on either plan. Free includes 10
              invoice emails each month. Choose Pro for unlimited invoice emails
              at $108 per year.
            </p>
          </div>
          <div className="pf-plans">
            <article className="pf-plan" data-reveal>
              <div className="pf-plan-top">
                <span className="pf-label">FREE INVOICING TOOLS</span>
                <span className="pf-plan-mark">
                  <Asterisk size={30} />
                </span>
              </div>
              <div className="pf-plan-heading">
                <h3>Free</h3>
                <p>
                  For businesses sending <br /> up to 10 invoice emails a month.
                </p>
              </div>
              <div className="pf-price">
                <span>$0</span>
                <div>
                  Free plan.<small>No credit card required.</small>
                </div>
              </div>
              <Link className="pf-button pf-button-outline" to={start}>
                Create a free account{" "}
                <span>
                  <ArrowUpRight size={18} />
                </span>
              </Link>
              <ul>
                <li>
                  <Check />
                  10 invoice emails per month
                </li>
                <li>
                  <Check />
                  Customizable styles & your own logo
                </li>
                <li>
                  <Check />
                  PDF, PNG & JPG downloads
                </li>
                <li>
                  <Check />
                  Client and payment overview
                </li>
              </ul>
            </article>
            <article className="pf-plan pf-plan-pro" data-reveal>
              <div className="pf-plan-top">
                <span className="pf-label">UNLIMITED INVOICE EMAILS</span>
                <span className="pf-pro-tag">
                  FOR FREQUENT INVOICING <ArrowUpRight size={12} />
                </span>
              </div>
              <div className="pf-plan-heading">
                <h3>
                  Pro<span>+</span>
                </h3>
                <p>
                  For businesses sending <br /> more invoices each month.
                </p>
              </div>
              <div className="pf-price">
                <span>$9</span>
                <div>
                  per month, billed annually
                  <small>$108 billed once per year.</small>
                </div>
              </div>
              <Link className="pf-button pf-button-lime" to={start}>
                Create an account to upgrade{" "}
                <span>
                  <ArrowUpRight size={18} />
                </span>
              </Link>
              <ul>
                <li>
                  <Check />
                  <strong>Unlimited invoice emails</strong>
                </li>
                <li>
                  <Check />
                  Customizable styles & your own logo
                </li>
                <li>
                  <Check />
                  PDF, PNG & JPG downloads
                </li>
                <li>
                  <Check />
                  Client and payment overview
                </li>
              </ul>
            </article>
          </div>
        </section>
        <section id="faq" className="pf-faq pf-container">
          <div data-reveal>
            <span className="pf-label">05 / INVOICING FAQ</span>
            <h2>
              Invoice questions. <br /> <em>Answered.</em>
            </h2>
            <p>
              Learn about invoice downloads, PayPal payments, branding, and plan
              limits.
            </p>
            <span className="pf-faq-symbol" aria-hidden="true">
              ?
            </span>
          </div>
          <div className="pf-faq-list">
            {questions.map(([q, a], i) => (
              <div className="pf-faq-item" key={q}>
                <h3>
                  <button
                    aria-expanded={activeFaq === i}
                    aria-controls={`faq-answer-${i}`}
                    id={`faq-question-${i}`}
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  >
                    <span className="pf-faq-number">0{i + 1}</span>
                    <span>{q}</span>
                    {activeFaq === i ? <Minus size={18} /> : <Plus size={18} />}
                  </button>
                </h3>
                <div
                  id={`faq-answer-${i}`}
                  aria-labelledby={`faq-question-${i}`}
                  role="region"
                  hidden={activeFaq !== i}
                >
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="pf-finale">
          <div className="pf-finale-top">
            <span className="pf-label">
              <i /> CREATE YOUR FIRST INVOICE
            </span>
            <Asterisk className="pf-finale-star" size={64} />
          </div>
          <div className="pf-finale-title" data-reveal>
            <h2>
              Create your <br /> <em>next invoice.</em>
            </h2>
            <Link to={start} className="pf-finale-cta">
              <ArrowUpRight size={58} strokeWidth={1} />
              <span>
                Start <br /> invoicing free.
              </span>
            </Link>
          </div>
          <div className="pf-finale-bottom">
            <p>
              Add your logo. Enter your invoice details. <br /> Download a PDF
              or email it to your client.
            </p>
            <span>
              <Check size={14} /> FREE PLAN. NO CREDIT CARD REQUIRED.
            </span>
          </div>
        </section>
      </main>
      <footer className="pf-footer">
        <div className="pf-footer-top">
          <Brand />
          <p>
            Online invoicing for freelancers <br /> and small businesses.
          </p>
          <nav aria-label="Footer navigation">
            <a href="#product">
              Invoice features <ArrowUpRight size={12} />
            </a>
            <a href="#pricing">
              Pricing <ArrowUpRight size={12} />
            </a>
            <a href="#faq">
              Questions <ArrowUpRight size={12} />
            </a>
            <Link to="/signup">
              Log in <ArrowUpRight size={12} />
            </Link>
          </nav>
        </div>
        <div className="pf-footer-word" aria-hidden="true">
          <svg viewBox="0 0 1000 280" focusable="false">
            <text
              x="0"
              y="210"
              fontSize="260"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
            >
              proforma<tspan fill="#b3ca90">.</tspan>
            </text>
          </svg>
        </div>
        <div className="pf-footer-bottom">
          <span>&copy; {new Date().getFullYear()} Proforma</span>
          <span>CREATE INVOICES. TRACK PAYMENTS.</span>
          <a href="#main">
            Back to top <ArrowUpRight size={12} />
          </a>
        </div>
      </footer>
    </div>
  );
}
