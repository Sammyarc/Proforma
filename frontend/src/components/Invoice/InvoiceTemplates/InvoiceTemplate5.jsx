import { Plus } from "lucide-react";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const InvoiceTemplate5 = ({ isStaticMode }) => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    dueDate: "",
    invoiceDate: "",
    reference: "",
    clientName: "",
    clientAddress: "",
    cityCountry: "",
    phone: "",
    companyName: "",
    businessCountry: "",
    businessCity: "",
    businessTaxInfo: "",
    companyAddress: "",
    contactPhone: "",
    bankDetails: {
      bankName: "",
      ifsCode: "",
      swiftCode: "",
      accountNumber: "",
    },
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
      <div className="flex justify-between items-start mb-12">
        <h1 className="text-[4vw] font-clash font-extrabold md:text-2xl lg:text-[2vw]">
          Invoice
        </h1>
        <div className="flex space-x-[0.5vw] items-center">
          <p className="md:text-xl lg:text-[2vw]">№</p>
          <div
            contentEditable
            className="focus:outline-none border-b border-transparent py-1 hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-base lg:text-[1vw]"
            data-invoice-field="invoiceNumber"
            onInput={(e) =>
              handleFieldChange("invoiceNumber", e.target.textContent)
            }
          >
            ******
          </div>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        <div>
          <p className="font-bold mb-2 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
            Payable {formatCurrency(total)}
          </p>
          <div className="text-gray-600 space-y-[0.3vw]">
            <div className="flex space-x-[0.2vw]">
              <span className="text-gray-600 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                Due:
              </span>
              {isStaticMode ? (
                <span
                  className="text-[4vw] font-satoshi md:text-base lg:text-[1vw]"
                  data-invoice-field="dueDate"
                >
                  {invoiceData.dueDate || ""}
                </span>
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
            <div className="flex space-x-[0.2vw]">
              <span className="text-gray-600 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                Issued:
              </span>
              {isStaticMode ? (
                <span
                  className="text-[4vw] font-satoshi md:text-base lg:text-[1vw]"
                  data-invoice-field="invoiceDate"
                >
                  {invoiceData.invoiceDate || ""}
                </span>
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
            <div className="flex space-x-[0.2vw] ">
              <h2 className="text-gray-600 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                Ref:
              </h2>
              <div
                contentEditable
                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi font-bold md:text-base lg:text-[1vw]"
                onInput={(e) =>
                  handleFieldChange("reference", e.target.textContent)
                }
              >
                INV-057
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-[5vw]">
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

        <div>
          <p className="font-bold mb-2 text-[4vw] font-satoshi md:text-lg lg:text-[1vw]">
            From:
          </p>
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

      {/* Items Section */}
      <div className="relative mb-12">
        {/* Pink Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"></div>

        <div className="pl-8">
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
                        className="text-[4vw] w-[35vw] px-4 py-2 font-satoshi md:text-base lg:text-[1vw]"
                        data-invoice-field="description"
                      >
                        {item.description || ""}
                      </p>
                    ) : (
                      <input
                        type="text"
                        data-invoice-field="description"
                        className="w-[35vw] px-4 py-3 focus:outline-none text-[4vw] font-satoshi md:text-base lg:text-[1vw]"
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

          <div className="mt-4 space-y-2">
            <div className="flex justify-end">
              <span className="text-[4vw] font-satoshi md:text-base md:w-[12vw] lg:w-[9vw] lg:text-[1vw]">
                Subtotal:
              </span>
              <span className="text-right text-[4vw] font-satoshi md:text-base md:w-[12vw] lg:w-[9vw] lg:text-[1vw]">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-end">
              <span className="text-[4vw] font-satoshi md:text-base md:w-[12vw] lg:w-[9vw] lg:text-[1vw]">
                Tax (10%):
              </span>
              <span className="text-right text-[4vw] font-satoshi md:text-base md:w-[12vw] lg:w-[9vw] lg:text-[1vw]">
                {formatCurrency(tax)}
              </span>
            </div>
            <div className="flex justify-end text-pink-500 font-medium">
              <span className="text-[4vw] font-satoshi md:text-base md:w-[12vw] lg:w-[9vw] lg:text-[1vw]">
                Total (USD)
              </span>
              <span
                className="text-right text-[4vw] font-satoshi md:text-base md:w-[12vw] lg:w-[9vw] lg:text-[1vw]"
                data-invoice-field="invoiceAmount"
              >
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-8">
        <div className="border-l-2 border-gray-200 pl-4">
          <h3 className="font-bold mb-1 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
            Payment details
          </h3>
          <p className="text-gray-600 mb-4 text-[4vw] font-satoshi md:text-base lg:text-[0.9vw]">
            Please pay within 15 days of receiving this invoice.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                Bank name:
              </span>
              <span
                contentEditable
                className="block w-full text-[4vw] font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
                onInput={(e) =>
                  handleFieldChange(
                    "bankDetails.bankName",
                    e.target.textContent
                  )
                }
              >
                ABCD BANK
              </span>
            </div>
            <div>
              <span className="text-gray-600 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                IFS code:
              </span>
              <span
                contentEditable
                className="block w-full text-[4vw] font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
                onInput={(e) =>
                  handleFieldChange("bankDetails.ifsCode", e.target.textContent)
                }
              >
                ABCD000XXXX
              </span>
            </div>
            <div>
              <span className="text-gray-600 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                Swift code:
              </span>
              <span
                contentEditable
                className="block w-full text-[4vw] font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
                onInput={(e) =>
                  handleFieldChange(
                    "bankDetails.swiftCode",
                    e.target.textContent
                  )
                }
              >
                ABCDUSBXXX
              </span>
            </div>
            <div>
              <span className="text-gray-600 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
                Account No:
              </span>
              <span
                contentEditable
                className="block w-full text-[4vw] font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
                onInput={(e) =>
                  handleFieldChange(
                    "bankDetails.accountNumber",
                    e.target.textContent
                  )
                }
              >
                374749823000011
              </span>
            </div>
          </div>
        </div>

        <div className="border-l-2 border-gray-200 pl-4">
          <h3 className="font-bold mb-2 text-[4vw] font-satoshi md:text-base lg:text-[1vw]">
            Thanks for the business.
          </h3>
          <div className="text-gray-600">
            <div
              contentEditable
              className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
              data-invoice-field="companyAddress"
              onInput={(e) =>
                handleFieldChange("companyAddress", e.target.textContent)
              }
            >
              Your email address
            </div>
            <div
              contentEditable
              className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-base lg:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("contactPhone", e.target.textContent)
              }
            >
              +91 00000 00000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate5;
