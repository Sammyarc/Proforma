# Payment verification and recovery

## Implemented behavior

New checkouts are stored before a payment link is returned. Each records its provider, owning account, invoice (where applicable), expected USD amount in cents, and a unique reference. PayPal records also store the provider order and receiving merchant returned by the authenticated creation request. Flutterwave purchases store the account email at checkout time.

PayPal settlement verifies the stored order ID, invoice/custom references, receiving merchant, amount, currency, order completion, and final completed capture. Capture requests use a stable idempotency key and the invoice owner's stored PayPal credentials. Cancelling checkout never writes to an invoice.

Flutterwave verification fetches the transaction from the provider and matches its ID, purchase reference, customer email, amount, currency and successful status. Browser verification additionally scopes the purchase to the signed-in account. Unique database indexes prevent a provider order or settlement ID from being attached to multiple checkouts.

Settlement records are saved before applying invoice/account updates. Both updates are idempotent, and an interrupted application can be retried using the stored receipt. New Pro purchases now grant a replay-safe annual entitlement with explicit expiry and manual renewal. Legacy undated Pro accounts remain active pending migration; see `CORE_WORKFLOW_SETUP.md`.

## Provider configuration required before release

Existing provider/API credentials remain unchanged. Configure these additional server variables through the deployment's secret settings; do not commit their values:

| Variable | Purpose |
| --- | --- |
| `PAYPAL_WEBHOOK_ID` | ID of the webhook registered on the same PayPal app/environment used for checkout |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Secret hash configured for the Flutterwave v3 webhook |
| `PAYMENT_RECONCILE_SECRET` | Random secret used by a trusted external scheduler for payment recovery |

Register the following HTTPS endpoints on the deployed API origin:

- `POST /api/payments/webhooks/paypal`: subscribe to `CHECKOUT.ORDER.APPROVED` and `PAYMENT.CAPTURE.COMPLETED`. The handler asks PayPal to verify the signature before processing. An approved event can initiate capture; completion events reverify the full order before settlement.
- `POST /api/payments/webhooks/flutterwave`: handles `charge.completed`. Requires the configured `verif-hash`, then independently verifies the transaction with Flutterwave. Webhook-supplied status or amount is not trusted.

Handlers acknowledge supported events only after processing. Transient failures return 503 so the provider can retry. Unsupported event types are acknowledged without changing payment state. Refund/dispute handling is not implemented in this milestone.

Use a trusted external scheduler to call `POST /api/payments/reconcile-pending` with `Authorization: Bearer <PAYMENT_RECONCILE_SECRET>`. It checks up to five recent pending/unapplied records per invocation, ordered by their last check. The recovery window is 30 days; older unresolved payments need an operator review. Scheduling is not enabled by this repository change.

An authenticated account may also call `POST /api/payments/reconcile` with `{ "reference": "its-checkout-reference" }`. This endpoint only accesses checkouts owned by that account. No customer-facing reconciliation button is added yet.

## Existing data and release verification

- Existing invoices remain unchanged. Historical payment links and upgrade transactions without a checkout record are intentionally not accepted by the new settlement handlers. Before deploying over live traffic, reconcile those transactions against provider records or reissue unpaid invoices after confirming no payment was captured. Do not infer ownership from an arbitrary return URL or grant Pro for an unbound historical transaction.
- Startup creates the checkout uniqueness indexes and fails startup if that cannot complete. Do not disable those indexes; they enforce replay protection across concurrent requests.
- Merchant authorization still needs a real PayPal sandbox check. The earlier identity connection scopes alone do not establish permission to create/capture payments for connected merchants. The application fails on provider errors; it never falls back to charging into a different account.
- The automated tests use mocked provider/database boundaries and do not demonstrate live provider permissions or MongoDB race behavior. Before release, exercise actual sandbox checkout, browser-close recovery, duplicate webhook delivery, concurrent verification, wrong-merchant rejection and interruption recovery against an isolated MongoDB database.

References: [Flutterwave transaction verification](https://developer.flutterwave.com/v3.0.0/docs/transaction-verification), [Flutterwave webhook authentication](https://developer.flutterwave.com/docs/webhooks), [PayPal webhook verification](https://developer.paypal.com/api/webhooks/overview/).
