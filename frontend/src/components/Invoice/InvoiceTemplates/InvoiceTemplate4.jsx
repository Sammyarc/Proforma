import { Plus } from "lucide-react";
import { useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const InvoiceTemplate4 = ({ isStaticMode }) => {
  const [invoiceData, setInvoiceData] = useState({
    companyLogo: null,
    companyName: "",
    companyAddress: "",
    businessCountry: "",
    businessCity: "",
    businessWebsite: "",
    businessTaxInfo: "",
    clientName: "",
    clientAddress: "",
    cityCountry: "",
    phone: "",
    invoiceNumber: "",
    reference: "",
    invoiceDate: "",
    dueDate: "",
    contactPhone: "",
    items: [
      {
        description: "",
        qty: "",
        rate: "",
        amount: 0.0,
      },
    ],
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

    if (field === "qty" || field === "rate") {
      newItems[index].amount = newItems[index].qty * newItems[index].rate;
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
          qty: 1,
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

  const subtotal = invoiceData.items.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

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

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between mb-12">
        <div className="space-y-4">
          <h1 className="text-[4vw] font-clash font-bold md:text-2xl lg:text-[2.2vw]">
            Invoice
          </h1>
          <div>
            <h2 className="text-[4vw] font-satoshi font-semibold text-gray-900 mb-2 md:text-lg lg:text-[1vw]">
              Billed to:
            </h2>
            <div className="space-y-2">
              <div
                contentEditable
                className="block text-[4vw] text-gray-500 w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
                data-invoice-field="clientName"
                onInput={(e) =>
                  handleFieldChange("clientName", e.target.textContent)
                }
              >
                Client&apos;s Name
              </div>

              <div
                contentEditable
                className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
                data-invoice-field="clientAddress"
                onInput={(e) =>
                  handleFieldChange("clientAddress", e.target.textContent)
                }
              >
                Client&apos;s email address
              </div>
              <div
                contentEditable
                className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
                onInput={(e) =>
                  handleFieldChange("cityCountry", e.target.textContent)
                }
              >
                Country
              </div>

              <div
                contentEditable
                className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
                onInput={(e) =>
                  handleFieldChange("phone", e.target.textContent)
                }
              >
                +0 (000) 123-4567
              </div>
            </div>
          </div>
        </div>
        <div className="text-right space-y-3">
          <div className="flex justify-end">
            <div
              className="relative group w-[12vw] h-[12vw] rounded-md flex items-center justify-center cursor-pointer lg:w-[8vw] lg:h-[8vw]"
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
                <div className="flex flex-col items-center justify-center rounded-md text-gray-400 w-[12vw] h-[12vw] border-2 border-dashed border-gray-300 hover:border-gray-400 lg:w-[8vw] lg:h-[8vw]">
                  <FiUpload size={24} />
                  <p className="text-[4vw] font-satoshi mt-1 md:text-sm lg:text-[1vw]">
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
          </div>
          <div className="space-y-2">
            <div
              contentEditable
              className="block text-[4vw] text-gray-500 w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
              data-invoice-field="companyName"
              onInput={(e) =>
                handleFieldChange("companyName", e.target.textContent)
              }
            >
              Your Business Name
            </div>
            <div
              contentEditable
              className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("businessCountry", e.target.textContent)
              }
            >
              Country
            </div>
            <div
              contentEditable
              className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("businessCity", e.target.textContent)
              }
            >
              City
            </div>
            <div className="flex space-x-[0.5vw] items-center">
              <h2 className="text-gray-600 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                TAX ID:
              </h2>
              {isStaticMode ? (
                <div className="text-[4vw] font-satoshi -mt-[0.5vw] md:text-base lg:text-[1vw]">
                  {invoiceData.businessTaxInfo || "00XXXXX1234X0XX"}
                </div>
              ) : (
                <div
                  contentEditable
                  className="focus:outline-none border-b border-transparent -pt-1 hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-base lg:text-[1vw]"
                  onInput={(e) =>
                    handleFieldChange("businessTaxInfo", e.target.textContent)
                  }
                >
                  00XXXXX1234X0XX
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-8 gap-8 mb-8 lg:grid-cols-6">
        <div className="col-span-2 space-y-8 pr-[1vw] border-r-2 border-gray-200 lg:col-span-1">
          <div className="flex flex-col">
            <p className="text-[4vw] font-bold font-satoshi md:text-base lg:text-[1vw]">
              Invoice No:
            </p>
            <p
              contentEditable
              className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-base lg:text-[1vw]"
              data-invoice-field="invoiceNumber"
              onInput={(e) =>
                handleFieldChange("invoiceNumber", e.target.textContent)
              }
            >
              #AB2324-01
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-[4vw] font-bold font-satoshi md:text-base lg:text-[1vw]">
              Invoice Date:
            </p>
            {isStaticMode ? (
              <p
                className="text-[4vw] font-satoshi md:text-base lg:text-[1vw]"
                data-invoice-field="invoiceDate"
              >
                {invoiceData.invoiceDate || ""}
              </p>
            ) : (
              <input
                type="date"
                data-invoice-field="invoiceDate"
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-base lg:text-[1vw]"
                value={invoiceData.invoiceDate}
                onChange={(e) =>
                  handleFieldChange("invoiceDate", e.target.value)
                }
              />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-[4vw] font-bold font-satoshi md:text-base lg:text-[1vw]">
              Reference:
            </p>
            <p
              contentEditable
              className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-base lg:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("reference", e.target.textContent)
              }
            >
              INV-057
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-[4vw] font-bold font-satoshi md:text-base lg:text-[1vw]">
              Due Date:
            </p>
            {isStaticMode ? (
              <p
                className="text-[4vw] font-satoshi md:text-base lg:text-[1vw]"
                data-invoice-field="dueDate"
              >
                {invoiceData.dueDate || ""}
              </p>
            ) : (
              <input
                type="date"
                data-invoice-field="dueDate"
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-base lg:text-[1vw]"
                value={invoiceData.dueDate}
                onChange={(e) => handleFieldChange("dueDate", e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="col-span-6 lg:col-span-5">
          <table className="w-full">
            <thead>
              <tr className="text-gray-800 uppercase border-b">
                <th className="text-left pb-4 px-4 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                  Item description
                </th>
                <th className="text-left pb-4 px-4 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                  Qty
                </th>
                <th className="text-left pb-4 px-4 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                  Rate
                </th>
                <th className="text-left pb-4 px-4 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className="border-b group relative">
                  <td>
                    {isStaticMode ? (
                      <p
                        className="text-[4vw] w-[25vw] px-4 py-2 font-satoshi md:text-base lg:text-[1vw]"
                        data-invoice-field="description"
                      >
                        {item.description || ""}
                      </p>
                    ) : (
                      <input
                        type="text"
                        data-invoice-field="description"
                        className="w-[25vw] px-4 py-3 focus:outline-none text-[4vw] font-satoshi md:text-base lg:text-[1vw]"
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
                      <p className="text-[4vw] px-4 py-2 font-satoshi md:text-base lg:text-[1vw]">
                        {item.qty || ""}
                      </p>
                    ) : (
                      <input
                        type="number"
                        className="w-full px-4 py-3 focus:outline-none text-[4vw] font-satoshi md:text-base lg:text-[1vw]"
                        value={item.qty}
                        placeholder="1"
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "qty",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    )}
                  </td>
                  <td>
                    {isStaticMode ? (
                      <p className="text-[4vw] px-4 py-2 font-satoshi md:text-base lg:text-[1vw]">
                        {item.rate || ""}
                      </p>
                    ) : (
                      <input
                        type="number"
                        className="w-full px-4 py-3 focus:outline-none text-[4vw] font-satoshi md:text-base lg:text-[1vw]"
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
                      <p className="text-[4vw] px-4 py-2 font-satoshi md:text-base lg:text-[1vw]">
                        {item.amount.toFixed(2)}
                      </p>
                    ) : (
                      <span className="text-[4vw] px-4 py-3 font-satoshi md:text-base lg:text-[1vw]">
                        {item.amount.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="relative px-2 pb-4">
                    {isStaticMode ? (
                      ""
                    ) : (
                      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 hidden group-hover:flex transition-opacity duration-200">
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
              className="flex items-center gap-2 text-blue-400 my-4 text-[4vw] font-satoshi md:text-base lg:text-[1vw]"
            >
              <Plus size={16} />
              Add Line Item
            </button>
          )}

          {/* Totals */}
          <div className="flex flex-col items-end space-y-[1vw] mt-[3vw] mr-[2vw]">
            <div className="flex justify-between md:w-[25vw] lg:w-[20vw]">
              <span className="text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                Subtotal:
              </span>
              <span className="text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                ${formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between md:w-[25vw] lg:w-[20vw]">
              <span className="text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                Tax (10%):
              </span>
              <span className="text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                ${formatCurrency(tax)}
              </span>
            </div>
            <div className="h-[0.1vw] ml-auto bg-gray-200 mt-4 md:w-[25vw] lg:w-[20vw]"></div>
            <div className="flex justify-between text-[4vw] font-bold font-satoshi md:text-base md:w-[25vw] lg:w-[20vw] lg:text-[1vw]">
              <span>Total</span>
              <span data-invoice-field="invoiceAmount">
                ${formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12">
        <h2 className="font-satoshi text-gray-600 mb-4">
          Please pay within 15 days of receiving this invoice.
        </h2>
        <div className="flex justify-between text-gray-600 border-t pt-2">
          <div
            contentEditable
            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
            onInput={(e) =>
              handleFieldChange("businessWebsite", e.target.textContent)
            }
          >
            www.website.com
          </div>
          <div
            contentEditable
            className="block text-center w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
            onInput={(e) =>
              handleFieldChange("contactPhone", e.target.textContent)
            }
          >
            +91 00000 00000
          </div>
          <div
            contentEditable
            className="block text-right w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
            data-invoice-field="companyAddress"
            onInput={(e) =>
              handleFieldChange("companyAddress", e.target.textContent)
            }
          >
            Your email address
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate4;
