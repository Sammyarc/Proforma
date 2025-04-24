import { useEffect, useRef, useState } from "react";
import { SlOptions } from "react-icons/sl";
import { IoIosArrowDown } from "react-icons/io";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/api/invoice"
    : "https://proforma-h8qh.onrender.com/api/invoice";

axios.defaults.withCredentials = true;

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

const Payments = () => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [limit, setLimit] = useState(5);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showPageOption, setShowPageOption] = useState(false);
  const { user } = useAuthStore();

  const pageDropdownRef = useClickOutside(() => setShowPageOption(false));

  const userId = user?._id; 

  // Fetch invoices from backend
  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_URL}/invoices`, {
        params: {
          userId,
          page: pagination.page,
          limit,
        },
      });
      setInvoices(response.data.invoices);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchInvoices();
    }
  }, [limit, pagination.page]);

  const handlePageSelect = (value) => {
    setLimit(Number(value));
    setShowPageOption(false);
  };

  const toggleDropdown = (id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  const handlePrevious = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNext = () => {
    if (pagination.page < pagination.pages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const pageOptions = ["5", "10", "15", "20"];

  return (
    <div className="p-6">
      <h1 className="text-[4vw] font-satoshi font-bold mb-3 md:text-[2.5vw]">
        Payments
      </h1>
      {invoices.length === 0 ? (
        <div className="text-center py-10 text-gray-600 font-satoshi text-lg">
          You have not received any payments yet.<br />
          Send invoices to clients to track payments here.
        </div>
      ) : (
        <>
      <div className="w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th></th>
              <th className="py-4 px-3 text-left font-satoshi font-semibold">Client Name</th>
              <th className="py-4 px-3 text-left font-satoshi font-semibold">Client Email</th>
              <th className="py-4 px-3 text-left font-satoshi font-semibold">Invoice Number</th>
              <th className="py-4 px-3 text-left font-satoshi font-semibold">Description</th>
              <th className="py-4 px-3 text-left font-satoshi font-semibold">Payment Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="border-b border-gray-800">
                <td className="py-4 px-3">
                  <div className="relative w-24 h-16 overflow-y-scroll scrollbar-hide rounded-md">
                    <iframe src={invoice.invoiceUrl || "https://placehold.co/600x400/png"} className="w-full h-full object-cover rounded-md" alt="Invoice" />
                  </div>
                </td>
                <td className="py-2 px-3 font-satoshi text-gray-600">{invoice.clientName}</td>
                <td className="py-2 px-3 font-satoshi text-gray-600">{invoice.clientAddress}</td>
                <td className="py-2 px-3 font-satoshi text-gray-600">{invoice.invoiceNumber}</td>
                <td className="py-2 px-3 font-satoshi text-gray-600 truncate max-w-[200px]">{invoice.description}</td>
                <td className="py-4 px-3">
                  <span className={`px-4 py-1 rounded-lg inline-block font-satoshi border min-w-12 text-center text-sm
                    ${invoice.status === 'Paid' 
                      ? 'bg-green-300/20 text-green-600 border-green-300' 
                      : 'bg-yellow-300/20 text-yellow-600 border-yellow-300'}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-4 px-3 relative">
                  <button className="focus:outline-1 p-2 rounded-md" onClick={(e) => { e.stopPropagation(); toggleDropdown(invoice._id); }}>
                    <SlOptions />
                  </button>
                  {activeDropdown === invoice._id && (
                    <div className="absolute right-0 top-15 mt-2 bg-white rounded-md shadow-lg z-10 min-w-32 animate-moveUp">
                      <div className="py-2 px-4 cursor-pointer hover:bg-gray-100">View</div>
                      <div className="py-2 px-4 cursor-pointer hover:bg-gray-100">Delete</div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between font-satoshi items-center mt-6">
        <div className="flex items-center">
          <span>Page {pagination.page} of {pagination.pages}</span>
          <span className="mx-3">•</span>
          <span>Showing:</span>
          <div className="relative inline-block text-left ml-3" ref={pageDropdownRef}>
            <button onClick={() => setShowPageOption(!showPageOption)} className="flex items-center justify-between text-sm font-satoshi px-2 py-1 rounded-md border border-gray-500">
              <span className="border-r pr-2">{limit}</span>
              <IoIosArrowDown className={`transition-transform ${showPageOption ? "rotate-180" : "rotate-0"}`} />
            </button>
            {showPageOption && (
              <ul className="absolute z-10 bottom-10 bg-white border rounded-lg shadow-lg">
                {pageOptions.map((opt, idx) => (
                  <li key={idx} onClick={() => handlePageSelect(opt)} className="cursor-pointer px-4 py-1 text-sm hover:bg-gray-100">
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex">
          <button onClick={handlePrevious} className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded mx-1">←</button>
          <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded mx-1">→</button>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Payments;
