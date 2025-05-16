import { useState } from "react";
import { FiX, FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

const InvoiceTemplate1 = ({ isStaticMode }) => {
  const [invoiceData, setInvoiceData] = useState({
    companyLogo: null,
    companyName: "",
    companyAddress: "",
    cityStateZip: "",
    country: "",
    clientName: "",
    clientAddress: "",
    clientCityStateZip: "",
    clientCountry: "",
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    items: [
      {
        description: "",
        quantity: "",
        rate: "",
        amount: 0.0,
      },
    ],
    notes: "",
    terms: "",
    tableHeaders: ["Description", "Qty", "Rate", "Amount"],
  });

  const calculateSubTotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    return calculateSubTotal() * 0.1;
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateTax();
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

  const handleTableHeaderChange = (index, value) => {
    const newHeaders = [...invoiceData.tableHeaders];
    newHeaders[index] = value;
    setInvoiceData({
      ...invoiceData,
      tableHeaders: newHeaders,
    });
  };

  return (
      <div className="min-w-[800px] w-full">
        <div
          className="relative w-[120px] h-[120px] group rounded-md flex items-center justify-center cursor-pointer"
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
            <div className="flex w-[120px] h-[120px] flex-col items-center justify-center rounded-md text-gray-400 border-2 border-dashed border-gray-300 hover:border-gray-400">
              <FiUpload size={24} />
              <p className="font-satoshi mt-1 text-base">
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

        <div className="flex justify-between items-start my-[1.5vw]">
          <div className="space-y-2">
            <div
              contentEditable
              className="block w-full font-bold font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 text-xl"
              data-invoice-field="companyName"
              onInput={(e) =>
                handleFieldChange("companyName", e.target.textContent)
              }
            >
              Company&apos;s Name
            </div>

            <div
              contentEditable
              className="block w-full text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 text-base"
              data-invoice-field="companyAddress"
              onInput={(e) =>
                handleFieldChange("companyAddress", e.target.textContent)
              }
            >
              Company&apos;s email address
            </div>
            <div
              contentEditable
              className="block w-full text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 text-base"
              onInput={(e) =>
                handleFieldChange("cityStateZip", e.target.textContent)
              }
            >
              City
            </div>

            <div
              contentEditable
              className="block w-full text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 text-base"
              onInput={(e) => handleFieldChange("country", e.target.textContent)}
            >
              State
            </div>
          </div>
          <div className="font-clash font-bold text-Gray900 text-3xl">
            INVOICE
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[10vw] mb-8">
          <div className="space-y-2">
            <div className="font-satoshi font-semibold text-gray-600 mb-2 text-base">
              Billed To:
            </div>

            <div
              contentEditable
              className="block w-full text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 text-base"
              data-invoice-field="clientName"
              onInput={(e) =>
                handleFieldChange("clientName", e.target.textContent)
              }
            >
              Client&apos;s Name
            </div>

            <div
              contentEditable
              className="block w-full text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 text-base"
              data-invoice-field="clientAddress"
              onInput={(e) =>
                handleFieldChange("clientAddress", e.target.textContent)
              }
            >
              Client&apos;s email address
            </div>

            <div
              contentEditable
              className="block w-full text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 text-base"
              onInput={(e) =>
                handleFieldChange("clientCityStateZip", e.target.textContent)
              }
            >
              Client&apos;s City
            </div>

            <div
              contentEditable
              className="block w-full text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 text-base"
              onInput={(e) =>
                handleFieldChange("clientCountry", e.target.textContent)
              }
            >
              Client&apos;s State
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 items-center">
              <div className="text-gray-600 font-satoshi text-base">
                Invoice No:
              </div>
              <div
                contentEditable
                className="focus:outline-none border-b border-transparent py-1 hover:border-gray-300 text-gray-600 font-satoshi text-base"
                data-invoice-field="invoiceNumber"
                onInput={(e) =>
                  handleFieldChange("invoiceNumber", e.target.textContent)
                }
              >
                INV-123456-DC2
              </div>
            </div>

            <div className="grid grid-cols-2 items-center">
              <div className="text-gray-600 font-satoshi text-base">
                Invoice Date:
              </div>
              {isStaticMode ? (
                <div
                  className="font-satoshi text-base"
                  data-invoice-field="invoiceDate"
                >
                  {invoiceData.invoiceDate || ""}
                </div>
              ) : (
                <input
                  type="date"
                  data-invoice-field="invoiceDate"
                  className="focus:outline-none w-full border-b border-transparent py-1 hover:border-gray-300 text-gray-600 font-satoshi text-base"
                  value={invoiceData.invoiceDate}
                  onChange={(e) =>
                    handleFieldChange("invoiceDate", e.target.value)
                  }
                />
              )}
            </div>

            <div className="grid grid-cols-2 items-center">
              <div className="text-gray-600 font-satoshi text-base">
                Due Date:
              </div>

              {isStaticMode ? (
                <div
                  className="font-satoshi text-base"
                  data-invoice-field="dueDate"
                >
                  {invoiceData.dueDate || ""}
                </div>
              ) : (
                <input
                  type="date"
                  data-invoice-field="dueDate"
                  className="focus:outline-none w-full border-b border-transparent py-1 hover:border-gray-300 text-gray-600 font-satoshi text-base"
                  value={invoiceData.dueDate}
                  onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Editable Table */}
        <table className="w-full mb-5">
          <thead>
            <tr className="bg-Gray800 text-white">
              {invoiceData.tableHeaders.map((header, index) => (
                <th key={index}>
                  {isStaticMode ? (
                    <p className="px-2 py-1 text-left font-satoshi text-base">
                      {header || ""}
                    </p>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-2 py-1 bg-transparent focus:outline-none text-white font-satoshi text-base"
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
                    <p
                      className="w-[350px] p-2 font-satoshi text-base"
                      data-invoice-field="description"
                    >
                      {item.description || ""}
                    </p>
                  ) : (
                    <input
                      type="text"
                      data-invoice-field="description"
                      className="w-[350px] px-2 py-3 focus:outline-none font-satoshi text-base"
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
                    <p className="p-2 font-satoshi text-base">
                      {item.quantity || ""}
                    </p>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-2 py-3 focus:outline-none font-satoshi text-base"
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
                    <p className="p-2 font-satoshi text-base">
                      {item.rate || ""}
                    </p>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-2 py-3 focus:outline-none font-satoshi text-base"
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
                    <p className="p-2 font-satoshi text-base">
                      {item.amount.toFixed(2)}
                    </p>
                  ) : (
                    <span className="px-2 font-satoshi text-base">
                      {item.amount.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="relative px-2 pb-4">
                  {isStaticMode ? (
                    ""
                  ) : (
                    <div className="absolute top-1/2 right-2 transform -translate-y-1/2 hidden group-hover:flex transition-opacity duration-200">
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
            className="flex items-center gap-2 text-blue-400 mb-4 font-satoshi text-base"
          >
            <Plus size={16} />
            Add Line Item
          </button>
        )}

        <div className="flex justify-end mb-8">
          <div className="w-[300px] space-y-4">
            <div className="flex justify-between">
              <span className="font-satoshi text-base">
                Sub Total:
              </span>
              <span className="font-satoshi text-base">
                ${calculateSubTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-satoshi text-base">
                Sales Tax (10%):
              </span>
              <span className="font-satoshi text-base">
                ${calculateTax().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-extrabold font-satoshi text-base">
              <span>TOTAL:</span>
              <span data-invoice-field="invoiceAmount">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <div className="text-gray-800 mb-1 font-bold font-satoshi text-base">
              Notes
            </div>

            <div
              contentEditable
              className="block w-full font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
              onInput={(e) => handleFieldChange("notes", e.target.textContent)}
            >
              Leave a comment...
            </div>
          </div>
          <div>
            <div className="text-gray-800 mb-1 font-bold font-satoshi text-base">
              Terms & Conditions
            </div>
            <div
              contentEditable
              className="block w-full font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 text-base"
              onInput={(e) => handleFieldChange("terms", e.target.textContent)}
            >
              Please make the payment on or before the due date...
            </div>
          </div>
        </div>
      </div>
  );
};

export default InvoiceTemplate1;
