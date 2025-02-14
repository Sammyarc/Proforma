import { Plus } from 'lucide-react';
import {useState} from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import {toast} from 'react-toastify';

const InvoiceTemplate3 = ({
    isStaticMode
}) => {
    const [invoiceData, setInvoiceData] = useState({
        companyLogo: null,
        businessCountry: '',
        businessCity:'',
        businessTaxInfo: '',
        companyName: '',
        companyAddress: '',
        cityCountry: '',
        phone: '',
        invoiceNumber: '',
        reference: '',
        invoiceDate: '',
        dueDate: '',
        email: '',
        contactPhone: '',
        items: [
            {
                description: '',
                qty: '',
                rate: '',
                amount: 0.00
            }
        ],
        notes: '',
    });

    const handleFieldChange = (field, value) => {
      setInvoiceData({
          ...invoiceData,
          [field]: value
      });
    };

    const handleItemChange = (index, field, value) => {
      const newItems = [...invoiceData.items];
       newItems[index][field] = value;

       if (field === 'qty' || field === 'rate') {
        newItems[index].amount = newItems[index].qty * newItems[index].rate;
      }

      setInvoiceData({
        ...invoiceData,
        items: newItems
      });
    };

    const handleLogoUpload = (e) => {
      const file = e
          .target
          .files[0];
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
            ...invoiceData.items, {
                description: 'Enter a description',
                qty: 1,
                rate: 0.00,
                amount: 0.00
            }
        ]
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
        items: invoiceData
            .items
            .filter((_, index) => index !== indexToRemove)
      });
    };

    const subtotal = invoiceData
        .items
        .reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between mb-12">
                <div
                    className="relative group w-[8vw] h-[8vw] rounded-md flex items-center justify-center cursor-pointer"
                    onClick={() => document.getElementById("fileInput").click()}>
                    {
                        invoiceData.companyLogo
                            ? (
                                <> < img src = {
                                    invoiceData.companyLogo
                                }
                                alt = "Company Logo" className = "w-full h-full object-cover rounded-md" /> <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent file input trigger
                                        removeLogo();
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <FiX size={16}/>
                                </button>
                            </>
                            )
                            : <div
                                    className="flex flex-col items-center justify-center rounded-md text-gray-400 w-[8vw] h-[8vw] border-2 border-dashed border-gray-300 hover:border-gray-400">
                                    <FiUpload size={24}/>
                                    <p className="text-[4vw] font-satoshi mt-1 md:text-[1vw]">Upload Logo</p>
                                </div>
                    }

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"/>
                </div>
                <div className="text-right space-y-2">
                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('businessCountry', e.target.textContent)}>
                            Country
                        </div>
                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('businessCity', e.target.textContent)}>
                            City
                        </div>
                        <div className="flex space-x-[0.5vw]">
                            <h2 className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">TAX ID:</h2>
                            {
                                isStaticMode
                                    ? (
                                        <div className='text-[4vw] font-satoshi md:text-[1vw]'>{invoiceData.businessTaxInfo || "00XXXXX1234X0XX"}</div>
                                    )
                                    : (
                            <div
                                contentEditable
                                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                                onInput={(e) => handleFieldChange('businessTaxInfo', e.target.textContent)}>
                               00XXXXX1234X0XX
                            </div>
                            )}
                        </div>
                </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-[5vw]">
            <div>
                    <h2 className="text-[4vw] font-satoshi font-semibold text-gray-900 mb-2 md:text-[1vw]">Billed to:</h2>
                    <div className="space-y-4">
                        <div
                            contentEditable
                            className="block text-[5vw] w-[20vw] font-bold font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1.5vw]"
                            onInput={(e) => handleFieldChange('companyName', e.target.textContent)}>
                            Company&apos;s Name
                        </div>

                        <div
                            contentEditable
                            className="block w-[20vw] text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('companyAddress', e.target.textContent)}>
                            Company&apos;s Address
                        </div>
                        <div
                            contentEditable
                            className="block w-[20vw] text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('cityCountry', e.target.textContent)}>
                            Country
                        </div>

                        <div
                            contentEditable
                            className="block w-[20vw] text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('phone', e.target.textContent)}>
                            +0 (000) 123-4567
                        </div>

                    </div>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 space-x-[2vw] mb-8">
              <div className='flex justify-between'>
                <div className='flex flex-col'>
                    <p className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">Due Date:</p>
                            {
                                isStaticMode
                                    ? (
                                        <p className='text-[4vw] font-satoshi md:text-[1vw]'>{invoiceData.dueDate || ""}</p>
                                    )
                                    : (
                                        <input
                                            type="date"
                                            className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                                            value={invoiceData.dueDate}
                                            onChange={(e) => handleFieldChange('dueDate', e.target.value)}/>
                                    )
                            }
                </div>
                <div className='flex flex-col'>
                      <p className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">Invoice Date:</p>
                            {
                                isStaticMode
                                    ? (
                                        <p className='text-[4vw] font-satoshi md:text-[1vw]'>{invoiceData.invoiceDate || ""}</p>
                                    )
                                    : (
                                        <input
                                            type="date"
                                            className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                                            value={invoiceData.invoiceDate}
                                            onChange={(e) => handleFieldChange('invoiceDate', e.target.value)}/>
                                    )
                            }
                </div>
              </div>
              <div className='flex justify-between'>
                    <div className="flex flex-col">
                        <h2 className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">Invoice Number:</h2>
                            <p
                                contentEditable
                                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-900 font-satoshi font-bold md:text-[1vw]"
                                onInput={(e) => handleFieldChange('invoiceNumber', e.target.textContent)}>
                                #AB2324-01
                            </p>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">Reference:</h2>
                            <p
                                contentEditable
                                className="focus:outline-none border-b border-transparent hover:border-gray-300 text-[4vw] text-gray-900 font-satoshi font-bold md:text-[1vw]"
                                onInput={(e) => handleFieldChange('reference', e.target.textContent)}>
                                INV-057
                            </p>
                    </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
                <table className="w-full">
                    <thead>
                        <tr className="border-b text-gray-600">
                            <th className="text-left text-[4vw] p-2 font-satoshi md:text-[1.2vw]">Item description</th>
                            <th className="text-[4vw] p-2 font-satoshi md:text-[1.2vw] text-left">Qty</th>
                            <th className="text-[4vw] p-2 font-satoshi md:text-[1.2vw] text-left">Rate</th>
                            <th className="text-[4vw] p-2 font-satoshi md:text-[1.2vw] text-left">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            invoiceData
                                .items
                                .map((item, index) => (
                                    <tr key={index} className="border-b group relative">
                                        <td>
                                            {
                                                isStaticMode
                                                    ? (
                                                        <p className='text-[4vw] w-[35vw] p-2 font-satoshi md:text-[1vw]'>{item.description || ""}</p>
                                                    )
                                                    : (
                                                        <input
                                                            type="text"
                                                            className="w-[35vw] px-2 py-3 focus:outline-none text-[4vw] font-satoshi md:text-[1vw]"
                                                            value={item.description}
                                                            placeholder='Enter a description'
                                                            onChange={(e) => handleItemChange(index, "description", e.target.value)}/>
                                                    )
                                            }

                                        </td>
                                        <td>
                                            {
                                                isStaticMode
                                                    ? (
                                                        <p className='text-[4vw] p-2 font-satoshi md:text-[1vw]'>{item.qty || ""}</p>
                                                    )
                                                    : (
                                                        <input
                                                            type="number"
                                                            className="w-full px-2 py-3 focus:outline-none text-[4vw] font-satoshi md:text-[1vw]"
                                                            value={item.qty}
                                                            placeholder='1'
                                                            onChange={(e) => handleItemChange(index, "qty", parseFloat(e.target.value))}/>
                                                    )
                                            }

                                        </td>
                                        <td>
                                            {
                                                isStaticMode
                                                    ? (
                                                        <p className='text-[4vw] p-2 font-satoshi md:text-[1vw]'>{item.rate || ""}</p>
                                                    )
                                                    : (
                                                        <input
                                                            type="number"
                                                            className="w-full px-2 py-3 focus:outline-none text-[4vw] font-satoshi md:text-[1vw]"
                                                            value={item.rate}
                                                            placeholder='0.00'
                                                            onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value))}/>
                                                    )
                                            }
                                        </td>

                                        <td>
                                            {
                                                isStaticMode
                                                    ? (
                                                        <p className='text-[4vw] p-2 font-satoshi md:text-[1vw]'>{
                                                                item
                                                                    .amount
                                                                    .toFixed(2)
                                                            }</p>
                                                    )
                                                    : (
                                                        <span className='text-[4vw] px-2  font-satoshi md:text-[1vw]'>
                                                            {
                                                                item
                                                                    .amount
                                                                    .toFixed(2)
                                                            }</span>
                                                    )
                                            }

                                        </td>
                                        <td className="relative px-2 pb-4">
                                            {
                                                isStaticMode
                                                    ? ('')
                                                    : (
                                                        <div
                                                            className="absolute top-1/2 right-0 transform -translate-y-1/2 hidden group-hover:flex transition-opacity duration-200">
                                                            <button
                                                                onClick={() => deleteItem(index)}
                                                                title='Remove Item'
                                                                className="text-white bg-red-500 p-[0.2vw] rounded-full">
                                                                <FiX size={16}/>
                                                            </button>
                                                        </div>
                                                    )
                                            }
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            </div>

            {
                    isStaticMode
                        ? ('')
                        : (
                            <button
                                onClick={addNewItem}
                                className="flex items-center gap-2 text-blue-400 mb-4 text-[4vw] font-satoshi md:text-[1vw]">
                                <Plus size={16}/>
                                Add Line Item
                            </button>
                        )
            }


            {/* Totals */}
            <div className="flex flex-col items-end space-y-[1vw] mr-[2vw]">
                <div className="flex justify-between w-[20vw]">
                    <span className='text-[4vw] font-satoshi md:text-[1vw]'>Subtotal:</span>
                    <span className='text-[4vw] font-satoshi md:text-[1vw]'>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b w-[20vw]">
                    <span className='text-[4vw] font-satoshi md:text-[1vw]'>Tax (10%):</span>
                    <span className='text-[4vw] font-satoshi md:text-[1vw]'>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[4vw] w-[20vw] font-bold font-satoshi md:text-[1vw]">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                {/* Total Due Button */}
                <div
                  className="bg-blue-400 w-[20vw] text-white rounded-b-lg px-3 py-2 flex justify-between items-center mb-4">
                    <p className='text-[4vw] text-white font-bold font-satoshi md:text-[1.1vw]'>Total due</p>
                    <p className="text-[4vw] text-white font-bold font-satoshi md:text-[1.1vw]">USD ${total.toFixed(2)}</p>
                </div>
            </div>


            {/* Footer */}
            <div className="flex justify-between text-gray-500 mt-[4vw] text-sm">
                <div>
                        <div
                            className="text-gray-800 text-[4vw] font-bold font-satoshi md:text-[1vw]">Notes
                        </div>
                        <div
                            contentEditable
                            className="block w-full text-[4vw] font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('notes', e.target.textContent)}>Thanks for the business...
                        </div>
                </div>
                <div className="text-right">
                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('contactPhone', e.target.textContent)}>
                            +91 00000 00000
                        </div>
                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('email', e.target.textContent)}>
                            hello@email.com
                        </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate3;