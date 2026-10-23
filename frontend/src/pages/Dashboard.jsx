import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  Settings2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import { useInvoiceStore } from "../store/invoiceStore";
import Overview from "./Overview";
import Invoices from "./Invoices";
import Clients from "./Clients";
import Payments from "./Payments";
import Settings from "./Settings";
import InvoiceGenerator from "../components/Invoice/InvoiceGenerator";
import { initials } from "../components/workspace/shared";
import "../workspace.css";
import { useRef } from "react";

const navigation = [
  { label: "Overview", path: "/dashboard", icon: LayoutGrid, end: true },
  { label: "Invoices", path: "/dashboard/invoices", icon: FileText },
  { label: "Clients", path: "/dashboard/clients", icon: Users },
  { label: "Payments", path: "/dashboard/payments", icon: Wallet },
];
export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { invoiceCount, error: usageError, isLoading } = useInvoiceStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches,
  );
  const sidebarRef = useRef(null);
  const [notifications, setNotifications] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname.includes("/settings")
    ? "Settings"
    : navigation.find((item) =>
        item.end
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path),
      )?.label || "Workspace";
  useEffect(() => {
    setMobileOpen(false);
    setNotifications(false);
  }, [location.pathname]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMobileOpen(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.focus();
    const handler = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key !== "Tab") return;
      const elements = sidebarRef.current.querySelectorAll(
        "a[href],button:not([disabled])",
      );
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === sidebarRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === sidebarRef.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [mobileOpen]);
  const signOut = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/signup");
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };
  return (
    <div className="workspace">
      <a className="ws-skip" href="#workspace-main">
        Skip to content
      </a>
      {mobileOpen && (
        <button
          className="ws-sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        tabIndex={-1}
        inert={isMobile && !mobileOpen ? "" : undefined}
        role={isMobile && mobileOpen ? "dialog" : undefined}
        aria-modal={isMobile && mobileOpen ? true : undefined}
        aria-label="Workspace navigation"
        className={"ws-sidebar " + (mobileOpen ? "is-open" : "")}
      >
        {isMobile && (
          <button
            className="ws-mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        )}
        <Link to="/dashboard" className="ws-brand">
          <img src="/brand/proforma-mark.svg" width="36" height="36" alt="" />
          proforma<span className="ws-brand-dot">.</span>
        </Link>
        <Link className="ws-workspace-picker" to="/dashboard/settings">
          <span className="ws-workspace-icon">
            {initials(user?.businessName || user?.name)}
          </span>
          <span>
            <strong>{user?.businessName || "My workspace"}</strong>
            <small>
              {user?.tier === "pro" ? "Pro account" : "Personal workspace"}
            </small>
          </span>
          <ChevronDown size={15} />
        </Link>
        <span className="ws-nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {navigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                "ws-nav-link " + (isActive ? "active" : "")
              }
            >
              <Icon size={19} strokeWidth={1.7} />
              {label}
              {label === "Invoices" && (
                <span className="ws-nav-plus">
                  <Plus size={13} />
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="ws-sidebar-bottom">
          <NavLink
            className={({ isActive }) =>
              "ws-nav-link " + (isActive ? "active" : "")
            }
            to="/dashboard/settings"
          >
            <Settings2 size={19} strokeWidth={1.7} />
            Settings
          </NavLink>
          <div className="ws-plan-card">
            <div>
              <span className="ws-plan-dot" />
              <strong>
                {user?.tier === "pro"
                  ? "Pro invoicing plan"
                  : "Need to send more invoices?"}
              </strong>
            </div>
            <p>
              {user?.tier === "pro"
                ? "Your Pro plan includes unlimited invoice emails."
                : "Upgrade to Pro for unlimited invoice emails."}
            </p>
            {user?.tier !== "pro" && (
              <>
                <div className="ws-usage-label">
                  <span>Invoice emails this month</span>
                  <span>
                    {isLoading || usageError ? "—" : invoiceCount + " / 10"}
                  </span>
                </div>
                <div className="ws-progress">
                  <span
                    style={{ width: Math.min(invoiceCount * 10, 100) + "%" }}
                  />
                </div>
                <Link to="/pricing">
                  Explore Pro <ArrowUpRight size={16} />
                </Link>
              </>
            )}
          </div>
          <div className="ws-sidebar-profile">
            <span className="ws-avatar">{initials(user?.name)}</span>
            <Link to="/dashboard/settings">
              <strong>{user?.name || "Your account"}</strong>
              <small>{user?.email}</small>
            </Link>
            <button
              aria-label="Sign out"
              title="Sign out"
              onClick={signOut}
              disabled={loggingOut}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="ws-main-shell">
        <header className="ws-topbar">
          <div className="ws-breadcrumb">
            <button
              className="ws-icon-button ws-menu-toggle"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span>Workspace</span>
            <span className="ws-breadcrumb-slash">/</span>
            <strong>{current}</strong>
          </div>
          <div className="ws-topbar-actions">
            <div className="ws-notification-wrap">
              <button
                className="ws-icon-button"
                aria-label="Notifications"
                aria-expanded={notifications}
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={19} />
              </button>
              {notifications && (
                <div className="ws-notifications">
                  <div>
                    <strong>Notifications</strong>
                    <button
                      className="ws-icon-button"
                      aria-label="Close notifications"
                      onClick={() => setNotifications(false)}
                    >
                      <X size={15} />
                    </button>
                  </div>
                  {user?.notifications?.length ? (
                    user.notifications.map((n, i) => (
                      <p key={n._id || i}>{n.message}</p>
                    ))
                  ) : (
                    <p>
                      You’re all caught up.
                      <br />
                      <span>New account updates will appear here.</span>
                    </p>
                  )}
                </div>
              )}
            </div>
            <Link
              aria-label="Account settings"
              to="/dashboard/settings"
              className="ws-avatar ws-topbar-avatar"
            >
              {initials(user?.name)}
            </Link>
          </div>
        </header>
        <main id="workspace-main" className="ws-content" tabIndex={-1}>
          <Routes>
            <Route index element={<Overview />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceGenerator />} />
            <Route path="clients" element={<Clients />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <div className="ws-empty">
                  <h1>Page not found</h1>
                  <Link className="ws-button" to="/dashboard">
                    Back to overview
                  </Link>
                </div>
              }
            />
          </Routes>
          <footer className="ws-footer">
            <span>Made for the work you love.</span>
            <span>Proforma © {new Date().getFullYear()}</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
