import {useEffect, useRef, useState} from 'react';
import {Download} from 'lucide-react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {IoIosArrowDown} from "react-icons/io";
import TextEditor from '../Toolbar/TextEditor';
import DownloadPopup from '../Dashboard/Popups/DownloadPopup';
import {PiExportLight} from 'react-icons/pi';
import InvoiceTemplateSelector from './InvoiceTemplateSelector';
import InvoiceTemplate1 from './InvoiceTemplates/InvoiceTemplate1';
import Export from '../Dashboard/Popups/Export';
import SendingEmailModal from '../Dashboard/Forms/SendingEmailModal';

const InvoiceGenerator = () => {

    const [isStaticMode, setIsStaticMode] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const invoiceRef = useRef(null);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [showSendingModal, setSendingModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const toggleStaticMode = () => {
        setIsStaticMode(!isStaticMode);
    };

    const toggleExport =() => {
        setIsExportOpen(!isExportOpen);
    };

    const toggleDownload = () => {
        setIsDownloadOpen(!isDownloadOpen);
    };

    const handleSendingEmailModal = () => {
        setSendingModal(true);
        toggleExport();
    }

    const handleEmailModalClose = () => {
        setSendingModal(false);
    };

    // Disable scrolling when the modal is open
    useEffect(() => {
        if (showSendingModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    
        // Cleanup function to restore scrolling when component unmounts
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showSendingModal]);

    const handleTemplateSelection = (template) => {
        setSelectedTemplate(template);

        // Scroll to the invoice template container
        if (invoiceRef.current) {
            window.scrollTo({
              top: 0,
              behavior: "auto"
            });
        }
    };

    const exportToPDF = async () => {
        toggleStaticMode(true); // Convert to static text before exporting
        setIsExporting(true); 

        setTimeout(() => {
            const invoiceElement = document.getElementById("invoice");

            html2canvas(invoiceElement, {scale: 2}).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");

                const imgWidth = 210; // A4 width in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
                pdf.save("invoice.pdf");

                toggleStaticMode(false); // Revert back to editable fields
                setIsExporting(false);
                toggleExport();
            });
        }, 500);
    };

    const handleDownloadPNG = () => {
        setIsDownloading(true);
        toggleStaticMode(true); // Convert to static text before exporting

        setTimeout(() => {
            const invoiceElement = document.getElementById("invoice");

            html2canvas(invoiceElement, {scale: 1.3}).then((canvas) => {
                const imgData = canvas.toDataURL("image/png", 0.1);
                const link = document.createElement("a");
                link.href = imgData;
                link.download = "invoice.png";
                link.click();
                toggleStaticMode(false); // Revert back to editable fields
                setIsDownloading(false);
                toggleDownload();
            });
        }, 500);
    };

    const handleDownloadJPG = () => {
        setIsDownloading(true);
        toggleStaticMode(true); // Convert to static text before exporting

        setTimeout(() => {
            const invoiceElement = document.getElementById("invoice");

            html2canvas(invoiceElement, {scale: 2}).then((canvas) => {
                const imgData = canvas.toDataURL("image/jpg", 1);
                const link = document.createElement("a");
                link.href = imgData;
                link.download = "invoice.jpg";
                link.click();
                toggleStaticMode(false); // Revert back to editable fields
                setIsDownloading(false);
                toggleDownload();
            });
        }, 500);

    };

    const handleFormat = (command, value = null) => {
        if (command === "undo" || command === "redo") {
            document.execCommand(command, false, null);
        } else if (command === "formatBlock") {
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, null);
        }
    };

    const handleFontChange = (font) => {
        // Load font dynamically from Google Fonts (if not already loaded)
        const fontKey = font.replace(/ /g, "+");
        if (!document.querySelector(`link[data-font="${fontKey}"]`)) {
            const link = document.createElement("link");
            link.href = `https://fonts.googleapis.com/css2?family=${fontKey}:wght@400;700&display=swap`;
            link.rel = "stylesheet";
            link.setAttribute("data-font", fontKey);
            document
                .head
                .appendChild(link);
        }

        const selection = window.getSelection();
        if (!selection.rangeCount) 
            return;
        const range = selection.getRangeAt(0);

        // Helper: find an ancestor element that is a <span> with a fontFamily style
        const findFontAncestor = (node) => {
            while (node && node !== document.body) {
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SPAN" && node.style.fontFamily) {
                    return node;
                }
                node = node.parentNode;
            }
            return null;
        };

        // Check if the selection is already inside an element with a font applied
        const anchorNode = selection.anchorNode;
        const fontAncestor = findFontAncestor(anchorNode);

        if (fontAncestor) {
            // If the entire selection is inside the same element, update its font
            // Note: For partial selections across multiple elements, more granular handling
            // is needed.
            fontAncestor.style.fontFamily = font;
        } else {
            // Otherwise, wrap the selected text in a new span with the chosen font
            const span = document.createElement("span");
            span.style.fontFamily = font;
            span.appendChild(range.extractContents());
            range.insertNode(span);
        }

        // Optionally, clear the selection (if desired)
        selection.removeAllRanges();
    };

    const handleFontSizeChange = (size) => {
        document.execCommand("fontSize", false, size);
    };

    return (
        <div>
            <div className='fixed bg-[#F5F5F2] p-[1vw] top-[6vw] right-0 left-[15vw] z-[1]'>
                <div className='flex justify-between items-center'>
                    <TextEditor
                        onFormat={handleFormat}
                        onFontChange={handleFontChange}
                        onFontSizeChange={handleFontSizeChange}/>
                    <div className='flex items-center space-x-[1vw]'>
                        <div className='relative'>
                            <button
                                onClick={toggleDownload}
                                className="flex items-center text-[4vw] font-satoshi gap-2 bg-cyan-700 box text-white px-4 py-3 rounded-xl md:text-[1vw]">
                                <Download size={16}/>
                                <span className='border-r pr-[0.8vw] border-white h-full'>Download Invoice</span>
                                <IoIosArrowDown size={16} className={`transition-transform duration-300 ${isDownloadOpen ? "rotate-180" : "rotate-0"}`}/>
                            </button>
                            {
                                isDownloadOpen && (
                                    <DownloadPopup
                                        onDownloadPNG={handleDownloadPNG}
                                        onDownloadJPG={handleDownloadJPG}
                                        isDownloading={isDownloading}/>
                                )
                            }
                        </div>

                        <div className='relative'>
                        <button
                            onClick={toggleExport}
                            className='flex items-center box text-[4vw] font-satoshi gap-2 px-4 py-3 rounded-xl text-white bg-indigo-700 md:text-[1vw]'>
                            <PiExportLight size={20}/> 
                            <span className='border-r pr-[0.8vw] border-white h-full'>Export</span>
                            <IoIosArrowDown size={16} className={`transition-transform duration-300 ${isExportOpen ? "rotate-180" : "rotate-0"}`}/>
                        </button>
                        {
                                isExportOpen && (
                                    <Export onExportPDF={exportToPDF} onExportEmail={handleSendingEmailModal} isExporting={isExporting}/>
                                )
                        }
                        </div>
                        {showSendingModal && (<SendingEmailModal onClose={handleEmailModalClose} toggleStaticMode={toggleStaticMode}/>)}
                    </div>

                </div>
            </div>

            <div className='flex justify-between mr-[1vw] space-x-[2vw]'>
                {/* Invoice Templates */}
                <div className='sticky w-1/4 top-[25vh] h-[70vh] mt-[5vw] border border-neutral-400 rounded-3xl box overflow-y-scroll scrollbar-hide'>
                   <div className='sticky top-0 z-[1] bg-[#F5F5F2]'>
                    <h1 className="text-[4vw] text-center font-bold font-satoshi py-3 md:text-[1.3vw]">Choose an Invoice Template</h1>
                   </div>
                  <InvoiceTemplateSelector onSelectTemplate={handleTemplateSelection} />
                </div>
                {/* Invoice Canvass */}
                <div ref={invoiceRef} id='invoice' className='w-3/4 mx-auto mt-[5vw] p-[2vw] bg-white shadow-lg'>
                {selectedTemplate ? (
                <selectedTemplate.component isStaticMode={isStaticMode} 
                setIsStaticMode={setIsStaticMode}/>
            ) : (
          <InvoiceTemplate1  isStaticMode={isStaticMode} setIsStaticMode={setIsStaticMode}/>
        )}
      </div>
            </div>
            

        </div>

    );
};

export default InvoiceGenerator;