# Proforma functionality work

Authorized scope: implement the functionality review in sequence, preserving the current design.

## 1. Account isolation and safe account responses — implemented

- Workspace endpoints require a valid session and an active, verified account.
- Invoice reads, statistics, deletion, usage counts, sending, account deletion, and PayPal disconnection derive ownership from the session. Client-provided owner IDs are ignored.
- Invalid invoice IDs, unsupported filters, and unbounded pagination are rejected.
- Auth, profile-update, and upgrade responses use an explicit public-user field allowlist.
- Expired/invalid session tokens return 401. Verification codes are scoped to the signed-in account.
- Optional profile fields can be cleared. General profile updates cannot change the account email without verification; the UI reflects this restriction.
- PayPal connection initiation moved to the backend. A hashed, expiring nonce binds callbacks to the account and is atomically consumed. Return destinations are fixed. Removed the frontend's hard-coded development tunnel.

Validation: `cd server; npm test` runs isolated HTTP regression tests with mocked database/provider boundaries. Covers anonymous/expired/deleted/unverified sessions, forged owners, invoice detail/deletion isolation, safe profile responses, invalid query inputs, optional-field clearing, and OAuth expiry/replay/wrong-account/redirect rejection. No real database writes, email sends, or payments occur in these tests.

PayPal reference: [official connection URL guidance](https://developer.paypal.com/log-in/build-button/). The configured PayPal application must allow the backend callback URL. Existing identity scopes do not establish that merchant payment permissions are available; merchant onboarding and settlement must be validated in the payment phase. Live OAuth has not been tested.

## Remaining implementation sequence

2. **Payment correctness — implemented locally:** stored checkout records, ownership/reference/amount/currency/merchant matching, replay protection, safe cancellation, authenticated provider webhook handlers and reconciliation endpoints. Regression tests cover forged/mismatched payments, retries and interrupted settlement. Provider registration, scheduler setup, merchant authorization and real sandbox/database validation remain release prerequisites; see `PAYMENT_SETUP.md`. No live transactions or historical data were modified.
3. **Attachment security — implemented locally:** authenticated uploads with ownership records; no arbitrary URL/file attachments; HTML escaping and upload limits.
4. **Structured invoice data — implemented locally:** server-validated line items/tax/totals, currency, shared document model, saved editable drafts and autosave across devices.
5. **Reliable sending — implemented locally:** separate invoice/delivery/payment states, idempotent retries, durable delivery jobs and explicit failures.
6. **Usage and billing — implemented locally:** atomic durable quota accounting, clear failed-send policy, annual Pro entitlement dates, renewal/expiry behavior.
7. **Client management — implemented locally:** standalone client records, create/edit/archive/restore, paginated search and invoice history, and invoice prefill. See `CLIENT_MANAGEMENT.md` for legacy-contact handling and validation.
8. Invoice duplication and unique automatic numbering.
9. Hosted invoice pages with scoped share tokens, PDF downloads and payment links.
10. Manual reminders, then configurable scheduled reminders.
11. Bank-transfer instructions and audited manual payment recording.
12. Multiple currencies with consistent documents and provider amounts.
13. Estimates/pro forma documents and conversion to final invoices.
14. Recurring invoices built on reliable delivery and payment jobs.
15. Global invoice search, richer filters, CSV exports, activity history and selectable-text PDF generation with dependable pagination.
16. Verification resend, expired-session recovery, account email verification and onboarding.
17. Repair lint/typecheck baseline; integration tests for real sandbox providers, delivery, and database concurrency before release.

The earlier product audit is historical. Frontend pagination, draft-preserving templates, responsive layouts, dialogs and several other UI defects were already addressed during the redesign; remaining work above concerns persistence, backend correctness and new product capabilities.

Stages 3–6 deployment requirements, limitations and validation are recorded in `CORE_WORKFLOW_SETUP.md`. Next: invoice duplication and unique automatic numbering.
