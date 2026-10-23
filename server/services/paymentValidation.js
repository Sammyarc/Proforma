export class PaymentMismatch extends Error {}

export function minorUnits(value) {
  const text = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(text))
    throw new PaymentMismatch("Invalid payment amount");
  const [whole, fraction = ""] = text.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount <= 0)
    throw new PaymentMismatch("Invalid payment amount");
  return amount;
}

export function validatePayPalOrder(checkout, order, settled = false) {
  const units = order?.purchase_units;
  if (
    order?.id !== checkout.providerId ||
    !Array.isArray(units) ||
    units.length !== 1
  )
    throw new PaymentMismatch("Order does not match checkout");
  const unit = units[0];
  if (
    unit.invoice_id !== checkout.invoiceId ||
    unit.custom_id !== checkout.invoiceId ||
    !checkout.merchantId ||
    unit.payee?.merchant_id !== checkout.merchantId ||
    unit.amount?.currency_code !== checkout.currency ||
    minorUnits(unit.amount?.value) !== checkout.amountMinor
  ) {
    throw new PaymentMismatch("Invoice, merchant, amount or currency mismatch");
  }
  if (!settled) return;
  const captures = unit.payments?.captures;
  if (
    order.status !== "COMPLETED" ||
    !Array.isArray(captures) ||
    captures.length !== 1
  )
    throw new PaymentMismatch("Payment is not fully captured");
  const capture = captures[0];
  if (
    !capture.id ||
    capture.status !== "COMPLETED" ||
    capture.final_capture !== true ||
    capture.amount?.currency_code !== checkout.currency ||
    minorUnits(capture.amount?.value) !== checkout.amountMinor
  ) {
    throw new PaymentMismatch("Capture does not match checkout");
  }
  return capture.id;
}

export function validateFlutterwave(checkout, payment, transactionId) {
  if (
    !checkout ||
    checkout.provider !== "flutterwave" ||
    String(payment?.id) !== String(transactionId) ||
    payment.status !== "successful" ||
    payment.tx_ref !== checkout.reference ||
    payment.currency !== checkout.currency ||
    minorUnits(payment.amount) !== checkout.amountMinor ||
    typeof payment.customer?.email !== "string" ||
    payment.customer.email.toLowerCase() !== checkout.customerEmail ||
    (checkout.providerId && checkout.providerId !== String(transactionId))
  ) {
    throw new PaymentMismatch("Payment does not match upgrade purchase");
  }
}
