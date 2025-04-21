import express from "express";
import createTransporter from "./email.config.js";
const router = express.Router();

router.post("/send-email", async (req, res) => {
  const {
    userEmail,
    recipientEmail,
    emailSubject,
    emailBody,
    invoiceUrl,
    invoiceFileName,
    invoiceFileSize,
  } = req.body;

  if (!invoiceUrl) {
    return res.status(400).json({
      error: "Missing invoice URL"
    });
  }

  try {
    const transporter = await createTransporter();

    // build a little “PDF card” in HTML
    const html = `
      <p>${emailBody}</p>
      <div style="border:1px solid #ddd;
    border-radius:8px;
    padding:8px 12px;
    text-decoration:none; font-family: Poppins, sans-serif; width: 300px;">
        <a href="${invoiceUrl}" download="${invoiceFileName}" style="text-decoration: none;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/400px-PDF_file_icon.svg.png" alt="PDF" width="32"
                    style="margin-right:8px" />

                <div style="flex-grow: 1;">
                    <div style="font-weight: 600; color: #666;; margin-bottom: 4px;">${invoiceFileName}</div>
                    <div style="font-size: 14px; color: #666;">
                        <span>PDF</span> •
                        <span>${invoiceFileSize}</span>
                    </div>
                </div>
            </div>
        </a>
    </div>
    `;

    await transporter.sendMail({
      from: userEmail,
      to: recipientEmail,
      subject: emailSubject,
      html,
    });

    res.status(200).json({
      message: "Email sent with invoice link!"
    });
  } catch (error) {
    console.error("Error in send-email:", error);
    res.status(500).json({
      error: "Failed to send email"
    });
  }
});

export default router;