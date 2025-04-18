import express from 'express';
import multer from 'multer';
import createTransporter from './email.config.js';

const router = express.Router();

// Configure multer to handle PDF uploads
const storage = multer.memoryStorage(); // Store file in memory as a buffer
const upload = multer({
  storage
});

router.options('/send-email', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://proforma-gen.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

router.post('/send-email', upload.single('pdf'), async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://proforma-gen.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const {
    userEmail,
    recipientEmail,
    emailSubject,
    emailBody
  } = req.body;
  const pdfBuffer = req.file?.buffer; // Get PDF file buffer

  if (!pdfBuffer) {
    return res.status(400).json({
      error: "No PDF file received"
    });
  }

  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: userEmail,
      to: recipientEmail,
      subject: emailSubject,
      text: emailBody,
      attachments: [{
        filename: "invoice.pdf",
        content: pdfBuffer, // Attach PDF from buffer
        contentType: "application/pdf",
      }, ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Email sent successfully!'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      message: 'Failed to send email',
      error
    });
  }
});

export default router;