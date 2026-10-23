import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  Check,
  CreditCard,
  Link2,
  Loader2,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import { useInvoiceStore } from "../store/invoiceStore";
import { UsePaymentHandlers } from "../hooks/UsePaymentHandlers";
import Modal from "../components/ui/Modal";
import {
  api,
  ErrorState,
  Loading,
  PageHeading,
  initials,
  useResource,
} from "../components/workspace/shared";

const tabs = [
  { id: "profile", label: "Business profile", icon: Building2 },
  { id: "connections", label: "Payment connections", icon: Link2 },
  { id: "billing", label: "Plan & usage", icon: CreditCard },
  { id: "account", label: "Account & security", icon: ShieldCheck },
];
export default function Settings() {
  const { user, connections, checkAuth, clearUser } = useAuthStore();
  const { invoiceCount, nextReset, error: usageError } = useInvoiceStore();
  const resource = useResource("/settings/user-settings");
  const [params, setParams] = useSearchParams();
  const active = tabs.some((t) => t.id === params.get("tab"))
    ? params.get("tab")
    : "profile";
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const { handlers } = UsePaymentHandlers();
  const navigate = useNavigate();
  useEffect(() => {
    if (resource.data) setForm(resource.data);
  }, [resource.data]);
  const save = async (e) => {
    e.preventDefault();
    setBusy("save");
    try {
      await api.put("/settings/user-settings", form);
      await checkAuth();
      toast.success("Business profile saved.");
    } catch {
      toast.error("Could not save your profile. Please try again.");
    } finally {
      setBusy("");
    }
  };
  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/gif"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      toast.error("Choose a PNG, JPG or GIF smaller than 2 MB.");
      return;
    }
    setBusy("upload");
    try {
      const body = new FormData();
      body.append("logo", file);
      const { data } = await api.post("/settings/upload-logo", body);
      setForm((f) => ({ ...f, logoUrl: data.logoUrl }));
      toast.success("Logo updated.");
    } catch {
      toast.error("Could not upload your logo.");
    } finally {
      setBusy("");
    }
  };
  const disconnect = async () => {
    setBusy("disconnect");
    try {
      await api.post("/paypal/disconnect", { userId: user._id });
      await checkAuth();
      toast.success("PayPal disconnected.");
    } catch {
      toast.error("Could not disconnect PayPal.");
    } finally {
      setBusy("");
    }
  };
  const deleteAccount = async () => {
    setBusy("delete");
    try {
      await api.patch(
        "/settings/soft-delete",
        {},
        { params: { userId: user._id } },
      );
      clearUser();
      navigate("/account-deleted");
    } catch {
      toast.error("Could not delete your account.");
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="MANAGE YOUR WORKSPACE"
        title="Settings"
        description="Update your business profile, connect PayPal, and manage your plan and account."
      />
      <div className="ws-settings-layout">
        <nav className="ws-settings-nav" aria-label="Settings sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => setParams({ tab: id })}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <section className="ws-panel ws-settings-panel">
          {active === "profile" && (
            <>
              <div className="ws-panel-heading">
                <div>
                  <h2>Business profile</h2>
                  <p>Put a familiar face on every invoice.</p>
                </div>
              </div>
              {resource.error ? (
                <ErrorState
                  message={resource.error}
                  onRetry={resource.reload}
                />
              ) : !form ? (
                <Loading />
              ) : (
                <form onSubmit={save} className="ws-settings-form">
                  <div className="ws-logo-upload">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Business logo" />
                    ) : (
                      <span className="ws-avatar ws-avatar-large">
                        {initials(user?.businessName || user?.name)}
                      </span>
                    )}
                    <div>
                      <label className="ws-button">
                        <Upload size={15} />
                        {busy === "upload" ? "Uploading…" : "Upload logo"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/gif"
                          className="sr-only"
                          disabled={!!busy}
                          onChange={upload}
                        />
                      </label>
                      <p>PNG, JPG or GIF. Up to 2 MB.</p>
                    </div>
                  </div>
                  <div className="ws-form-grid">
                    {[
                      [
                        "businessName",
                        "Business name",
                        "Your studio or company",
                        "text",
                      ],
                      [
                        "email",
                        "Email address",
                        "hello@yourbusiness.com",
                        "email",
                      ],
                      ["phoneNumber", "Phone number", "+1 555 000 0000", "tel"],
                      ["country", "Country", "Country", "text"],
                      ["city", "City", "City", "text"],
                      ["state", "State / region", "State or region", "text"],
                    ].map(([key, label, placeholder, type]) => (
                      <label className="ws-field" key={key}>
                        {label}
                        <input
                          value={form[key] || ""}
                          type={type}
                          placeholder={placeholder}
                          onChange={(e) =>
                            setForm({ ...form, [key]: e.target.value })
                          }
                          required={key === "email"}
                          readOnly={key === "email"}
                          title={
                            key === "email"
                              ? "Account email changes require a separate verification flow."
                              : undefined
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <div className="ws-form-footer">
                    <span>Your business details, all in one place.</span>
                    <button className="ws-button ws-primary" disabled={!!busy}>
                      {busy === "save" ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Save changes
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
          {active === "connections" && (
            <>
              <div className="ws-panel-heading">
                <div>
                  <h2>Payment connections</h2>
                  <p>Give your clients a simple way to pay.</p>
                </div>
              </div>
              <div className="ws-settings-body">
                <div className="ws-provider">
                  <span className="ws-paypal-mark">P</span>
                  <div>
                    <h3>PayPal</h3>
                    <p>Accept payments directly from your invoices.</p>
                  </div>
                  <span
                    className={
                      "ws-status " +
                      (connections?.paypal
                        ? "ws-status-paid"
                        : "ws-status-pending")
                    }
                  >
                    <i />
                    {connections?.paypal ? "Connected" : "Not connected"}
                  </span>
                </div>
                <div className="ws-connection-note">
                  <ShieldCheck size={21} />
                  <p>
                    You’ll be redirected to PayPal to connect your account. Your
                    clients can then pay through a link in their invoice email.
                  </p>
                </div>
                <button
                  className={
                    "ws-button " + (connections?.paypal ? "" : "ws-primary")
                  }
                  disabled={!!busy}
                  onClick={
                    connections?.paypal
                      ? disconnect
                      : handlers.handlePayPalConnect
                  }
                >
                  {busy === "disconnect"
                    ? "Disconnecting…"
                    : connections?.paypal
                      ? "Disconnect PayPal"
                      : "Connect PayPal"}
                  <ArrowUpRight size={16} />
                </button>
                <p className="ws-small-note">
                  Additional payment providers are not available yet.
                </p>
              </div>
            </>
          )}
          {active === "billing" && (
            <>
              <div className="ws-panel-heading">
                <div>
                  <h2>Plan & usage</h2>
                  <p>
                    Check your plan, invoice email usage, and next reset date.
                  </p>
                </div>
              </div>
              <div className="ws-settings-body">
                <div className="ws-billing-card">
                  <span className="ws-eyebrow">YOUR CURRENT PLAN</span>
                  <h3>
                    Proforma {user?.tier === "pro" ? "Pro" : "Free"}
                    <span>
                      {user?.tier === "pro"
                        ? "Unlimited invoice emails"
                        : "10 invoice emails per month"}
                    </span>
                  </h3>
                  <div className="ws-billing-usage">
                    <strong>{usageError ? "—" : invoiceCount}</strong>
                    <span>
                      {" "}
                      / {user?.tier === "pro" ? "unlimited" : "10"} monthly
                      invoice emails
                    </span>
                  </div>
                  <div className="ws-progress">
                    <span
                      style={{
                        width:
                          user?.tier === "pro"
                            ? "100%"
                            : Math.min(invoiceCount * 10, 100) + "%",
                      }}
                    />
                  </div>
                  {nextReset && (
                    <p>
                      Next usage reset:{" "}
                      {new Date(nextReset).toLocaleDateString()}
                    </p>
                  )}
                  {user?.proExpiresAt && (
                    <p>
                      Pro access ends:{" "}
                      {new Date(user.proExpiresAt).toLocaleDateString()}.
                      Renewal is manual; your card is not charged automatically.
                    </p>
                  )}
                  {user?.tier === "pro" && !user.proExpiresAt && (
                    <p>
                      Legacy Pro access. Contact support to confirm your renewal
                      date.
                    </p>
                  )}
                </div>
                {user?.tier !== "pro" && (
                  <Link to="/pricing" className="ws-button ws-primary">
                    Explore Pro <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            </>
          )}
          {active === "account" && (
            <>
              <div className="ws-panel-heading">
                <div>
                  <h2>Account & security</h2>
                  <p>Manage your access and account preferences.</p>
                </div>
              </div>
              <div className="ws-settings-body">
                <div className="ws-account-row">
                  <div>
                    <h3>Password</h3>
                    <p>Request a secure link to reset your password.</p>
                  </div>
                  <Link className="ws-button" to="/forgot-password">
                    Reset password
                  </Link>
                </div>
                <div className="ws-account-row ws-danger-zone">
                  <div>
                    <h3>Delete account</h3>
                    <p>
                      Your account will be scheduled for deletion. This affects
                      your entire workspace.
                    </p>
                  </div>
                  <button
                    className="ws-button ws-danger"
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
      >
        <div className="ws-detail">
          <p>
            This will schedule your Proforma account for deletion. Type DELETE
            to confirm.
          </p>
          <label className="ws-field">
            Confirmation
            <input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="ws-form-footer">
            <button className="ws-button" onClick={() => setDeleteOpen(false)}>
              Keep account
            </button>
            <button
              className="ws-button ws-danger"
              onClick={deleteAccount}
              disabled={confirmation !== "DELETE" || !!busy}
            >
              {busy === "delete" ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
