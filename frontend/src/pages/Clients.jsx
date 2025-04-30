import { GrSend } from "react-icons/gr";
import { SlOptions } from "react-icons/sl";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import axios from "axios"; // Make sure axios is installed
import { TbLoader3 } from "react-icons/tb";
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

const Clients = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Sort by: Latest");
  const [showPageOption, setShowPageOption] = useState(false);
  const [pageSelected, setPageSelected] = useState("5");
  const [currentPage, setCurrentPage] = useState(1);
  const [clientData, setClientData] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const navigate = useNavigate();

  const sortDropdownRef = useClickOutside(() => setIsOpen(false));
  const pageDropdownRef = useClickOutside(() => setShowPageOption(false));

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

  const userId = user?._id;

  // Fetch client data from the API
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/invoices/clients`, {
          params: {
            userId,
          },
        });

        if (response.data.success) {
          setClientData(response.data.clients);
          setTotalClients(response.data.totalClients);
        } else {
          throw new Error("Failed to fetch client data");
        }
      } catch (err) {
        throw new Error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  // Handle sort order change
  useEffect(() => {
    if (clientData.length > 0) {
      let sortedData = [...clientData];

      if (selected === "Sort by: Latest") {
        // Sort by most recent (assuming we'd have a date field)
        // For now just reverse the array to simulate this
        sortedData = sortedData.reverse();
      } else if (selected === "Sort by: Oldest") {
        // Keep original order (simulating oldest first)
      }

      setClientData(sortedData);
    }
  }, [selected]);

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

  const options = ["Sort by: Latest", "Sort by: Oldest"];
  const pageOptions = ["5", "10", "15", "20"];

  const handlePageSelect = (pageOption) => {
    setPageSelected(pageOption);
    setShowPageOption(false);
  };

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  // Calculate pagination
  const itemsPerPage = parseInt(pageSelected);
  const totalPages = Math.ceil(clientData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = clientData.slice(startIndex, endIndex);

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

  const formatInvoiceText = (count) => {
    return `${count} invoice${count === 1 ? "" : "s"}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[4vw] font-satoshi font-bold md:text-[2.5vw]">
            Clients
          </h1>
          <p className="text-base mt-2 font-satoshi">{totalClients} total</p>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard/invoices")}
            className="py-[0.6vw] px-[1.5vw] flex items-center box font-satoshi border border-gray-400 rounded-xl mr-[0.8vw]"
          >
            <span className="mr-2 font-satoshi text-base">Send Invoice</span>
            <GrSend size={23} className="text-gray-700" />
          </button>
          <div
            className="relative inline-block text-left"
            ref={sortDropdownRef}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between box w-full text-[4vw] md:text-[1vw] font-satoshi px-4 py-2.5 rounded-xl bg-transparent text-black gap-2 border border-gray-500"
            >
              <span className="border-r pr-[0.8vw] border-black h-full">
                {selected}
              </span>
              <IoIosArrowDown
                size={16}
                className={`transition-transform duration-300 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {isOpen && (
              <ul className="absolute z-10 mt-3 w-full bg-white border rounded-lg shadow-lg animate-moveUp">
                {options.map((option, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelect(option)}
                    className="cursor-pointer px-4 py-2 text-base font-satoshi hover:bg-gray-100"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex flex-col justify-center items-center space-y-3">
            <TbLoader3 size={30} className="animate-spin text-teal-500" />
            <p className="text-[4vw] font-satoshi md:text-[1vw]">
              Please wait while we load client&apos;s data
              <AnimatedEllipsis />
            </p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-[4vw] text-center py-10 text-gray-600 font-satoshi md:text-[1vw]">
            No Client Data Available.
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="text-left py-4 px-3 font-satoshi font-semibold">
                    Client Name
                  </th>
                  <th className="text-left py-4 px-3 font-satoshi font-semibold">
                    Client Address
                  </th>
                  <th className="text-left py-4 px-3 font-satoshi font-semibold">
                    No. of invoices sent
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((client, index) => (
                  <tr key={index} className="border-b border-gray-400">
                    <td className="py-2 px-3 font-satoshi text-gray-600">
                      {client.clientName}
                    </td>
                    <td className="py-2 px-3 font-satoshi text-gray-600">
                      {client.clientAddress}
                    </td>
                    <td className="py-2 px-3 font-satoshi text-gray-600">
                      {formatInvoiceText(client.invoiceCount)}
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
                        <div className="absolute right-0 top-10 mt-2 bg-white rounded-md shadow-lg z-10 min-w-32 animate-moveUp">
                          <div className="py-2 px-4 cursor-pointer font-satoshi hover:bg-gray-100 hover:rounded-t">
                            View
                          </div>
                          <div className="py-2 px-4 cursor-pointer font-satoshi hover:bg-gray-100 hover:rounded-b">
                            Delete
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {currentData.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-[4vw] text-center py-10 text-gray-600 font-satoshi md:text-[1vw]"
                    >
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

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
      </div>
    </div>
  );
};

export default Clients;
