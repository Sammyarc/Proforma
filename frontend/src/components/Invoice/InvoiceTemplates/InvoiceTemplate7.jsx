import { Plus } from "lucide-react";
import { useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const InvoiceTemplate7 = ({ isStaticMode }) => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    date: "",
    dueDate: "",
    companyName: "",
    companyAddress: "",
    cityCountry: "",
    phone: "",
    businessName: "",
    businessCountry: "",
    businessCity: "",
    businessTaxInfo: "",
    email: "",
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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-[3vw]">
        <div className="flex flex-col">
          <h1 className="text-[4vw] font-extrabold font-satoshi leading-none uppercase md:text-[2.5vw]">
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
      </div>

      {/* Date, Billed to and from section */}
      <div className="grid grid-cols-3">
        {/* Date */}
        <div className="flex flex-col h-full justify-between p-[1vw] border-t-2 border-r-2 border-b-2">
          <div className="flex flex-col">
            <div className="text-[4vw] font-bold font-satoshi md:text-[1vw]">
              Issued:
            </div>
            {isStaticMode ? (
              <p className="text-[4vw] font-satoshi md:text-[1vw]">
                {invoiceData.date || ""}
              </p>
            ) : (
              <input
                type="date"
                className="focus:outline-none w-[7.5vw] border-b border-transparent bg-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                value={invoiceData.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
              />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-[4vw] font-bold leading-none font-satoshi md:text-[1vw]">
              Due:
            </p>
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

        {/* Billed to */}
        <div className="p-[1vw] border-t-2 border-r-2 border-b-2">
          <h2 className="text-[4vw] font-satoshi font-semibold text-gray-900 mb-2 md:text-[1vw]">
            Billed To:
          </h2>
          <div className="space-y-2">
            <div
              contentEditable
              className="block text-[4vw] text-gray-500 w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
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
              +0 (000) 123-4567
            </div>
          </div>
        </div>

        {/* From */}
        <div className="p-[1vw] border-t-2 border-b-2">
          <p className="font-bold mb-2 text-[4vw] font-satoshi md:text-[1vw]">
            From:
          </p>
          <div className="space-y-2">
            <div
              contentEditable
              className="block text-[4vw] text-gray-500 w-full font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
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
            <div className="flex space-x-[0.5vw]">
              <h2 className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">
                TAX ID:
              </h2>
              {isStaticMode ? (
                <div className="text-[4vw] font-satoshi md:text-[1vw]">
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
      </div>

      {/* Table  */}
      <div className="mb-[1vw] mt-[5vw]">
        <table className="w-full">
          <thead>
            <tr className="text-gray-800 uppercase border-b">
              <th className="text-left pb-4 px-4 text-[4vw] font-satoshi md:text-[1vw]">
                Item description
              </th>
              <th className="text-left pb-4 px-4 text-[4vw] font-satoshi md:text-[1vw]">
                Qty
              </th>
              <th className="text-left pb-4 px-4 text-[4vw] font-satoshi md:text-[1vw]">
                Rate
              </th>
              <th className="text-left pb-4 px-4 text-[4vw] font-satoshi md:text-[1vw]">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index} className="border-b group relative">
                <td>
                  {isStaticMode ? (
                    <p className="text-[4vw] w-[35vw] px-4 py-2 font-satoshi md:text-[1vw]">
                      {item.description || ""}
                    </p>
                  ) : (
                    <input
                      type="text"
                      className="w-[35vw] px-4 py-3 focus:outline-none bg-transparent text-[4vw] font-satoshi md:text-[1vw]"
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
                    <p className="text-[4vw] px-4 py-2 font-satoshi md:text-[1vw]">
                      {item.qty || ""}
                    </p>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-4 py-3 focus:outline-none bg-transparent text-[4vw] font-satoshi md:text-[1vw]"
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
                    <p className="text-[4vw] px-4 py-2 font-satoshi md:text-[1vw]">
                      {item.rate || ""}
                    </p>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-4 py-3 focus:outline-none bg-transparent text-[4vw] font-satoshi md:text-[1vw]"
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
                    <p className="text-[4vw] px-4 py-2 font-satoshi md:text-[1vw]">
                      {item.amount.toFixed(2)}
                    </p>
                  ) : (
                    <span className="text-[4vw] px-4 py-3 font-satoshi md:text-[1vw]">
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
      </div>

      {/* Add new item */}
      {isStaticMode ? (
        ""
      ) : (
        <button
          onClick={addNewItem}
          className="flex items-center gap-2 text-blue-400 my-3 text-[4vw] font-satoshi md:text-[1vw]"
        >
          <Plus size={16} />
          Add Line Item
        </button>
      )}

      {/* Total */}
      <div className="mt-4 space-y-2">
        <div className="flex ml-auto w-[15vw] text-gray-600">
          <span className="w-[9vw] text-[4vw] font-satoshi md:text-[1vw]">
            Subtotal:
          </span>
          <span className="w-[9vw] text-right text-[4vw] font-satoshi md:text-[1vw]">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex ml-auto w-[15vw] text-gray-600">
          <span className="w-[9vw] text-[4vw] font-satoshi md:text-[1vw]">
            Tax (10%):
          </span>
          <span className="w-[9vw] text-right text-[4vw] font-satoshi md:text-[1vw]">
            {formatCurrency(tax)}
          </span>
        </div>
        <div className="flex ml-auto w-[15vw]">
          <span className="w-[9vw] text-[4vw] font-bold font-satoshi md:text-[1vw]">
            Total
          </span>
          <span className="w-[9vw] text-right text-[4vw] font-bold font-satoshi md:text-[1vw] invoice-amount" data-total="true">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="flex ml-auto w-[15vw] uppercase text-gray-600">
          <span className="w-[9vw] text-[4vw] font-bold font-satoshi md:text-[1vw]">
            Amount due
          </span>
          <span className="w-[9vw] text-right text-[4vw] font-bold font-satoshi md:text-[1vw]">
            USD ${formatCurrency(total)}
          </span>
        </div>
        <div className="h-[0.2vw] w-[15vw] ml-auto bg-purple-600 mt-4"></div>
      </div>

      {/* Footer */}
      <div className="mt-[3vw]">
        <div>
          <h3 className="font-bold mb-1 text-[4vw] font-satoshi md:text-[1vw]">
            Thanks for the business.
          </h3>
          <p className="text-gray-600 mb-2 text-[4vw] font-satoshi md:text-[0.9vw]">
            Please pay within 15 days of receiving this invoice.
          </p>
          <div className="h-[0.1vw] w-full bg-gray-200 my-4"></div>
        </div>
        <div className="flex justify-end items-center space-x-[1vw]">
          {isStaticMode ? (
            <p className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">
              {invoiceData.email || "hello@email.com"}
            </p>
          ) : (
            <span
              contentEditable
              className="text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
              onInput={(e) => handleFieldChange("email", e.target.textContent)}
            >
              hello@email.com
            </span>
          )}
          <div className="w-[0.1vw] bg-gray-300 h-[1.2vw]"></div>
          {isStaticMode ? (
            <p className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">
              {invoiceData.contactPhone || "+91 00000 00000"}
            </p>
          ) : (
            <span
              contentEditable
              className="text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
              onInput={(e) =>
                handleFieldChange("contactPhone", e.target.textContent)
              }
            >
              +91 00000 00000
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate7;
