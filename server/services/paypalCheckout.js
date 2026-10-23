import Checkout from "../models/checkout.model.js";
import { minorUnits, validatePayPalOrder } from "./paymentValidation.js";
import { getValidPayPalAccessToken } from "./paypalClient.js";
// Function to generate PayPal payment link
export async function generatePayPalPaymentLink(invoiceDetails) {
  try {
    if (!invoiceDetails.userId) {
      throw new Error("Missing userId required for token retrieval");
    }

    // Get valid (and decrypted) access token from helper
    const accessToken = await getValidPayPalAccessToken(invoiceDetails.userId);

    if (!accessToken) {
      throw new Error("Failed to obtain valid PayPal access token");
    }

    // Validate invoice details
    if (
      !invoiceDetails.invoiceNumber ||
      typeof invoiceDetails.invoiceNumber !== "string" ||
      !invoiceDetails.invoiceNumber.trim()
    ) {
      throw new Error("Missing or invalid invoice number");
    }

    if (!invoiceDetails.amount || isNaN(parseFloat(invoiceDetails.amount))) {
      throw new Error("Missing or invalid invoice amount");
    }

    if (
      !invoiceDetails.description ||
      typeof invoiceDetails.description !== "string"
    ) {
      invoiceDetails.description = `Invoice ${invoiceDetails.invoiceNumber}`;
    }

    if (
      !invoiceDetails.companyName ||
      typeof invoiceDetails.companyName !== "string"
    ) {
      invoiceDetails.companyName = "Proforma";
    }

    const paypalApiUrl = `${process.env.PAYPAL_API_URL}/v2/checkout/orders`;

    const amount = parseFloat(
      String(invoiceDetails.amount).replace(/[^0-9.]/g, ""),
    ).toFixed(2);

    let checkout = await Checkout.findOne({ reference: "invoice-" + invoiceDetails._id, userId: invoiceDetails.userId });
    if (checkout && (checkout.amountMinor !== minorUnits(amount) || checkout.invoiceId !== String(invoiceDetails._id))) throw new Error("Checkout does not match invoice");
    if (checkout?.approvalUrl) return checkout.approvalUrl;
    if (!checkout) checkout = await Checkout.create({
      provider: "paypal",
      reference: "invoice-" + invoiceDetails._id,
      userId: invoiceDetails.userId,
      invoiceId: String(invoiceDetails._id),
      amountMinor: minorUnits(amount),
      currency: "USD",
    });
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: amount,
              },
            },
          },
          description: invoiceDetails.description.substring(0, 127),
          invoice_id: invoiceDetails._id.toString(),
          custom_id: invoiceDetails._id.toString(),
        },
      ],
      application_context: {
        brand_name: invoiceDetails.companyName.substring(0, 127),
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${process.env.BACKEND_URL}/api/payments/success?invoiceId=${invoiceDetails._id}`,
        cancel_url: `${process.env.BACKEND_URL}/api/payments/cancel?invoiceId=${invoiceDetails._id}`,
      },
    };

    const response = await fetch(paypalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": checkout.reference,
        Prefer: "return=representation",
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(`PayPal API error (${response.status}): ${errorMessage}`);
    }

    const orderData = await response.json();
    const approvalLink = orderData.links.find((link) => link.rel === "approve");

    if (!approvalLink?.href) {
      throw new Error(
        "Payment system error: Missing approval link in PayPal response",
      );
    }

    const unit = orderData.purchase_units?.[0];
    if (!orderData.id || !unit?.payee?.merchant_id)
      throw new Error("PayPal did not identify the receiving merchant");
    checkout.providerId = orderData.id;
    checkout.merchantId = unit.payee.merchant_id;
    validatePayPalOrder(checkout, orderData);
    checkout.approvalUrl = approvalLink.href;
    await checkout.save();
    return approvalLink.href;
  } catch (error) {
    console.error("Payment link generation failed:", error);
    throw error;
  }
}
