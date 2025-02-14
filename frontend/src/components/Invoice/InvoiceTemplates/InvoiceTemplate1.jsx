import { useState } from "react";
import {FiX, FiUpload} from "react-icons/fi";
import {toast} from 'react-toastify';
import {Plus} from 'lucide-react';


const InvoiceTemplate1 = ({isStaticMode}) => {
    const [invoiceData, setInvoiceData] = useState({
            companyLogo: null,
            companyName: "",
            companyAddress: "",
            cityStateZip: '',
            country: '',
            clientName: "",
            clientAddress: "",
            clientCityStateZip: "",
            clientCountry: "",
            invoiceNumber: '',
            invoiceDate: '',
            dueDate: '',
            items: [
                {
                    description: '',
                    quantity: "",
                    rate: '',
                    amount: 0.00
                }
            ],
            notes: '',
            terms: '',
            tableHeaders: ["Description", "Qty", "Rate", "Amount"]
        });

        const calculateSubTotal = () => {
            return invoiceData
                .items
                .reduce((sum, item) => sum + (item.amount || 0), 0);
        };
    
        const calculateTax = () => {
            return calculateSubTotal() * 0.10;
        };
    
        const calculateTotal = () => {
            return calculateSubTotal() + calculateTax();
        };
    
        const handleItemChange = (index, field, value) => {
            const newItems = [...invoiceData.items];
            newItems[index][field] = value;
    
            if (field === 'quantity' || field === 'rate') {
                newItems[index].amount = newItems[index].quantity * newItems[index].rate;
            }
    
            setInvoiceData({
                ...invoiceData,
                items: newItems
            });
        };
    
        const addNewItem = () => {
            setInvoiceData({
                ...invoiceData,
                items: [
                    ...invoiceData.items, {
                        description: 'Enter a description',
                        quantity: 1,
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
    
        const handleFieldChange = (field, value) => {
            setInvoiceData({
                ...invoiceData,
                [field]: value
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
    
        const handleTableHeaderChange = (index, value) => {
            const newHeaders = [...invoiceData.tableHeaders];
            newHeaders[index] = value;
            setInvoiceData({
                ...invoiceData,
                tableHeaders: newHeaders
            });
        };
        


  return (
    <div>

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

                <div className="flex justify-between items-start my-[1.5vw]">
                    <div className="space-y-2">
                        <div
                            contentEditable
                            className="block text-[5vw] w-full font-bold font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 md:text-[1.5vw]"
                            onInput={(e) => handleFieldChange('companyName', e.target.textContent)}>
                            Company&apos;s Name
                        </div>

                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('companyAddress', e.target.textContent)}>
                            Company&apos;s Address
                        </div>
                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('cityStateZip', e.target.textContent)}>
                            City
                        </div>

                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('country', e.target.textContent)}>
                            State
                        </div>

                    </div>
                    <div className="text-[6vw] font-clash font-bold text-Gray900 md:text-[3vw]">INVOICE</div>
                </div>

                <div className="grid grid-cols-2 gap-[10vw] mb-8">
                    <div className="space-y-2">
                        <div
                            className="text-[4vw] font-satoshi font-semibold text-gray-600 mb-2 md:text-[1vw]">Billed To:</div>

                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('clientName', e.target.textContent)}>
                            Client&apos;s Name
                        </div>

                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('clientAddress', e.target.textContent)}>
                            Client&apos;s Address
                        </div>

                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('clientCityStateZip', e.target.textContent)}>
                            Client&apos;s City</div>

                        <div
                            contentEditable
                            className="block w-full text-[4vw] text-gray-500 font-satoshi focus:outline-none py-1 border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('clientCountry', e.target.textContent)}>Client&apos;s State
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 items-center">
                            <div className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">Invoice No:</div>
                            <div
                                contentEditable
                                className="focus:outline-none border-b border-transparent py-1 hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                                onInput={(e) => handleFieldChange('invoiceNumber', e.target.textContent)}>
                                INV-123456-DC2
                            </div>
                        </div>

                        <div className="grid grid-cols-2 items-center">
                            <div className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">Invoice Date:
                            </div>
                            {
                                isStaticMode
                                    ? (
                                        <div className='text-[4vw] font-satoshi md:text-[1vw]'>{invoiceData.invoiceDate || ""}</div>
                                    )
                                    : (
                                        <input
                                            type="date"
                                            className="focus:outline-none w-[7.5vw] border-b border-transparent py-1 hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                                            value={invoiceData.invoiceDate}
                                            onChange={(e) => handleFieldChange('invoiceDate', e.target.value)}/>
                                    )
                            }
                        </div>

                        <div className="grid grid-cols-2 items-center">
                            <div className="text-gray-600 text-[4vw] font-satoshi md:text-[1vw]">Due Date:</div>

                            {
                                isStaticMode
                                    ? (
                                        <div className='text-[4vw] font-satoshi md:text-[1vw]'>{invoiceData.dueDate || ""}</div>
                                    )
                                    : (
                                        <input
                                            type="date"
                                            className="focus:outline-none w-[7.5vw] border-b border-transparent py-1 hover:border-gray-300 text-[4vw] text-gray-600 font-satoshi md:text-[1vw]"
                                            value={invoiceData.dueDate}
                                            onChange={(e) => handleFieldChange('dueDate', e.target.value)}/>
                                    )
                            }

                        </div>

                    </div>
                </div>

                {/* Editable Table */}
                <table className="w-full mb-5">
                    <thead>
                        <tr className="bg-Gray800 text-white">
                            {
                                invoiceData
                                    .tableHeaders
                                    .map((header, index) => (
                                        <th key={index}>
                                            {
                                                isStaticMode
                                                    ? (
                                                        <p className='text-[4vw] px-2 py-1 text-left font-satoshi md:text-[1vw]'>{header || ""}</p>
                                                    )
                                                    : (
                                                        <input
                                                            type="text"
                                                            className="w-full px-2 py-1 bg-transparent focus:outline-none text-white text-[4vw] font-satoshi md:text-[1vw]"
                                                            value={header}
                                                            onChange={(e) => handleTableHeaderChange(index, e.target.value)}/>
                                                    )
                                            }
                                        </th>
                                    ))
                            }
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
                                                        <p className='text-[4vw] p-2 font-satoshi md:text-[1vw]'>{item.quantity || ""}</p>
                                                    )
                                                    : (
                                                        <input
                                                            type="number"
                                                            className="w-full px-2 py-3 focus:outline-none text-[4vw] font-satoshi md:text-[1vw]"
                                                            value={item.quantity}
                                                            placeholder='1'
                                                            onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value))}/>
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
                                                            className="absolute top-1/2 right-2 transform -translate-y-1/2 hidden group-hover:flex transition-opacity duration-200">
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

                <div className="flex justify-end mb-8">
                    <div className="w-[25vw] space-y-4">
                        <div className="flex justify-between">
                            <span className='text-[4vw] font-satoshi md:text-[1vw]'>Sub Total:</span>
                            <span className='text-[4vw] font-satoshi md:text-[1vw]'>${calculateSubTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className='text-[4vw] font-satoshi md:text-[1vw]'>Sales Tax (10%):</span>
                            <span className='text-[4vw] font-satoshi md:text-[1vw]'>${calculateTax().toFixed(2)}</span>
                        </div>
                        <div
                            className="flex justify-between font-extrabold text-[4vw] font-satoshi md:text-[1vw]">
                            <span>TOTAL:</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <div
                            className="text-gray-800 mb-1 text-[4vw] font-bold font-satoshi md:text-[1vw]">Notes</div>

                        <div
                            contentEditable
                            className="block w-full text-[4vw] font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('notes', e.target.textContent)}>Leave a comment...
                        </div>
                    </div>
                    <div>
                        <div
                            className="text-gray-800 mb-1 text-[4vw] font-bold font-satoshi md:text-[1vw]">Terms & Conditions</div>
                        <div
                            contentEditable
                            className="block w-full text-[4vw] font-satoshi py-2 text-gray-500 focus:outline-none border-b border-transparent hover:border-gray-300 md:text-[1vw]"
                            onInput={(e) => handleFieldChange('terms', e.target.textContent)}>
                            Please make the payment on or before the due date...
                        </div>
                    </div>
                </div>

                </div>
  )
}

export default InvoiceTemplate1