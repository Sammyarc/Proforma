import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { LiaSpinnerSolid } from "react-icons/lia";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : "https://proforma-backend-sigma.vercel.app/api";

axios.defaults.withCredentials = true;

const EmailInput = ({ onClose, toggleStaticMode }) => {
  const [userEmail, setUserEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendStatus, setSendStatus] = useState(""); // "generating", "sending", "waiting"

  const getInvoiceAmount = () => {
    const invoiceElement = document.getElementById("invoice");
    const totalAmountEl = invoiceElement?.querySelector('[data-total="true"]');
    return totalAmountEl?.innerText.trim() || "0.00";
  };

  const invoiceAmount = getInvoiceAmount();

  const toggleShowSending = () => {
    setIsSendingEmail(!isSendingEmail);
  };

  // Generate the PDF blob from the invoice DOM
  const createPDF = async () => {
    toggleStaticMode(true);
    const invoiceElement = document.getElementById("invoice");
    if (!invoiceElement) throw new Error("Invoice element not found");
    
    // Create a new PDF document with compression enabled
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm", 
      format: "a4",
      compress: true
    });
    
    // Use a lower scale factor for the HTML to canvas conversion
    const canvas = await html2canvas(invoiceElement, { 
      scale: 1.5,  // Reduced from 2 for smaller image size
      useCORS: true,
      logging: false,
      imageTimeout: 0
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 0.8); // Use JPEG instead of PNG with 80% quality
    
    const imgWidth = 210; // A4 width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image with compression options
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    
    const blob = pdf.output("blob");
    toggleStaticMode(false);
    return blob;
  };

  // Upload the blob to Cloudinary
  const uploadPDFToCloudinary = async (pdfBlob) => {
    setSendStatus("uploading");

    // Ensure environment variables are defined
    const cloudinaryPreset = import.meta.env.VITE_CLOUDINARY_PRESET;
    const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudinaryPreset || !cloudinaryCloudName) {
      throw new Error("Cloudinary environment variables are not set");
    }

    const form = new FormData();
    form.append("file", pdfBlob);
    form.append("upload_preset", cloudinaryPreset); // ← your preset
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`,
        {
          method: "POST",
          body: form,
        }
      );
      if (!response.ok) throw new Error("Cloudinary upload failed");
      const json = await response.json();
      console.log(json);
      if (!json.secure_url) throw new Error("Cloudinary upload failed");
      return { url: json.secure_url, bytes: json.bytes };
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Cloudinary upload failed");
    }
  };

  // Main handler for sending the email
  // This function will be called when the user clicks the "Send Email" button
  const handleSendEmail = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail || !recipientEmail || !emailSubject || !emailBody) {
      toast.warn("Please fill all fields");
      return;
    }

    if (!emailRegex.test(userEmail) || !emailRegex.test(recipientEmail)) {
      toast.warn("Please enter a valid email address");
      return;
    }

    toggleShowSending();
    setSendStatus("generating");

    try {

      // Ensure invoice element exists
      const pdfBlob = await createPDF();

      // upload PDF
      const { url: invoiceUrl, bytes } = await uploadPDFToCloudinary(pdfBlob,);
      const fileSizeMB = (bytes / 1024 / 1024).toFixed(2);
      console.log("PDF uploaded to Cloudinary:", invoiceUrl, fileSizeMB);

      setSendStatus("sending");
      // send to your backend
      await axios.post(
        `${API_URL}/send-email`,
        {
          userEmail,
          recipientEmail,
          emailSubject,
          emailBody,
          invoiceAmount,
          invoiceUrl,
          invoiceFileName: "invoice.pdf",
          invoiceFileSize: `${fileSizeMB} MB`,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success("Email sent successfully!");
      onClose(); // Close modal on success
      toggleStaticMode(false);
    } catch (error) {
      onClose(); // Close modal on error as well
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      toggleShowSending();
      setSendStatus("");
    }
  };

  return createPortal(
    <div className="relative">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm w-full h-full flex justify-center items-center z-[99999]">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.6,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="bg-white relative p-6 rounded-xl shadow-lg w-[40vw]"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 border border-neutral-500 box rounded-xl text-gray-500 hover:text-gray-800"
          >
            <IoIosClose size={30} />
          </button>
          <h2 className="text-[4vw] font-semibold font-satoshi mb-4 md:text-[1.5vw]">
            Send PDF via Email
          </h2>
          <div className="flex flex-col space-y-[2vw] mt-[2vw] mb-[1vw]">
            {/* Email Inputs in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Email */}
              <div className="flex flex-col space-y-[0.3vw]">
                <label
                  htmlFor="userEmail"
                  className="text-[4vw] font-satoshi font-bold text-gray-800 md:text-[1vw]"
                >
                  Your Email:
                </label>
                <input
                  type="email"
                  id="userEmail"
                  placeholder="Your Email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="text-[4vw] border border-neutral-500 font-satoshi p-2 rounded-lg outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 w-full md:text-[1vw]"
                />
              </div>

              {/* Recipient Email */}
              <div className="flex flex-col space-y-[0.3vw]">
                <label
                  htmlFor="recipientEmail"
                  className="text-[4vw] font-satoshi font-bold text-gray-800 md:text-[1vw]"
                >
                  Recipient Email:
                </label>
                <input
                  type="email"
                  id="recipientEmail"
                  placeholder="Recipient Email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="text-[4vw] border border-neutral-500 font-satoshi p-2 rounded-lg outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 w-full md:text-[1vw]"
                />
              </div>
            </div>

            {/* Email Subject */}
            <div className="flex flex-col space-y-[0.3vw]">
              <label
                htmlFor="emailSubject"
                className="text-[4vw] font-satoshi font-bold text-gray-800 md:text-[1vw]"
              >
                Subject:
              </label>
              <input
                type="text"
                id="emailSubject"
                placeholder="Email Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="text-[4vw] border border-neutral-500 font-satoshi p-2 rounded-lg outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 w-full md:text-[1vw]"
              />
            </div>

            {/* Email Body */}
            <div className="flex flex-col space-y-[0.3vw]">
              <label
                htmlFor="emailBody"
                className="text-[4vw] font-satoshi font-bold text-gray-800 md:text-[1vw]"
              >
                Body:
              </label>
              <textarea
                id="emailBody"
                placeholder="Message"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="text-[4vw] border border-neutral-500 font-satoshi p-2 rounded-lg outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 w-full md:text-[1vw]"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendEmail}
              disabled={
                !userEmail ||
                !recipientEmail ||
                !emailSubject ||
                !emailBody ||
                isSendingEmail
              }
              className={`box font-satoshi ml-auto text-white px-[2.5vw] py-2 rounded-xl ${
                isSendingEmail ||
                !userEmail ||
                !recipientEmail ||
                !emailSubject ||
                !emailBody
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-neutral-600"
              }`}
            >
              {isSendingEmail ? (
                <div className="flex items-center justify-center space-x-2">
                  <LiaSpinnerSolid className="animate-spin" size={30} />
                  <span>
                    {sendStatus === "generating" && "Generating invoice..."}
                    {sendStatus === "uploading" && "Uploading invoice..."}
                    {sendStatus === "sending" && "Sending email..."}
                  </span>
                </div>
              ) : (
                "Send mail"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>,

    document.getElementById("modal-root")
  );
};

export default EmailInput;
