import { useEffect, useRef, useState } from "react";
import { SlOptions } from "react-icons/sl";
import { IoIosArrowDown, IoIosArrowRoundBack } from "react-icons/io";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { TbLoader3 } from "react-icons/tb";
import { RiDeleteBin6Line } from "react-icons/ri";
import CloudinaryPdfViewer from "../hooks/CloudinaryPdfViewer";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

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
  const [pageSelected, setPageSelected] = useState("5");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showPageOption, setShowPageOption] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedInvoiceView, setSelectedInvoiceView] = useState(null);
  const { user } = useAuthStore();

  // Animated ellipsis component
  const AnimatedEllipsis = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prevDots) => {
          if (prevDots === "") return ".";
          if (prevDots === ".") return "..";
          if (prevDots === "..") return "...";
          return "";
        });
      }, 600);

      return () => clearInterval(interval);
    }, []);

    return <span className="animated-ellipsis">{dots}</span>;
  };

  const pageDropdownRef = useClickOutside(() => setShowPageOption(false));

  const userId = user?._id;

  // Fetch invoices from backend
  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_URL}/invoices`, {
        params: {
          userId,
        },
      });
      setInvoices(response.data.invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  // Fetch invoices based on ID to display

  const fetchInvoiceById = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/invoices/${id}`, {
        params: { userId },
      });
      setSelectedInvoiceView(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Always load inoice payments on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (userId) {
        await fetchInvoices(); // Make sure this is an async function
      }
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  // Close dropdowns on click outside of dropdown element
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null) {
        const isClickOnButton = event.target.closest(
          'button[class*="focus:outline"]'
        );
        const isClickOnDropdown = event.target.closest(
          'div[class*="absolute right-0"]'
        );

        if (!isClickOnButton && !isClickOnDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  const handlePageSelect = (pageOption) => {
    setPageSelected(pageOption);
    setShowPageOption(false);
  };

  // Calculate pagination
  const itemsPerPage = parseInt(pageSelected);
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = invoices.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const pageOptions = ["5", "10", "15", "20"];

  const handleDelete = async (invoiceId) => {
    try {
      const userId = user?._id;

      if (!userId) {
        toast.error("User not authenticated");
        return;
      }

      // Axios returns response directly for 2xx status codes
      const response = await axios.delete(
        `${API_URL}/invoices/${invoiceId}?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Axios wraps the response in a data property
      toast.success(response.data.message); // "Invoice deleted successfully"

      // Update state
      fetchInvoices();
    } catch (error) {
      console.error("Delete error:", error);

      // Axios error handling
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An error occurred while deleting";

      toast.error(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedInvoiceId(null);
    }
  };

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex flex-col justify-center h-screen items-center space-y-3">
          <TbLoader3 size={30} className="animate-spin text-teal-500" />
          <p className="text-[4vw] font-satoshi md:text-[1vw]">
            Please wait while we load the invoice details
            <AnimatedEllipsis />
          </p>
        </div>
      ) : selectedInvoiceView ? (
        <div>
          <button
            onClick={() => setSelectedInvoiceView(null)}
            className="mt-4 flex items-center hover:underline"
          >
            {" "}
            <IoIosArrowRoundBack size={24} />{" "}
            <span className="text-[4vw] font-satoshi md:text-[1.1vw]">
              Back to payment list
            </span>
          </button>

          <div className="flex flex-col gap-3 mt-[2vw] md:flex-row">
            <div className="grid grid-cols-2 gap-3 md:w-[30vw] md:h-[30vw]">
              <div className="mb-[0.5vw] space-y-1">
                <p className="text-[4.2vw] font-satoshi font-semibold md:text-[1.1vw]">
                  Client Name:
                </p>
                <p className="text-[4vw] text-gray-500 font-satoshi md:text-[1vw]">
                  {selectedInvoiceView.clientName}
                </p>
              </div>
              <div className="mb-[0.5vw] space-y-1">
                <p className="text-[4.2vw] font-satoshi font-semibold md:text-[1.1vw]">
                  Client Email Address:
                </p>
                <p className="text-[4vw] text-gray-500 font-satoshi md:text-[1vw]">
                  {selectedInvoiceView.clientAddress}
                </p>
              </div>
              <div className="mb-[0.5vw] space-y-1">
                <p className="text-[4.2vw] font-satoshi font-semibold md:text-[1.1vw]">
                  Invoice Number:
                </p>
                <p className="text-[4vw] text-gray-500 font-satoshi md:text-[1vw]">
                  {selectedInvoiceView.invoiceNumber}
                </p>
              </div>
              <div className="mb-[0.5vw] space-y-1">
                <p className="text-[4.2vw] font-satoshi font-semibold md:text-[1.1vw]">
                  Description:
                </p>
                <p className="text-[4vw] text-gray-500 font-satoshi md:text-[1vw]">
                  {selectedInvoiceView.description}
                </p>
              </div>
              <div className="mb-[0.5vw] space-y-1">
                <p className="text-[4.2vw] font-satoshi font-semibold md:text-[1.1vw]">
                  Issued Date:
                </p>
                <p className="text-[4vw] text-gray-500 font-satoshi md:text-[1vw]">
                  {new Date(selectedInvoiceView.invoiceDate).toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
              <div className="mb-[0.5vw] space-y-1">
                <p className="text-[4.2vw] font-satoshi font-semibold md:text-[1.1vw]">
                  Due Date:
                </p>
                <p className="text-[4vw] text-gray-500 font-satoshi md:text-[1vw]">
                  {new Date(selectedInvoiceView.dueDate).toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
              <div className="mb-[0.5vw] space-y-1">
                <p className="text-[4.2vw] font-satoshi font-semibold md:text-[1.1vw]">
                  Payment Date:
                </p>
                <p className="text-[4vw] text-gray-500 font-satoshi md:text-[1vw]">
                  {selectedInvoiceView.paidAt
                    ? new Date(selectedInvoiceView.paidAt).toLocaleDateString(
                        "en-GB",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : (selectedInvoiceView.status)}
                </p>
              </div>
              <div className="mb-[0.5vw] space-y-1">
                <p className="text-[4.2vw] font-satoshi font-semibold md:text-[1.1vw]">
                  Payment Method:
                </p>
                <p className="text-[4vw] text-gray-500 font-satoshi md:text-[1vw]">
                  {selectedInvoiceView.paymentMethod}
                </p>
              </div>
              <div className="mb-[0.5vw] space-y-1">
                <p className="text-[4.2vw] font-satoshi font-semibold md:text-[1.1vw]">
                  Payment Id:
                </p>
                <p className="text-[4vw] text-gray-500 font-satoshi md:text-[1vw]">
                  {selectedInvoiceView.paymentId || "N/A"}
                </p>
              </div>
            </div>
            <div className="w-[50vw]">
              <CloudinaryPdfViewer
                pdfUrl={
                  selectedInvoiceView.invoiceUrl ||
                  "https://placehold.co/600x400/png"
                }
                className="w-full h-full object-cover rounded-md"
                alt="Invoice"
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-[4vw] font-satoshi font-bold mb-3 md:text-[2.5vw]">
            Payments
          </h1>
          {loading ? (
            <div className="flex flex-col justify-center items-center space-y-3">
              <TbLoader3 size={30} className="animate-spin text-teal-500" />
              <p className="text-[4vw] font-satoshi md:text-[1vw]">
                Please wait while we load your payment history
                <AnimatedEllipsis />
              </p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-[4vw] text-center py-10 text-gray-600 font-satoshi md:text-[1vw]">
              You have not received any payments yet.
            </div>
          ) : (
            <>
              <div className="w-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-400">
                      <th></th>
                      <th className="py-4 px-3 text-left font-satoshi font-semibold">
                        Client Name
                      </th>
                      <th className="py-4 px-3 text-left font-satoshi font-semibold">
                        Client Email
                      </th>
                      <th className="py-4 px-3 text-left font-satoshi font-semibold">
                        Invoice Number
                      </th>
                      <th className="py-4 px-3 text-left font-satoshi font-semibold">
                        Description
                      </th>
                      <th className="py-4 px-3 text-left font-satoshi font-semibold">
                        Payment Status
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((invoice, index) => (
                      <tr key={index} className="border-b border-gray-400">
                        <td className="py-4 px-3">
                          <div className="relative w-12 h-12 rounded-md">
                            <CloudinaryPdfViewer
                              pdfUrl={
                                invoice.invoiceUrl ||
                                "https://placehold.co/600x400/png"
                              }
                              className="w-full h-full object-cover rounded-md"
                              alt="Invoice"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3 font-satoshi text-gray-600">
                          {invoice.clientName}
                        </td>
                        <td className="py-2 px-3 font-satoshi text-gray-600">
                          {invoice.clientAddress}
                        </td>
                        <td className="py-2 px-3 font-satoshi text-gray-600">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="py-2 px-3 font-satoshi text-gray-600 truncate max-w-[200px]">
                          {invoice.description}
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className={`px-4 py-1 rounded-lg inline-block font-satoshi border min-w-12 text-center text-sm
                    ${
                      invoice.status === "paid"
                        ? "bg-green-300/20 text-green-600 border-green-300"
                        : "bg-yellow-300/20 text-yellow-600 border-yellow-300"
                    }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 relative">
                          <button
                            className="focus:outline-1 p-2 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(index);
                            }}
                          >
                            <SlOptions />
                          </button>
                          {activeDropdown === index && (
                            <div className="absolute right-0 top-15 mt-2 bg-white rounded-md shadow-lg z-10 min-w-32 animate-moveUp">
                              <div
                                className="py-2 px-4 cursor-pointer font-satoshi hover:bg-gray-100 hover:rounded-t"
                                onClick={() => fetchInvoiceById(invoice._id)}
                              >
                                View
                              </div>
                              <div
                                className="py-2 px-4 cursor-pointer font-satoshi hover:bg-gray-100 hover:rounded-b"
                                onClick={() => {
                                  setSelectedInvoiceId(invoice._id);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                Delete
                              </div>
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
                  <span>
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <span className="mx-3">•</span>
                  <span>Showing:</span>
                  <div
                    className="relative inline-block text-left ml-3"
                    ref={pageDropdownRef}
                  >
                    <button
                      onClick={() => setShowPageOption(!showPageOption)}
                      className="flex items-center justify-between w-full text-[4vw] md:text-[1vw] font-satoshi px-2 py-1 rounded-md bg-transparent text-black gap-2 border border-gray-500"
                    >
                      <span className="border-r pr-[0.8vw] border-black h-full font-normal">
                        {pageSelected}
                      </span>
                      <IoIosArrowDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          showPageOption ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    {showPageOption && (
                      <ul className="absolute z-10 bottom-10 w-full bg-white border rounded-lg shadow-lg animate-moveUp">
                        {pageOptions.map((pageOption, idx) => (
                          <li
                            key={idx}
                            onClick={() => handlePageSelect(pageOption)}
                            className="cursor-pointer px-4 py-1 font-satoshi text-sm hover:bg-gray-100"
                          >
                            {pageOption}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex">
                  <button
                    className={`w-8 h-8 flex items-center justify-center bg-transparent border border-gray-400 rounded mx-1 ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center bg-transparent border border-gray-400 rounded mx-1 ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white rounded-lg p-6 w-[80vw] md:w-[30vw]"
              >
                <p className="mb-6 font-satoshi flex justify-center text-[4vw] font-semibold text-gray-800 md:text-[1.1vw]">
                  Are you sure you want to delete this invoice?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setSelectedInvoiceId(null);
                    }}
                    className="px-4 py-2 text-gray-600 border font-satoshi rounded-lg"
                  >
                    Cancel
                  </button>
                  <div className="">
                    <button
                      onClick={() => handleDelete(selectedInvoiceId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-2xl flex justify-center gap-2 items-center"
                    >
                      <RiDeleteBin6Line />
                      <span className="font-satoshi">Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Payments;
