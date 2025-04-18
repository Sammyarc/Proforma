import { Plus } from "lucide-react";
import { useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const InvoiceTemplate2 = ({ isStaticMode }) => {
  const [invoiceData, setInvoiceData] = useState({
    companyLogo: null,
    businessName: "",
    businessWebsite: "",
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
  });

  const handleFieldChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      [field]: value,
    });
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

  return (
    <div id="invoice">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-row space-x-[1vw]">
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
              className="block text-[5vw] text-orange-500 w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1.5vw]"
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
                handleFieldChange("businessWebsite", e.target.textContent)
              }
            >
              www.website.com
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
        <div className="text-right space-y-2">
          <div
            contentEditable
            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
            onInput={(e) =>
              handleFieldChange("businessCountry", e.target.textContent)
            }
          >
            Country
          </div>
          <div
            contentEditable
            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
            onInput={(e) =>
              handleFieldChange("businessCity", e.target.textContent)
            }
          >
            City
          </div>
          <div className="flex space-x-[1vw] items-center">
            <h2 className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">
              TAX ID:
            </h2>
            {isStaticMode ? (
              <div className="text-[4vw] font-satoshi md:text-[1vw] -mt-[0.5vw]">
                {invoiceData.businessTaxInfo || "00XXXXX1234X0XX"}
              </div>
            ) : (
              <div
                contentEditable
                className="focus:outline-none border-b border-transparent -pt-1 hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
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

      <div className="p-3 border border-neutral-300 rounded-xl">
        {/* Bill To Section */}
        <div className="grid grid-cols-3 space-x-[9vw] mb-8">
          <div>
            <h2 className="text-[4vw] font-satoshi font-semibold text-gray-900 mb-2 md:text-[1vw]">
              Billed to:
            </h2>
            <div className="space-y-2">
              <div
                contentEditable
                className="block text-[5vw] w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1.5vw]"
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
                onInput={(e) =>
                  handleFieldChange("phone", e.target.textContent)
                }
              >
                +1 (000) 123-4567
              </div>
            </div>
          </div>

          <div className="space-y-[2vw]">
            <div className="flex flex-col space-y-[0.5vw]">
              <h2 className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">
                Invoice Number:
              </h2>
              <div
                contentEditable
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-900 font-satoshi font-bold md:text-[1vw]"
                onInput={(e) =>
                  handleFieldChange("invoiceNumber", e.target.textContent)
                }
              >
                #AB2324-01
              </div>
            </div>
            <div className="flex flex-col space-y-[0.5vw]">
              <h2 className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">
                Reference:
              </h2>
              <div
                contentEditable
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-900 font-satoshi font-bold md:text-[1vw]"
                onInput={(e) =>
                  handleFieldChange("reference", e.target.textContent)
                }
              >
                INV-057
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <p className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">
              Invoice of (USD)
            </p>
            <span className="text-[6vw] text-orange-500 font-bold font-satoshi md:text-[1.7vw]">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Date Section */}
        <div className="flex space-x-[3vw] mb-8">
          <div>
            <p className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">
              Invoice Date:
            </p>
            {isStaticMode ? (
              <div className="text-[4vw] font-satoshi md:text-[1vw]">
                {invoiceData.invoiceDate || ""}
              </div>
            ) : (
              <input
                type="date"
                className="focus:outline-none border-b border-transparent py-1 hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                value={invoiceData.invoiceDate}
                onChange={(e) =>
                  handleFieldChange("invoiceDate", e.target.value)
                }
              />
            )}
          </div>
          <div>
            <p className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">
              Due Date:
            </p>
            {isStaticMode ? (
              <div className="text-[4vw] font-satoshi md:text-[1vw]">
                {invoiceData.dueDate || ""}
              </div>
            ) : (
              <input
                type="date"
                className="focus:outline-none border-b border-transparent py-1 hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                value={invoiceData.dueDate}
                onChange={(e) => handleFieldChange("dueDate", e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b">
              <th className="text-left text-[4vw] p-2 font-satoshi md:text-[1vw]">
                DESCRIPTION
              </th>
              <th className="text-left text-[4vw] p-2 font-satoshi md:text-[1vw]">
                QTY
              </th>
              <th className="text-left text-[4vw] p-2 font-satoshi md:text-[1vw]">
                RATE
              </th>
              <th className="text-right text-[4vw] p-2 font-satoshi md:text-[1vw]">
                AMOUNT
              </th>
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
                      {item.qty || ""}
                    </p>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-2 py-3 focus:outline-none text-[4vw] font-satoshi md:text-[1vw]"
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
            className="flex items-center gap-2 text-blue-400 mb-4 text-[4vw] font-satoshi md:text-[1vw]"
          >
            <Plus size={16} />
            Add Line Item
          </button>
        )}

        {/* Totals */}
        <div className="flex flex-col items-end space-y-[1vw] mr-[2vw]">
          <div className="flex justify-between w-[20vw]">
            <span className="text-[4vw] font-satoshi md:text-[1vw]">
              Subtotal:
            </span>
            <span className="text-[4vw] font-satoshi md:text-[1vw]">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between w-[20vw]">
            <span className="text-[4vw] font-satoshi md:text-[1vw]">
              Tax (10%):
            </span>
            <span className="text-[4vw] font-satoshi md:text-[1vw]">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between w-[20vw] font-bold font-satoshi text-orange-500 text-xl">
            <span>Total</span>
            <span className="invoice-amount" data-total="true">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <div className="text-gray-800 text-[4vw] font-bold font-satoshi md:text-[1vw]">
            Notes
          </div>
          <div
            contentEditable
            className="block w-full text-[4vw] font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
            onInput={(e) => handleFieldChange("notes", e.target.textContent)}
          >
            Thanks for the business...
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 text-gray-500">
        <div className="text-gray-800 text-[4vw] font-bold font-satoshi md:text-[1vw]">
          Terms & Conditions
        </div>
        <p className="block w-full text-[4vw] font-satoshi py-2 text-gray-500 focus:outline-none md:text-[1vw]">
          Please make the payment on or before the due date...
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate2;
