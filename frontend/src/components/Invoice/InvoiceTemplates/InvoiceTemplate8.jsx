import { Plus } from "lucide-react";
import { useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const InvoiceTemplate8 = ({ isStaticMode }) => {
  const [invoiceData, setInvoiceData] = useState({
    companyLogo: null,
    businessName: "",
    businessEmail: "",
    businessContactInfo: "",
    businessCountry: "",
    businessCity: "",
    businessTaxInfo: "",
    companyName: "",
    companyAddress: "",
    cityCountry: "",
    phone: "",
    invoiceNumber: "",
    reference: "",
    invoiceDate: "",
    dueDate: "",
    items: [
      {
        description: "",
        qty: "",
        rate: "",
        amount: 0.0,
      },
    ],
    notes: "",
    tableHeaders: ["Description", "Qty", "Rate", "Amount"],
  });

  const handleFieldChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      [field]: value,
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceData((prevData) => ({
          ...prevData,
          companyLogo: reader.result, // Convert image to base64 URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setInvoiceData((prevData) => ({
      ...prevData,
      companyLogo: null, // Clear uploaded logo
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;

    if (field === "quantity" || field === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    setInvoiceData({
      ...invoiceData,
      items: newItems,
    });
  };

  const handleTableHeaderChange = (index, value) => {
    const newHeaders = [...invoiceData.tableHeaders];
    newHeaders[index] = value;
    setInvoiceData({
      ...invoiceData,
      tableHeaders: newHeaders,
    });
  };

  const addNewItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        {
          description: "Enter a description",
          quantity: 1,
          rate: 0.0,
          amount: 0.0,
        },
      ],
    });
  };

  const deleteItem = (indexToRemove) => {
    // Prevent deleting the last item
    if (invoiceData.items.length <= 1) {
      // Optionally, show a toast or alert
      toast.warn("At least one item is required!");
      return;
    }

    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, index) => index !== indexToRemove),
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("$", "");
  };

  const subtotal = invoiceData.items.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div id="invoice">
      {/* Header */}
      <div className="flex justify-between mb-[5vw]">
        <div className="flex flex-row items-center space-x-[1vw]">
          <div
            className="relative group w-[8vw] h-[8vw] rounded-md flex items-center justify-center cursor-pointer"
            onClick={() => document.getElementById("fileInput").click()}
          >
            {invoiceData.companyLogo ? (
              <>
                {" "}
                <img
                  src={invoiceData.companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-cover rounded-md"
                />{" "}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent file input trigger
                    removeLogo();
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <FiX size={16} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-md text-gray-400 w-[8vw] h-[8vw] border-2 border-dashed border-gray-300 hover:border-gray-400">
                <FiUpload size={24} />
                <p className="text-[4vw] font-satoshi mt-1 md:text-[1vw]">
                  Upload Logo
                </p>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
          <div className="space-y-1">
            <div
              contentEditable
              className="block text-[5vw] text-gray-900 w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1.5vw]"
              onInput={(e) =>
                handleFieldChange("businessName", e.target.textContent)
              }
            >
              Your Business Name
            </div>
            <div
              contentEditable
              className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("businessEmail", e.target.textContent)
              }
            >
              hello@email.com
            </div>
            <div
              contentEditable
              className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("businessContactInfo", e.target.textContent)
              }
            >
              +91 00000 00000
            </div>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <h1 className="text-[4vw] font-extrabold font-satoshi leading-none text-gray-400 md:text-[2.5vw]">
            Invoice
          </h1>
          {isStaticMode ? (
            <p className="text-[4vw] text-gray-600 font-satoshi md:text-[1vw]">
              {" "}
              {invoiceData.invoiceNumber || "#AB2324-01"}{" "}
            </p>
          ) : (
            <p
              contentEditable
              className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi mt-[0.5vw] md:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("invoiceNumber", e.target.textContent)
              }
            >
              #AB2324-01
            </p>
          )}
        </div>
      </div>

      {/* Bill To Section */}
      <div className="grid grid-cols-3 space-x-[5vw] mb-[5vw]">
        <div>
          <h2 className="text-[4vw] font-satoshi font-bold uppercase text-gray-400 mb-2 md:text-[1vw]">
            Billed to:
          </h2>
          <div className="space-y-2">
            <div
              contentEditable
              className="block text-[5vw] w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1.2vw]"
              onInput={(e) =>
                handleFieldChange("companyName", e.target.textContent)
              }
            >
              Company&apos;s Name
            </div>

            <div
              contentEditable
              className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("companyAddress", e.target.textContent)
              }
            >
              Company&apos;s Address
            </div>
            <div
              contentEditable
              className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("cityCountry", e.target.textContent)
              }
            >
              Country
            </div>

            <div
              contentEditable
              className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
              onInput={(e) => handleFieldChange("phone", e.target.textContent)}
            >
              +1 (000) 123-4567
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-col space-y-[0.5vw]">
            <h2 className="text-gray-400 text-[4vw] font-satoshi uppercase md:text-[1vw]">
              Invoice Date:
            </h2>
            <div>
              {isStaticMode ? (
                <p className="text-[4vw] font-satoshi -mt-[0.7vw] md:text-[1vw]">
                  {invoiceData.invoiceDate || ""}
                </p>
              ) : (
                <input
                  type="date"
                  className="focus:outline-none w-[7.5vw] border-b border-transparent bg-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                  value={invoiceData.date}
                  onChange={(e) =>
                    handleFieldChange("invoiceDate", e.target.value)
                  }
                />
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-[0.5vw]">
            <h2 className="text-gray-400 text-[4vw] font-satoshi uppercase md:text-[1vw]">
              Due Date:
            </h2>
            <div>
              {isStaticMode ? (
                <p className="text-[4vw] font-satoshi -mt-[0.7vw] md:text-[1vw]">
                  {invoiceData.dueDate || ""}
                </p>
              ) : (
                <input
                  type="date"
                  className="focus:outline-none w-[7.5vw] border-b border-transparent bg-transparent mt-[0.3vw] hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                  value={invoiceData.dueDate}
                  onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end space-y-1">
          <p className="text-gray-600 text-[4vw] text-center uppercase font-satoshi md:text-[1vw]">
            Amount Due
          </p>
          <div className="bg-yellow-200 -mr-[2vw] px-3 py-1">
            <p className="text-[6vw] text-orange-500 font-bold font-satoshi md:text-[1.7vw]">
              ${formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>

      {/* Editable Table */}
      <table className="w-full mb-2">
        <thead>
          <tr className="bg-Gray800 text-white">
            {invoiceData.tableHeaders.map((header, index) => (
              <th key={index}>
                {isStaticMode ? (
                  <p className="text-[4vw] px-2 py-1 text-left font-satoshi md:text-[1vw]">
                    {header || ""}
                  </p>
                ) : (
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-transparent focus:outline-none text-white text-[4vw] font-satoshi md:text-[1vw]"
                    value={header}
                    onChange={(e) =>
                      handleTableHeaderChange(index, e.target.value)
                    }
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoiceData.items.map((item, index) => (
            <tr key={index} className="border-b group relative">
              <td>
                {isStaticMode ? (
                  <p className="text-[4vw] w-[35vw] p-2 font-satoshi md:text-[1vw]">
                    {item.description || ""}
                  </p>
                ) : (
                  <input
                    type="text"
                    className="w-[35vw] px-2 py-3 focus:outline-none text-[4vw] font-satoshi md:text-[1vw]"
                    value={item.description}
                    placeholder="Enter a description"
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                )}
              </td>
              <td>
                {isStaticMode ? (
                  <p className="text-[4vw] p-2 font-satoshi md:text-[1vw]">
                    {item.quantity || ""}
                  </p>
                ) : (
                  <input
                    type="number"
                    className="w-full px-2 py-3 focus:outline-none text-[4vw] font-satoshi md:text-[1vw]"
                    value={item.quantity}
                    placeholder="1"
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isStaticMode ? (
                  <p className="text-[4vw] p-2 font-satoshi md:text-[1vw]">
                    {item.rate || ""}
                  </p>
                ) : (
                  <input
                    type="number"
                    className="w-full px-2 py-3 focus:outline-none text-[4vw] font-satoshi md:text-[1vw]"
                    value={item.rate}
                    placeholder="0.00"
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "rate",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                )}
              </td>

              <td>
                {isStaticMode ? (
                  <p className="text-[4vw] p-2 font-satoshi md:text-[1vw]">
                    {item.amount.toFixed(2)}
                  </p>
                ) : (
                  <span className="text-[4vw] px-2  font-satoshi md:text-[1vw]">
                    {item.amount.toFixed(2)}
                  </span>
                )}
              </td>
              <td className="relative px-2 pb-4">
                {isStaticMode ? (
                  ""
                ) : (
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2 hidden group-hover:flex transition-opacity duration-200">
                    <button
                      onClick={() => deleteItem(index)}
                      title="Remove Item"
                      className="text-white bg-red-500 p-[0.2vw] rounded-full"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isStaticMode ? (
        ""
      ) : (
        <button
          onClick={addNewItem}
          className="flex items-center gap-2 text-blue-400 mb-4 text-[4vw] font-satoshi md:text-[1vw]"
        >
          <Plus size={16} />
          Add Line Item
        </button>
      )}

      {/* Total */}
      <div className="flex justify-between font-extrabold text-[4vw] font-satoshi md:text-[1vw]">
        <span>TOTAL:</span>
        <span className="invoice-amount" data-total="true">${formatCurrency(total)}</span>
      </div>
      <p className="text-gray-600 my-2 text-[4vw] font-satoshi md:text-[0.9vw]">
        Please pay within 15 days of receiving this invoice.
      </p>

      {/* Footer */}
      <div className="mt-[5vw]">
        <h3 className="font-bold mb-1 text-[4vw] font-satoshi md:text-[1vw]">
          Thanks for the business.
        </h3>
        <div className="h-[0.1vw] ml-auto bg-yellow-200 mt-4"></div>
      </div>
    </div>
  );
};

export default InvoiceTemplate8;
