# Proforma product and interface audit

Reviewed: 22 October 2026.

Scope: repository review of architecture, routes, data models, invoice generation/delivery, account/payment flows, page components and shared styles. Findings below distinguish implementation defects from proposed product improvements. This is not a completed browser accessibility audit or a live payment/email test. Existing uncommitted frontend migration work was preserved; application code was not changed during this review.

## Product understanding

Proforma is a small-business invoicing SaaS: register, verify email, configure a business and PayPal connection, customize an invoice, export or email it, then track clients and payments. Free accounts have a nominal ten-invoice monthly allowance; a Flutterwave checkout sells a USD 108 annual Pro upgrade.

The implementation is React/Vite/Tailwind/Zustand on the frontend and Express/Mongoose on the backend, with cookie JWT authentication, Cloudinary files, Nodemailer delivery and PayPal invoice payments. Flutterwave currently serves the Pro upgrade flow. The other advertised payment integrations are not implemented as working connection handlers.

The frontend is midway through a migration: public/auth pages and shared UI primitives use TypeScript and newer design tokens, while the dashboard/editor remain predominantly JSX and older styles. Preserve and finish this foundation rather than restart the entire application.

## Critical corrections

### 1. Enforce account ownership on every private operation

Evidence: `server/routes/invoice.routes.js` exposes invoice listing, details, statistics and deletion without `verifyToken`, using query-supplied `userId`. Even `/count`, which is authenticated, trusts the query ID. `server/routes/settings.routes.js` exposes `/soft-delete` without authentication. `server/routes/paypal.routes.js` exposes `/disconnect` with a body-supplied ID. `server/mails/email.routes.js` authenticates the sender but uses the body's ID for invoice ownership and PayPal credentials.

Impact: knowing identifiers can allow unauthorized reading/deletion, account deletion or payment-account disconnection; authenticated email requests can target another account's data/credentials.

Correction: derive ownership from the verified session, scope every database operation to that owner, validate IDs and request shapes, and enforce verified/active account status server-side. Verify with two separate accounts and unauthenticated requests. Frontend route guards are not an API authorization boundary.

### 2. Bind payments to the exact invoice or upgrade purchase

Evidence: `server/routes/payment.routes.js` verifies a PayPal order but updates the independently supplied invoice ID without matching invoice reference, expected amount/currency or merchant. Its unauthenticated cancellation GET changes invoice status directly, including potentially a previously paid invoice. `server/routes/upgrade.routes.js` checks amount/currency/status but does not bind a transaction to a stored purchase owned by the logged-in user or mark it consumed.

Correction: persist checkout/order records with owner, invoice, expected amount/currency and provider ID. Verify all those values before an idempotent transition. Reject reuse for another invoice/account. Cancellation of checkout should not erase a settled payment. Add authenticated provider webhook handling and reconciliation so settlement does not depend on a browser returning successfully.

### 3. Secure PayPal connection state

Evidence: `server/routes/paypal.routes.js` accepts JSON state containing arbitrary `userId` and `redirect`, then stores credentials and redirects without checking a session-bound nonce. The client constructs this state in `frontend/src/hooks/UsePaymentHandlers.jsx`.

Correction: initiate connection on the authenticated server, store an expiring single-use nonce tied to the account, verify it in the callback, and allow only known return destinations.

### 4. Restrict attachment sources and account response fields

Evidence: `server/mails/email.routes.js` passes a client-supplied `invoiceUrl` into Nodemailer's attachment `path`. This creates a server-side URL/file access risk. Settings updates and upgrade verification return complete user documents; `User` includes password hashes, reset/verification tokens and encrypted PayPal credentials.

Correction: attach only server-owned, authorized upload records; disallow arbitrary network/file paths. Return explicit public user DTOs and never serialize authentication/provider secrets. Escape user-provided HTML email fields.

## Workflow and correctness defects

