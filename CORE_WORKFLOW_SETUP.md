# Drafts, attachments, delivery and billing

Implemented locally; deploy frontend and backend together. The old send-email request body is no longer supported.

## Deployment requirements

- Use MongoDB 5+ with replica-set transactions (including a suitable Atlas cluster). Preparing an invoice atomically freezes its draft, binds its PDF and creates its delivery record. A standalone MongoDB instance cannot run this transaction.
- Set `BACKEND_URL` to the externally reachable API origin. Existing mail and PayPal configuration remains required; see `PAYMENT_SETUP.md`.
- Configure a long random `DELIVERY_RETRY_SECRET`. An external scheduler should POST `/api/deliveries/retry-pending` with `Authorization: Bearer <secret>` every five minutes. No scheduler is registered by this code. Each call handles up to three eligible jobs, with a five-attempt automatic retry limit. Set hosting request timeouts to accommodate provider requests, or move processing to a dedicated worker before production use.
- Validate upload/request limits on the hosting platform. PDFs are limited to 4 MB. Database attachment storage requires capacity monitoring and backups.

## Behavior

- Drafts autosave to the authenticated workspace with revision checks. Conflicting edits are retained on screen and require reloading before another save. Unsaved edits are not an offline queue; save before navigating away. Draft listing currently returns the most recent 100 records.
- Uploads and downloads require the owning verified account. PDFs are bound to a specific draft revision; unsent uploads expire after seven days. Files attached to delivery records are retained. PDF signature/type/size checks are not malware scanning. PDF rendering still happens in the browser; server totals are independently validated, but the server does not attest that uploaded PDF content matches those totals.
- Sending freezes the structured invoice. Delivery and payment states are separate. Existing delivery jobs and PayPal checkout links are reused on retries. Invoices with delivery records cannot currently be deleted; archival is a future improvement.
- `sent` means SMTP accepted the message, not that it reached an inbox. Ambiguous SMTP failures are `unknown` and never automatically resent. Manual retry requires confirmation because the recipient may already have received the first message. Exactly-once SMTP delivery is not guaranteed.
- Free accounts reserve at most ten invoices per signup-anniversary month. Definitive delivery failures release the reservation. Accepted and ambiguous sends retain it; retries reuse it, and deleting an invoice cannot refund usage. Existing invoice logs seed each period's baseline.
- Newly verified Pro purchases grant one year from the later of payment time and current expiry. Receipt replay does not extend access again. Expired entitlements use Free limits. Renewal is manual; no automatic charge is introduced. Legacy Pro accounts without expiry dates keep access until their purchase history can be audited and migrated.

## Validation and release gates

`npm --prefix server test` covers account isolation, draft versions, attachment ownership, invoice validation, payment validation, quota reservation, entitlement replay and delivery retry decisions using mocked database/provider boundaries. These tests do not establish real MongoDB transaction/concurrency behavior or live provider delivery.

Browser fixtures verify autosave, draft rehydration, version conflict handling and mobile/desktop overflow. The frontend production build passes. Before release, run the full save/upload/send/retry/payment flow against an isolated MongoDB replica set, SMTP test account and payment-provider sandboxes. Verify scheduler authentication, process-interruption recovery, hosting timeouts and PDF upload limits. No real email, payment or production data migration was performed during local validation.
