# Proforma workspace redesign

The application now uses a consistent visual direction: an ink-green navigation rail, warm neutral surfaces, forest-green actions, restrained borders, and Satoshi typography. The working screens prioritize readable financial information and a clear next action.

## What changed

- **Workspace shell:** responsive navigation, account switch to settings, plan usage, notifications, working logout, skip link, and keyboard-accessible mobile drawer.
- **Overview:** collected/outstanding totals, revenue chart with focusable month values and time-period control, recent invoices, and a contextual payment-connection prompt. Numbers come from the existing API.
- **Invoices:** a dedicated library at `/dashboard/invoices`, server pagination, status filters, page-scoped search, details, PDF access, and confirmed deletion. Mobile rows keep the amount and status visible without horizontal scrolling.
- **Editor:** a separate route at `/dashboard/invoices/new`, structured fields, client prefill, live preview, configurable tax, notes/payment terms, logo upload, and three new invoice styles. Style changes preserve the entered content. PDF, PNG and JPG exports remain available. Drafts are explicitly saved on the current device, scoped to the signed-in account. Sending requires a recipient review and uses the existing Cloudinary/email/PayPal flow.
- **Clients:** searchable directory derived from existing invoice recipients, with a shortcut to a prefilled invoice.
- **Payments:** shared invoice-payment history, status filters, pagination and details.
- **Settings:** business profile, logo upload, payment connection, plan usage, password-reset access and confirmed account deletion. Unsupported provider connection buttons are no longer presented as working integrations.
- **Authentication:** shared split-screen composition, visible field labels, password visibility, keyboard form submission, inline reset errors and a Google sign-in loading/unavailable state.
- **Billing and results:** coordinated pricing, payment verification, payment/upgrade outcome, account-deletion and not-found screens. The payment-cancelled URL now resolves to its intended page.
- **Dialogs:** accessible titles, Escape handling, focus containment/restoration, and scroll locking.

The marketing homepage was not redesigned. Existing uncommitted migration work was retained. The older invoice template/component files remain in the repository; the new editor uses Studio, Minimal and Clay styles.

## Main implementation files

- `frontend/src/workspace.css`: shared workspace/auth/billing visual system and responsive layouts.
- `frontend/src/pages/Dashboard.jsx`: navigation shell and workspace routes.
- `frontend/src/components/workspace/shared.jsx`: API resource hook, table, search, status, loading/error/empty states and invoice details.
- `frontend/src/components/Invoice/InvoiceGenerator.jsx`: structured editor, preview, local draft and export/send workflow.
- `frontend/src/components/Auth/AuthLayout.tsx`: shared auth composition.
- `frontend/src/components/workspace/ResultPage.jsx`: shared result-page layout.

## Validation

- Production build passed. The main JavaScript bundle decreased from approximately 2,014 KB to 363 KB minified (approximately 525 KB to 116 KB gzip). PDF capture/generation dependencies now load when needed; old animation/chart/editor dependencies are no longer in the active workspace path.
- Isolated Chromium checks exercised desktop (1440px) and mobile (390px) workspace routes, server pagination, filters, client search/prefill, invoice details, draft saving, style selection, send review, PDF download on desktop and mobile, navigation focus, and empty/error states.
- Browser checks covered sign-in, password recovery, verification, pricing, payment/upgrade results and account deletion layouts at both viewport sizes. No uncaught page exceptions were observed. API responses were intercepted with explicit test fixtures; no real invoices, payments or account mutations were sent.
- `git diff --check` passed after formatting the changed files.
- TypeScript checking still stops at the pre-existing TS6310 configuration error in the `tsconfig.node.json` project reference. The repository ESLint configuration also has the pre-existing invalid rule described in `PRODUCT_AUDIT.md`; this redesign does not claim a passing repository-wide lint/typecheck baseline.

Screenshots and the isolated browser-check script are in `.tmp/redesign/`, excluded from Git. The existing local preview is available through the frontend dev server; sign in normally to see your own workspace data.

## Boundaries retained for the functionality phase

The backend ownership/payment-security findings in `PRODUCT_AUDIT.md` remain open. This work did not change the server or environment secrets. Live email delivery, Cloudinary uploads, OAuth connections and payment settlement need integration validation in the functionality phase.

Currency remains USD to match the current payment API. Invoice search explicitly applies to the loaded page. Drafts are local to the browser, not synchronized to the server. PDF generation captures the rendered document and paginates it; text-based document generation and smarter page breaks remain future improvements.

## Landing page redesign

