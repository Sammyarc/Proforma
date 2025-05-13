import { useEffect, useRef, useState } from "react";
import { AiOutlineFilePdf } from "react-icons/ai";
import { MdOutlineAttachEmail } from "react-icons/md";

// Click Outside Hook
const useClickOutside = (handler) => {
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handler]);

  return ref;
};

const Export = ({ onExportPDF, onExportEmail, isExporting, onClose }) => {
  const [selectedOption, setSelectedOption] = useState("");

  // Use the hook
  const ref = useClickOutside(() => {
    if (onClose) onClose(); // Call parent function to close popup
  });

  const handleCheckboxChange = (option) => {
    setSelectedOption((prev) => (prev === option ? "" : option));
  };

  const handleExport = () => {
    if (selectedOption === "pdf") {
      onExportPDF();
    } else if (selectedOption === "email") {
      onExportEmail();
    }
  };

  return (
    <div
      ref={ref}
      className="absolute z-[10] right-0 mt-[1vw] w-64 bg-white text-black rounded-md shadow-lg md:w-[25vw] md:rounded-lg animate-moveUp"
    >
      <div className="bg-white py-[2vw] px-[1vw] rounded-lg">
        {/* Export as PDF */}
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="pdf" className="flex items-center space-x-2">
            <AiOutlineFilePdf size={30} className="text-teal-600" />
            <div className="flex flex-col">
              <span className="text-[4vw] text-teal-600 font-satoshi md:text-[1vw]">
                Export as PDF
              </span>
              <span className="text-[4vw] text-gray-500 font-satoshi md:text-[0.8vw]">
                Standard document format
              </span>
            </div>
          </label>
          <input
            type="checkbox"
            id="pdf"
            checked={selectedOption === "pdf"}
            onChange={() => handleCheckboxChange("pdf")}
            className="w-4 h-4 accent-cyan-700"
          />
        </div>

        {/* Export and Email */}
        <div className="flex items-center justify-between space-x-2 mb-6">
          <label htmlFor="email" className="flex items-center space-x-2">
            <MdOutlineAttachEmail size={30} className="text-zinc-900" />
            <div className="flex flex-col">
              <span className="text-[4vw] text-zinc-800 font-satoshi md:text-[1vw]">
                Generate and send as Email
              </span>
              <span className="text-[4vw] text-gray-500 font-satoshi md:text-[0.8vw]">
                Send to clients via email
              </span>
            </div>
          </label>
          <input
            type="checkbox"
            id="email"
            checked={selectedOption === "email"}
            onChange={() => handleCheckboxChange("email")}
            className="w-4 h-4 accent-cyan-700"
          />
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={!selectedOption}
          className={`w-full px-4 font-satoshi box py-2 text-white rounded-xl ${
            !selectedOption ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-700"
          } ${isExporting ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-700"}`}
        >
          <span>
            <span>
              {isExporting
                ? selectedOption === "email"
                  ? "Generating and Sending..."
                  : selectedOption === "pdf"
                  ? "Generating and Exporting PDF..."
                  : "Processing..."
                : selectedOption === "email"
                ? "Generate and Send Mail"
                : selectedOption === "pdf"
                ? "Export as PDF"
                : "Select an Option"}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default Export;