| Priority | Finding and evidence | Correction |
| --- | --- | --- |
| High | Payments fetches no `page`/`limit`, ignores API pagination, then slices the returned array locally (`frontend/src/pages/Payments.jsx`). API defaults to ten rows. | Use server pagination and total counts. Verify access to invoice 11 and beyond; reset page on filter/page-size changes. |
| High | Sending persists an invoice and usage log before PayPal and email succeed (`server/mails/email.routes.js`). Retries can create duplicates and failed sends still appear in history. | Separate draft, payment setup and delivery state; use idempotency and retry the same invoice. Record delivery failure explicitly. |
| High | Usage display counts `invoiceLog`, but enforcement counts deletable `Invoice` documents (`server/middleware/usageLimit.js`, invoice `/count`). Concurrent requests can pass the same limit check. | Use one durable usage source and atomic quota reservation; define failure/refund behavior. Test month-end signup anniversaries and concurrent sends. |
| High | Template 1 applies an unconditional 10% tax; invoice payments force USD; persisted invoices have no currency or structured line-item/tax fields (`InvoiceTemplate1.jsx`, `email.routes.js`, `invoice.model.js`). | Persist structured invoice data, explicit currency and configurable tax. Compute/validate totals server-side using an appropriate decimal/minor-unit representation. |
| High | Templates own their own form state; sending scrapes DOM fields; invoice model stores the PDF and summary rather than editable line items. | Share one invoice data model across templates and preview, persist drafts, preserve content when changing templates, and support reopening/editing drafts. |
| Medium | Provider buttons reference handlers that do not exist (`AccountConnectionModal.jsx`, `Settings.jsx`, `UsePaymentHandlers.jsx`). | Show PayPal as available and clearly disable/hide unfinished integrations. Keep Flutterwave subscription checkout distinct from merchant invoice connections. |
| Medium | Schema status enum excludes `payment_failed`, but sending writes it and dashboards query it. | Define invoice, delivery and payment states separately, validate all writes and align filters/labels. |
| Medium | PDF export puts the whole capture on one A4 page without pagination and has no rejection cleanup (`InvoiceGenerator.jsx`). | Handle long invoices, wait for fonts/images and restore editing/loading state in `finally`. Prefer selectable text in generated documents. |
| Medium | Cancellation redirects to `/payment-cancelled`, which is absent from `App.jsx`; unknown routes silently show Home. | Implement the cancellation route and a real 404 with recovery actions. |
| Medium | Sidebar calls the `Navigate` component as a function during logout; initial sidebar state is the string `"false"` (`Sidebar.jsx`, `Dashboard.jsx`). | Use awaited logout plus `useNavigate`; initialize boolean state correctly. |
| Medium | Settings updates only persist truthy text values, preventing clearing fields; account email can change without a verification flow (`settings.routes.js`). | Validate explicit fields, support empty optional values, and verify email changes separately. |
| Medium | Invalid/expired JWTs become 500 responses; email verification looks up a short code globally (`verifyToken.js`, `auth.controller.js`). | Return appropriate authentication failures; bind verification challenges to an account/session and limit attempts. |
| Medium | Newsletter form reports subscription success without making a request (`NewsletterSubscription.tsx`). | Implement persistence and truthful loading/error/success states, or remove the form. |
| Medium | API origins are repeated throughout the frontend, including a hard-coded development tunnel (`UsePaymentHandlers.jsx`). | Centralize an environment-configured API client and document local configuration. |

## Design assessment and page plan

Recommendation: redesign the dashboard/editor comprehensively and align the newer public/auth pages with the same visual system. The code supports this conclusion, but rendered layouts, contrast and mobile behavior still require browser review.

Current issues: widespread `vw` font/control sizing, viewport-relative fixed header/sidebar/editor offsets, a body-level 1440px cap mixed with viewport positioning, mixed icon families and legacy heavy `.box` shadows. The newer `components/ui` directory is a useful starting point but is not consistently adopted.

Use a restrained workspace: warm neutral background, white surfaces, dark readable text, one accent, semantic status colors, consistent typography/spacing, subtle borders and limited motion. Keep Satoshi if desired. Use stable rem-based navigation/control dimensions, responsive content grids and readable monetary columns. Reserve expressive visuals for the marketing page.

