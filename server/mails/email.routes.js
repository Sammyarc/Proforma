import express from "express";
import createTransporter from "./email.config.js";
const router = express.Router();

router.post("/send-email", async (req, res) => {
  const {
    invoiceUrl,
    invoiceFileName,
    invoiceFileSize,
    companyName,
    invoiceDate,
    dueDate,
    companyAddress,
    clientAddress,
    clientName,
    invoiceNumber,
    invoiceAmount,
    description,
    paymentLink
  } = req.body;

  if (!invoiceUrl) {
    return res.status(400).json({
      error: "Missing invoice URL"
    });
  }

  const year = new Date().getFullYear();

  try {
    const transporter = await createTransporter();

    // Improved HTML template with better spam score
    const html = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Invoice from ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; border: 0; border-spacing: 0; background-color: #ffffff;">
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 15px 10px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
                                <!-- Greeting -->
                                <tr>
                                    <td style="padding: 0 0 20px 0;">
                                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Hello ${clientName},</p>
                                    </td>
                                </tr>
                                
                                <!-- Main Message -->
                                <tr>
                                    <td style="padding: 0 0 20px 0;">
                                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Thank you for your business. Your invoice #${invoiceNumber} for ${description} is attached to this email. The total amount due is ${invoiceAmount}.</p>
                                    </td>
                                </tr>
                                
                                <!-- Invoice Summary -->
                                <tr>
                                    <td style="padding: 15px 0;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #dddddd; margin-bottom: 20px;">
                                            <tr>
                                                <th style="padding: 10px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dddddd; font-size: 14px;">Invoice Number:</th>
                                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dddddd; font-size: 14px;">${invoiceNumber}</td>
                                            </tr>
                                            <tr>
                                                <th style="padding: 10px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dddddd; font-size: 14px;">Issue Date:</th>
                                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dddddd; font-size: 14px;">${invoiceDate}</td>
                                            </tr>
                                            <tr>
                                                <th style="padding: 10px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dddddd; font-size: 14px;">Due Date:</th>
                                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dddddd; font-size: 14px;">${dueDate}</td>
                                            </tr>
                                            <tr>
                                                <th style="padding: 10px; text-align: left; background-color: #f8f9fa; font-size: 16px; font-weight: bold;">Total Amount:</th>
                                                <td style="padding: 10px; text-align: right; font-size: 16px; font-weight: bold;">${invoiceAmount}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Payment CTA -->
                                ${paymentLink ? `
                                <tr>
                                    <td style="padding: 20px 0;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 24px;">To make payment, please click the button below:</p>
                                                    <a href="${paymentLink}" style="background-color: #1d604b; border: none; color: white; padding: 12px 28px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; font-weight: bold; border-radius: 4px;">Pay Invoice Now</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                ` : ''}
                                
                                <!-- Additional Instructions -->
                                <tr>
                                    <td style="padding: 20px 0 0 0;">
                                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Please review the attached PDF for a detailed breakdown of your invoice.</p>
                                        <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px;">If you have any questions about this invoice, please contact us at <a href="mailto:${companyAddress}" style="color: #1d604b; text-decoration: underline;">${companyAddress}</a>.</p>
                                    </td>
                                </tr>
                                
                                <!-- Thank You Message -->
                                <tr>
                                    <td style="padding: 25px 0 0 0;">
                                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Thank you for your business.</p>
                                        <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 24px;">Best regards,<br>Proforma Team</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const mailOptions = {
      from: {
        name: "Proforma",
        address: process.env.EMAIL
      },
      to: clientAddress,
      subject: `Invoice ${invoiceNumber} from ${companyName}`,
      html,
      attachments: [
        {
          filename: invoiceFileName || `Invoice-${invoiceNumber}.pdf`,
          path: invoiceUrl,
          contentType: "application/pdf"
        }
      ],
      headers: {
        // Adding DKIM-friendly headers
        'X-Entity-Ref-ID': `invoice-${invoiceNumber}`,
        'List-Unsubscribe': `<mailto:${process.env.EMAIL}?subject=unsubscribe>`
      }
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Email sent successfully with invoice attachment"
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