- Replaced the public homepage with a warm cream and forest-green design, editorial typography, an interactive invoice style preview, and an explicitly illustrative workspace preview.
- Added responsive product, workflow, pricing, FAQ, and closing sections. Removed placeholder testimonials and unsupported marketing claims from the rendered homepage.
- Pricing reflects 10 invoice emails/month on Free and unlimited emails on Pro at $108/year. Public calls to action open registration through `/signup?mode=register`.
- Mobile navigation supports Escape and focus restoration; FAQs use native disclosure controls; a skip link, visible focus states, and reduced-motion styling are included.
- Verified production build, desktop and 320/390/768px layouts, no horizontal overflow, invoice style switching, FAQ disclosure, registration routing, and keyboard navigation. Browser checks reported no runtime exceptions. Visual screenshots are in `.tmp/redesign/landing-desktop.png` and `landing-mobile.png`.

## Reference-led landing redesign (second version)

Rebuilt the first landing design after feedback that it was too basic. Studied the supplied live references in Chromium: https://freshlyfolded.com/, https://bolamatelokoh.com/, https://superpower.com/, and https://ownapiece.vercel.app/. The new design uses larger display typography, a full-width photographic product scene, chapter-based storytelling, stronger changes of background and scale, and rounded directional calls to action. Original copy, artwork, and code were created for Proforma; reference-site media were not reused. Superpower's hero media did not render in the automated browser, so its visible layout and content informed the review.

- Hero includes keyboard-accessible Create / Send / Track preview tabs, all explicitly labeled sample data.
- A dedicated studio section provides live Studio / Minimal / Clay style selection.
- Dark workspace section, photographic interlude, contrasting Free / Pro plans, accordion FAQs, and large closing wordmark replace the first version's section composition.
- Preview components live in `frontend/src/components/landing/ProductPreview.tsx`; the real application routes and authentication behavior are retained.
- Local responsive WebP artwork and its complete built-in imagegen prompt are recorded in `frontend/public/images/README.md`.
- Page metadata now describes the implemented invoice product and removes the unsupported AI claim and typo.
- Validation: production build; browser checks for demo tabs and arrow-key focus, style selection, FAQ disclosure, mobile menu and Escape, registration CTA, and layouts from 320px to 1920px. Checked sample captions clear the demo controls as well as checking viewport overflow. Screenshots and browser scripts are under `.tmp/redesign/v2-*`.

## Readability, identity, and mobile navigation

- Raised public-page body copy to 15-17px, supporting labels to 11-13px, strengthened contrast, loosened display typography, and replaced dense small headings with readable Satoshi. Invoice illustrations retain compact secondary labels; mobile previews hide nonessential details instead of shrinking the primary text. Mobile dashboard metrics stack into readable rows.
- Created the original folded-document P logo as SVG, with a standalone mark and horizontal lockup in `frontend/public/brand`. Installed the mark in the landing header/footer, auth layout, dashboard navigation, and favicon.
- Header is fixed with a translucent background. In-page targets have scroll offsets so headings remain visible.
- Mobile menu is a native modal dialog presented as a bottom sheet using Framer Motion springs. Includes drag-handle dismissal, backdrop dismissal, Escape, explicit keyboard focus wrapping/restoration, body scroll locking/restoration, safe-area padding, desktop-resize cleanup, and reduced-motion support. Anchor navigation runs after exit completes and scrolling is restored.
- Production build and browser verification cover text/layout at 320/390/768/1024/1440px, all demo states, fixed-header offsets, keyboard containment, and menu navigation. Additional animation checks cover spring movement, swipe dismissal, backdrop dismissal, short viewports, and scroll restoration.

## Shared typography, authentication, and workspace refresh

- Standardized non-italic typography on Satoshi across the landing page, previews, authentication, and workspace. Preserved the existing italic editorial accents.
- Added `frontend/src/product-theme.css` as the shared visual layer: forest green, lime accents, warm canvas, rounded surfaces, readable forms, and consistent controls.
- Rebuilt the authentication layout around the studio photograph and a focused form panel. Sign-in, registration, recovery, reset, and verification share responsive styling.
- Refreshed the dashboard overview, navigation, metrics, invoice lists, client cards, payment views, settings, and invoice editor to follow the landing page identity. Mobile workspace navigation opens as an animated bottom sheet with existing keyboard containment and Escape behavior retained.
- Fixed a null-user access in the authenticated-user redirect that crashed signed-out password reset. Aligned the password-strength description and length check with registration's existing eight-character minimum.
- Validation: fixture-backed desktop/mobile workspace checks covered filters, pagination, client prefill, draft saving, invoice review, PDF downloads, navigation, and empty/error states. Auth checks passed at 320/390/768/1440px. Computed-font checks confirmed Satoshi for visible non-italic text; italic accents remain Georgia. No horizontal overflow or uncaught browser exceptions appeared in these checks. Live OAuth, email delivery, and payments were not exercised.
- Browser scripts and screenshots are retained locally under `.tmp/redesign/`, including `auth-new-*` and `dashboard-sheet-new.png`.
