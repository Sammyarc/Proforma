import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const siteUrl = "https://proforma-gen.vercel.app";
const homeTitle = "Free Invoice Generator for Small Businesses | Proforma";
const homeDescription =
  "Create branded invoices, download PDFs, email clients, and track payments with Proforma. Free invoicing software for freelancers and small businesses.";
const pages = {
  "/signup": [
    "Sign in",
    "Sign in to manage your Proforma invoices, clients, and payments.",
  ],
  "/forgot-password": [
    "Reset your password",
    "Request a password reset link for your Proforma account.",
  ],
  "/verify-email": [
    "Verify your email",
    "Verify your email address to access your Proforma invoicing workspace.",
  ],
  "/dashboard": [
    "Invoice dashboard",
    "Review sent invoices, received payments, and outstanding balances.",
  ],
  "/dashboard/invoices": [
    "Invoices",
    "Find and review invoices in your Proforma workspace.",
  ],
  "/dashboard/invoices/new": [
    "Create an invoice",
    "Create a branded invoice with client details, line items, tax, and payment terms.",
  ],
  "/dashboard/clients": [
    "Clients",
    "Review client invoice history and reuse client details.",
  ],
  "/dashboard/payments": [
    "Payments",
    "Review invoice payment statuses and amounts due.",
  ],
  "/dashboard/settings": [
    "Account settings",
    "Manage your business profile, payment connections, and invoicing plan.",
  ],
  "/pricing": [
    "Free and Pro plans",
    "Compare Proforma plans: 10 invoice emails per month on Free or unlimited emails on Pro for $108 per year.",
  ],
  "/payment-success": [
    "Payment confirmation",
    "Review your invoice payment confirmation.",
  ],
  "/payment-status": [
    "Payment status",
    "Check the status of your invoice payment.",
  ],
  "/payment-error": [
    "Payment not completed",
    "Your invoice payment was not completed.",
  ],
  "/payment-cancelled": [
    "Payment cancelled",
    "Return to your invoice email to retry payment.",
  ],
  "/upgrade-success": [
    "Upgrade checkout complete",
    "Return to your workspace to check your Proforma plan.",
  ],
  "/upgrade-error": [
    "Upgrade not completed",
    "Review the Pro plan and retry your upgrade.",
  ],
  "/account-deleted": [
    "Account deletion scheduled",
    "Your Proforma account deletion has been scheduled.",
  ],
};

function meta(attribute, name, content) {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function PageMetadata() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const home = pathname === "/";
    let entry = pages[pathname] || [
      "Page not found",
      "This Proforma page does not exist or has moved.",
    ];
    if (pathname.startsWith("/reset-password/"))
      entry = [
        "Set a new password",
        "Choose a new password for your Proforma account.",
      ];
    if (
      pathname === "/signup" &&
      new URLSearchParams(search).get("mode") === "register"
    )
      entry = [
        "Create a free account",
        "Create your free Proforma account to generate invoices, email clients, and track payments.",
      ];
    const title = home ? homeTitle : `${entry[0]} | Proforma`;
    const description = home ? homeDescription : entry[1];
    document.title = title;
    meta("name", "description", description);
    meta("name", "robots", home ? "index, follow" : "noindex, follow");
    meta("property", "og:title", title);
    meta("property", "og:description", description);
    meta("name", "twitter:title", title);
    meta("name", "twitter:description", description);
    // Do not expose reset tokens or payment identifiers in canonical/social URLs.
    const canonical = document.head.querySelector('link[rel="canonical"]');
    const socialUrl = document.head.querySelector('meta[property="og:url"]');
    if (home) {
      if (!canonical) {
        const link = document.createElement("link");
        link.rel = "canonical";
        link.href = `${siteUrl}/`;
        document.head.appendChild(link);
      }
      meta("property", "og:url", `${siteUrl}/`);
    } else {
      canonical?.remove();
      socialUrl?.remove();
    }
    const schema = document.getElementById("proforma-schema");
    if (schema) schema.type = home ? "application/ld+json" : "application/json";
  }, [pathname, search]);
  return null;
}
