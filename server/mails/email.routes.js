import express from "express";
import createTransporter from "./email.config.js";
import Invoice from "../models/invoice.model.js";
import { User } from '../models/user.model.js';
import { PAYMENT_TEMPLATE } from "./emailTemplates.js";
const router = express.Router();

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Could not fetch user');
  }
};

// Function to generate PayPal payment link
async function generatePayPalPaymentLink(invoiceDetails) {
  try {
    // Check if userId exists before passing it to getValidAccessToken
    if (!invoiceDetails.userId) {
      throw new Error("Missing userId required for token retrieval");
    }

    const user = await getUserById(invoiceDetails.userId); 

    const accessToken = user.paypal?.accessToken;

    
    if (!accessToken) {
      throw new Error("Failed to obtain valid PayPal access token");
    }
    
    // Validate critical fields with null/undefined checks
    if (!invoiceDetails.invoiceNumber || typeof invoiceDetails.invoiceNumber !== 'string' || !invoiceDetails.invoiceNumber.trim()) {
      throw new Error("Missing or invalid invoice number");
    }
    
    if (!invoiceDetails.amount || isNaN(parseFloat(invoiceDetails.amount))) {
      throw new Error("Missing or invalid invoice amount");
    }
    
    if (!invoiceDetails.description || typeof invoiceDetails.description !== 'string') {
      invoiceDetails.description = `Invoice ${invoiceDetails.invoiceNumber}`;
    }
    
    if (!invoiceDetails.companyName || typeof invoiceDetails.companyName !== 'string') {
      invoiceDetails.companyName = "Proforma";
    }

    const paypalApiUrl = `${process.env.PAYPAL_API_URL}/v2/checkout/orders`;
    
    // Ensure amount is properly formatted - handle any non-numeric characters
    const amount = parseFloat(String(invoiceDetails.amount).replace(/[^0-9.]/g, '')).toFixed(2);
    
    // PayPal requires specific numeric formats as strings
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: amount,
          breakdown: {
            item_total: {  // Required for proper amount validation
              currency_code: "USD",
              value: amount
            }
          }
        },
        description: invoiceDetails.description.substring(0, 127), // Truncate to 127 chars
        invoice_id: invoiceDetails.invoiceNumber.substring(0, 127),
        custom_id: invoiceDetails.invoiceNumber.substring(0, 127)
      }],
      application_context: {
        brand_name: invoiceDetails.companyName.substring(0, 127),
        shipping_preference: "NO_SHIPPING", // Required for digital goods
        user_action: "PAY_NOW", // Makes button text clearer
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
      }
    };

    const response = await fetch(paypalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `${invoiceDetails.invoiceNumber}-${Date.now()}` // Unique ID for idempotency
      },
      body: JSON.stringify(orderPayload)
    });

    // Improved error handling with more detailed information
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        errorMessage = await response.text();
      }
      console.error(`PayPal API error (${response.status}):`, errorMessage);
      throw new Error(`PayPal API error (${response.status}): ${errorMessage}`);
    }

    const orderData = await response.json();
    
    // Find the approval URL with better error handling
    const approvalLink = orderData.links.find(link => link.rel === "approve");
    
    if (!approvalLink || !approvalLink.href) {
      console.error("PayPal response missing approval link:", JSON.stringify(orderData));
      throw new Error("Payment system error: Missing approval link in PayPal response");
    }
    
    return approvalLink.href;
  } catch (error) {
    console.error("Payment link generation failed:", error);
    throw error; // Maintain the original error for better debugging
  }
}

router.post("/send-email", async (req, res) => {
  const {
    invoiceUrl,
    invoiceFileName,
    clientAddress,
    clientName,
    companyAddress,
    companyName,
    description,
    dueDate,
    invoiceAmount,
    invoiceDate,
    invoiceNumber,
    userId
  } = req.body;
  
  // Validate required fields 
  if (!invoiceUrl) {
    return res.status(400).json({
      error: "Missing invoice URL"
    });
  }

  try {
    // Always generate PayPal payment link for each email
    let paymentLink;
    try {
      paymentLink = await generatePayPalPaymentLink({
        amount: invoiceAmount.replace(/[^0-9.]/g, ''), // Strip currency symbols
        description: description || `Invoice ${invoiceNumber}`,
        invoiceNumber: invoiceNumber,
        companyName: companyName,
        userId
      });
      console.log("Generated PayPal payment link:", paymentLink);
    } catch (paypalError) {
      console.error("Failed to generate PayPal payment link:", paypalError);
      throw new Error("Failed to generate PayPal payment link");
    }

    const transporter = await createTransporter();

    const html = PAYMENT_TEMPLATE.replace("{companyName}", companyName).replace("{clientName}", clientName)
      .replace("{invoiceNumber}", invoiceNumber).replace("{invoiceDate}", invoiceDate).replace("{dueDate}", dueDate)
      .replace("{invoiceAmount}", invoiceAmount).replace("{description}", description).replace("{paymentLink}", paymentLink).replace("{companyAddress}", companyAddress)

    const mailOptions = {
      from: {
        name: "Proforma",
        address: process.env.EMAIL
      },
      to: clientAddress,
      subject: `Invoice ${invoiceNumber} from ${companyName}`,
      html,
      attachments: [{
        filename: invoiceFileName || `Invoice-${invoiceNumber}.pdf`,
        path: invoiceUrl,
        contentType: "application/pdf"
      }],
      headers: {
        'X-Entity-Ref-ID': `invoice-${invoiceNumber}`,
        'List-Unsubscribe': `<mailto:${process.env.EMAIL}?subject=unsubscribe>`
      }
    };

    await transporter.sendMail(mailOptions);

    // Convert string amount to numeric for database storage
    const amountNumeric = parseFloat(invoiceAmount.replace(/[^0-9.]/g, ''));

      // Store the invoice data in MongoDB
      const invoiceData = new Invoice({
        userId,
        invoiceNumber,
        clientName,
        clientAddress,
        companyName,
        companyAddress,
        description,
        amountNumeric,
        invoiceDate,
        dueDate,
        paymentLink,
        invoiceUrl,
        invoiceFileName: invoiceFileName || `Invoice-${invoiceNumber}.pdf`,
        sentDate: new Date()
      });
    
      await invoiceData.save();

    res.status(200).json({
      message: "Email sent successfully with invoice attachment",
      paymentLinkGenerated: !!paymentLink
    });
  } catch (error) {
    console.error("Error in send-email:", error);
    res.status(500).json({
      error: "Failed to send email",
      details: error.message
    });
  }
});

export default router;