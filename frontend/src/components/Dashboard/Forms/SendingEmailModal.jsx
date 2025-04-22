import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import lottie from 'lottie-web';
import generatingAnimation from '../../../assets/animations/generating.json';
import { FaCheck } from "react-icons/fa";
import uploadingAnimation from '../../../assets/animations/uploading.json';
import sendingAnimation from '../../../assets/animations/sending.json';


const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : "https://proforma-backend-sigma.vercel.app/api";

axios.defaults.withCredentials = true;

const SendingEmailModal = ({ onClose, toggleStaticMode }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [sendStatus, setSendStatus] = useState("generating");
  const didSendRef = useRef(false);

  // Automatically start process when modal opens
  useEffect(() => {
    if (!didSendRef.current) {
      didSendRef.current = true;
      handleSendEmail();
    }
  }, []);

  const statusSteps = [
    {
      status: "generating",
      lottieData: generatingAnimation,
      title: "Generating Invoice",
      text: "Preparing your document"
    },
    {
      status: "uploading",
      lottieData: uploadingAnimation,
      title: "Uploading Invoice",
      text: "Saving to cloud storage"
    },
    {
      status: "sending",
      lottieData: sendingAnimation,
      title: "Sending Email",
      text: "Dispatching notification"
    }
  ];

  const getCurrentStep = () => 
    statusSteps.find(step => step.status === sendStatus) || statusSteps[0];

  const LottieAnimation = ({ animationData, width = 200, height = 200}) => {
    const animationContainer = useRef(null);
    
    useEffect(() => {
      const anim = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData
      });
      
      return () => anim.destroy(); // Clean up on unmount
    }, [animationData]);
    
    return <div ref={animationContainer} style={{ width, height }} />;
  };
  

  // Animated ellipsis component
const AnimatedEllipsis = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        if (prevDots === '') return '.';
        if (prevDots === '.') return '..';
        if (prevDots === '..') return '...';
        return '';
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return <span className="animated-ellipsis">{dots}</span>;
};

function getInvoiceFields() {
  const fields = {};
  document
    .querySelectorAll("[data-invoice-field]")
    .forEach(el => {
      const key = el.dataset.invoiceField;  // same as el.getAttribute("data-invoice-field")

      let value = "";
      // 1️ Anchor tags → take the href
      if (el.tagName === "A" && el.href) {
        value = el.href;
      }
      // 2️ Inputs or textareas → take the .value
      else if ("value" in el) {
        value = el.value.trim();
      }
      // 3️ Everything else → innerText
      else {
        value = el.innerText.trim();
      }

      fields[key] = value;
    });

  return fields;
}


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
      scale: 10, 
      useCORS: true,
      logging: false,
      imageTimeout: 0
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 1); // Use JPEG instead of PNG with 100% quality
    
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

    const timestamp = new Date().getTime();
    const uniqueFilename = `invoice_${timestamp}`;

    const form = new FormData();
    form.append("file", pdfBlob);
    form.append("upload_preset", cloudinaryPreset); // ← your preset
    form.append("public_id", uniqueFilename); // ← your public ID
    form.append("filename_override", "invoice.pdf"); // This controls the download filename
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
      if (!json.secure_url) throw new Error("Cloudinary upload failed");
      return { url: json.secure_url, };
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Cloudinary upload failed");
    }
  };

  // Main handler for sending the email
  // This function will be called when the user clicks the "Send Email" button
  const handleSendEmail = async () => {
    const invoiceData = getInvoiceFields();

    setSendStatus("generating");

    try {

      // Ensure invoice element exists
      const pdfBlob = await createPDF();

      // upload PDF
      const { url: invoiceUrl } = await uploadPDFToCloudinary(pdfBlob);

      setSendStatus("sending");
      // send to your backend
      await axios.post(
        `${API_URL}/send-email`,
        {
          invoiceUrl,
          invoiceFileName: "invoice.pdf",
          ...invoiceData,  // spreads in customerName, invoiceNumber, etc.
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toggleStaticMode(false);
     // Success handling
     setIsComplete(true);
     toast.success("Email sent successfully!");
     setTimeout(onClose, 2000); // Close after 2 seconds
    } catch (error) {
      onClose(); // Close modal on error as well
      toggleStaticMode(false);
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      toggleStaticMode(false);
    }
  };

  return createPortal(
    <div className="relative">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm w-full h-full flex justify-center items-center z-[99999]">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white relative p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          {!isComplete ? (
            <div className="flex flex-col items-center space-y-3">
             <LottieAnimation animationData={getCurrentStep().lottieData} />
              <h3 className="text-xl font-satoshi font-semibold">{getCurrentStep().title}</h3>
              <p className="text-gray-600 font-satoshi text-center">
                {getCurrentStep().text}
                <AnimatedEllipsis />
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(statusSteps.findIndex(s => s.status === sendStatus) + 1) * 33.33}%`
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <FaCheck className="text-green-500 text-4xl animate-scale-in" />
              <h3 className="text-xl font-satoshi font-semibold">Process Complete!</h3>
              <p className="text-gray-600 font-satoshi text-center">Invoice sent successfully</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default SendingEmailModal;