import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

const FaQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What’s included in the free plan?",
      answer:
        "The free plan allows you to create up to 5 invoices per month with basic customization options, such as adding your company logo and essential client details. It also includes email support for any issues you encounter.",
    },
    {
      question: "Can I customize my invoices?",
      answer:
        "Yes, you can customize your invoices by adding your company logo, choosing from predefined templates, and adjusting colors and fonts to match your branding. Advanced customization options are available in the Pro and Business plans.",
    },
    {
      question: "How secure is Proforma?",
      answer:
        "We take security seriously. Proforma uses end-to-end encryption to protect your data and financial information. Your invoices are securely stored, and our platform complies with industry security standards to ensure safety for you and your clients.",
    },
    {
      question: "What payment methods can my clients use?",
      answer:
        "Your clients can make payments through multiple methods, including credit/debit cards, PayPal, and bank transfers. Payment options can be included directly in the invoice for your clients' convenience.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="container mx-auto">
      <div className="px-[2vw] h-full my-[8vw] lg:my-[5vw] lg:w-[60vw] lg:mx-auto">
        <h1 className="text-[7vw] text-center font-satoshi font-bold mb-[4vw] leading-tight lg:text-[3vw] lg:mb-[2vw]">
          Frequently Asked Questions
        </h1>
        <div className="my-[8vw] space-y-[5vw] lg:space-y-[1vw] lg:my-[2vw]">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden ${
                openIndex === index
                  ? "border-gray-300 bg-White"
                  : "border-gray-300"
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full text-left py-[3vw] px-[3vw] lg:py-[0.7vw] lg:px-[1vw] flex justify-between items-center space-x-[2.5vw] lg:space-x-0 ${
                  openIndex === index
                    ? "text-Primary border-Primary border-b"
                    : "bg-Gray50"
                }`}
              >
                <span className="text-[4vw] lg:text-[1.1vw] font-satoshi font-bold">
                  {faq.question}
                </span>
                <span
                  className={`text-[5vw] lg:text-[1.3vw] p-[1vw] lg:p-[0.5vw] rounded-full ${
                    openIndex === index
                      ? "text-Gray800 bg-[#F5F5F2]"
                      : "bg-White"
                  }`}
                >
                  {openIndex === index ? <FiMinus /> : <FiPlus />}
                </span>
              </button>
              {openIndex === index && faq.answer && (
                <div className="text-[3.5vw] p-[2.5vw] lg:p-[1vw] font-satoshi font-normal text-Gray600 lg:text-[1vw]">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaQ;