| Surface | Proposed redesign |
| --- | --- |
| Home | Explain the core create/send/track workflow, add a prominent hero CTA, show an accurate product preview, and align feature/pricing claims with implemented behavior. Remove unsupported automation/integration promises. |
| Sign in / sign up | Consistent form card, visible labels, password visibility, clear inline errors, honest pending states and reliable Google sign-in. |
| Verify email / forgot/reset password | Shared auth layout with explicit progress, retry/resend behavior and useful expiry/error recovery. |
| Dashboard shell | Stable sidebar with usable collapsed icons, consistent page header and primary Create invoice action; mobile navigation/drawer without content overlap. |
| Overview | Prioritize collected, outstanding and overdue amounts, then actionable invoice activity. Add useful first-run guidance instead of empty charts. |
| Invoices | Make this an invoice list with search, status filters and Create invoice. Currently this route opens the editor directly. Give creation and invoice details their own routes. |
| Invoice editor | Structured form plus live preview on desktop; form/preview switch on mobile. Group business/client details, items, totals, terms and branding. Provide Save draft, Preview and Send with an explicit recipient review. |
| Templates | Shared data rendered through visual variants, clear selected state and previews that preserve invoice contents. |
| Clients | Treat current aggregated invoice recipients honestly; add a real client record model before promising standalone CRUD. Provide client details, billing history and prefilled invoice creation. |
| Payments | Searchable settlement history, amount/currency, provider/reference, useful filters and clear pending/failed states. Keep invoice deletion separate from transaction-history actions. |
| Settings | Separate business profile, payment connections, account/security and billing. Place destructive actions in a clearly separated section with confirmation and recovery details. |
| Pricing / upgrade | Show exact billing period, cost, active plan and limits. Current model only stores `tier`; add entitlement start/end and renewal/expiry behavior before promising an annual subscription lifecycle. |
| Payment/upgrade success and failure | Consistent status layouts based on verified backend state, reference details and clear retry/return actions. Distinguish processing, cancelled and failed. |
| Deleted account / 404 | Clear recovery or return path and consistent application branding. |

Accessibility: shared `Modal.tsx` lacks dialog semantics, accessible title wiring, focus trapping/restoration and a named close button. Address these centrally. Validate keyboard navigation, visible focus, reduced-motion behavior, form error associations, table semantics and mobile touch targets across pages. Never communicate status through color alone.

## Engineering checks and documentation

- `npm run build` passes when run outside the filesystem sandbox. Vite reports a roughly 2.01 MB minified main JavaScript chunk (525 KB gzip), a large-chunk warning, old Browserslist data and an eval warning from Lottie. Lazy-load dashboard/editor/export/chart dependencies by route or action and measure initial page loading before setting a performance budget.
- `npm run lint` fails before analysis because `react/no-unused-vars` is configured as boolean `false`. ESLint also only targets JS/JSX, excluding the migrated TypeScript files.
- `tsc --noEmit` fails with TS6310: the referenced `tsconfig.node.json` disables emit. The production build script runs Vite alone, so it does not establish type correctness.
- No test script is defined in either package despite README instructions to run one.
- Root README installation commands assume a root package; dependencies actually belong to `frontend/` and `server/`. Document both processes, required environment variable names, database/email/provider setup, supported Node version and actual provider support. Do not commit secrets.
- `CLAUDE.md` says there is no TypeScript, which no longer matches the workspace.
- No live database, email or payment transaction was exercised in this audit. Cross-account security tests should use isolated fixtures, not real customer data.

## Implementation order and completion criteria

1. **Secure the existing flows:** ownership enforcement, response redaction, attachment restrictions, OAuth state, payment binding/idempotency. Add meaningful cross-account and payment-replay regression tests.
2. **Make the invoice lifecycle reliable:** structured data, drafts, totals/currency/tax, consistent usage, delivery retry, pagination and payment reconciliation. Verify long PDFs and failure recovery.
3. **Complete the shared design foundation:** shell, typography, tables, forms, dialogs and loading/empty/error patterns. Repair lint/typecheck and use the shared components throughout.
4. **Redesign the main working pages:** invoice list/editor first, then overview, clients, payments and settings. Verify desktop/mobile and keyboard workflows with realistic data.
5. **Align public/auth/billing/status pages:** reflect actual capabilities and complete the recovery paths, documentation and release checks.

Release criteria: one account cannot read/mutate another's records; one transaction cannot pay unrelated invoices or upgrade multiple accounts; a draft survives reload/template change; a failed send retries without duplicate billing/usage; invoice 11 remains accessible; taxes/currencies/totals agree between editor, PDF and payment; all core flows work on mobile and keyboard; build, typecheck and lint have a reliable passing baseline.
