import {useState} from "react";
import {IoIosClose} from "react-icons/io";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import {toast} from "react-toastify";
import {motion} from "framer-motion";
import {createPortal} from 'react-dom';
import { LiaSpinnerSolid } from "react-icons/lia";

const API_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:3000/api'
    : 'https://proforma-backend-sigma.vercel.app/api';

axios.defaults.withCredentials = true;

const EmailInput = ({onClose, toggleStaticMode}) => {
    const [userEmail, setUserEmail] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const toggleShowSending = () => {
        setIsSendingEmail(!isSendingEmail);
    };

    const handleSendEmail = async () => {
        if (!userEmail || !recipientEmail || !emailSubject || !emailBody) {
            toast.warn("Please fill all fields.");
            return;
        }

        try {
            toggleShowSending();
            const pdfBlob = await createPDF();
            const formData = new FormData();
            formData.append("pdf", pdfBlob, "invoice.pdf");
            formData.append("userEmail", userEmail);
            formData.append("recipientEmail", recipientEmail);
            formData.append("emailSubject", emailSubject);
            formData.append("emailBody", emailBody);

            const response = await axios.post(`${API_URL}/send-email`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log("Email sent:", response.data);
            toast.success("Email sent successfully!"); // Success notification
            onClose(); // Close the modal after successful send
        } catch (error) {
            console.error("Error sending email:", error);
            toast.error("Failed to send email. Please try again."); // Error notification
        } finally {
            toggleShowSending();
        }
    };

    const createPDF = async () => {
        toggleStaticMode(true);
        const invoiceElement = document.getElementById("invoice");

        const canvas = await html2canvas(invoiceElement, {scale: 2});
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

        const pdfBlob = pdf.output("blob"); // Generate the Blob
        toggleStaticMode(false);

        return pdfBlob; // Return the Blob for email sending
    };

    return createPortal(
        <div className="relative">
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm w-full h-full flex justify-center items-center z-[99999]">
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.6
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.8
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeOut"
                    }}
                    className="bg-white relative p-6 rounded-xl shadow-lg w-[40vw]">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1 border border-neutral-500 box rounded-xl text-gray-500 hover:text-gray-800">
                        <IoIosClose size={30}/>
                    </button>
                    <h2 className="text-[4vw] font-semibold font-satoshi mb-4 md:text-[1.5vw]">Send PDF via Email</h2>
                    <div className="flex flex-col space-y-[2vw] mt-[2vw] mb-[1vw]">
                        {/* Email Inputs in Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* User Email */}
                            <div className="flex flex-col space-y-[0.3vw]">
                                <label
                                    htmlFor="userEmail"
                                    className="text-[4vw] font-satoshi font-bold text-gray-800 md:text-[1vw]">
                                    Your Email:
                                </label>
                                <input
                                    type="email"
                                    id="userEmail"
                                    placeholder="Your Email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="text-[4vw] border border-neutral-500 font-satoshi p-2 rounded-lg outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 w-full md:text-[1vw]"/>
                            </div>

                            {/* Recipient Email */}
                            <div className="flex flex-col space-y-[0.3vw]">
                                <label
                                    htmlFor="recipientEmail"
                                    className="text-[4vw] font-satoshi font-bold text-gray-800 md:text-[1vw]">
                                    Recipient Email:
                                </label>
                                <input
                                    type="email"
                                    id="recipientEmail"
                                    placeholder="Recipient Email"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    className="text-[4vw] border border-neutral-500 font-satoshi p-2 rounded-lg outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 w-full md:text-[1vw]"/>
                            </div>
                        </div>

                        {/* Email Subject */}
                        <div className="flex flex-col space-y-[0.3vw]">
                            <label
                                htmlFor="emailSubject"
                                className="text-[4vw] font-satoshi font-bold text-gray-800 md:text-[1vw]">
                                Subject:
                            </label>
                            <input
                                type="text"
                                id="emailSubject"
                                placeholder="Email Subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                className="text-[4vw] border border-neutral-500 font-satoshi p-2 rounded-lg outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 w-full md:text-[1vw]"/>
                        </div>

                        {/* Email Body */}
                        <div className="flex flex-col space-y-[0.3vw]">
                            <label
                                htmlFor="emailBody"
                                className="text-[4vw] font-satoshi font-bold text-gray-800 md:text-[1vw]">
                                Body:
                            </label>
                            <textarea
                                id="emailBody"
                                placeholder="Message"
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                className="text-[4vw] border border-neutral-500 font-satoshi p-2 rounded-lg outline-none hover:outline hover:outline-2 hover:outline-neutral-700 focus:outline focus:outline-2 focus:outline-neutral-700 w-full md:text-[1vw]"/>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSendEmail}
                            disabled={!userEmail || !recipientEmail || !emailSubject || !emailBody || isSendingEmail}
                            className={`box font-satoshi w-52 ml-auto text-white px-4 py-2 rounded-xl ${isSendingEmail || !userEmail || !recipientEmail || !emailSubject || !emailBody
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-neutral-600"}`}>
                            {
                                isSendingEmail
                                    ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <LiaSpinnerSolid className="animate-spin" size={30}/>
                                            <span>Sending Email...</span>
                                        </div>
                                    )
                                    : ("Send")
                            }
                        </button>
                    </div>

                </motion.div>
            </div>
        </div>,

        document.getElementById(
            'modal-root'
        )
    );
};

export default EmailInput;
