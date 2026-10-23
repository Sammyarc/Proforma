import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: "What's included in the free plan?",
    answer:
      'The free plan allows you to create up to 5 invoices per month with basic customization options, such as adding your company logo and essential client details. It also includes email support for any issues you encounter.',
  },
  {
    question: 'Can I customize my invoices?',
    answer:
      'Yes, you can customize your invoices by adding your company logo, choosing from predefined templates, and adjusting colors and fonts to match your branding. Advanced customization options are available in the Pro and Business plans.',
  },
  {
    question: 'How secure is Proforma?',
    answer:
      'We take security seriously. Proforma uses end-to-end encryption to protect your data and financial information. Your invoices are securely stored, and our platform complies with industry security standards to ensure safety for you and your clients.',
  },
  {
    question: 'What payment methods can my clients use?',
    answer:
      'Your clients can make payments through multiple methods, including credit/debit cards, PayPal, and bank transfers. Payment options can be included directly in the invoice for your clients\u2019 convenience.',
  },
]

export default function FaQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-16 px-4 md:py-24 lg:py-32">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-display-sm text-center font-satoshi font-bold text-neutral-900 mb-10 md:text-display">
          Frequently Asked Questions
        </h1>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-card overflow-hidden transition-colors ${
                openIndex === index
                  ? 'border-neutral-300 bg-white'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full text-left py-4 px-5 flex justify-between items-center gap-4 ${
                  openIndex === index ? 'border-b border-neutral-200' : ''
                }`}
              >
                <span className="text-body font-satoshi font-medium text-neutral-800">
                  {faq.question}
                </span>
                <span className="flex-shrink-0 p-1 rounded-full bg-neutral-100 text-neutral-600">
                  {openIndex === index ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-5 py-4 text-body-sm text-neutral-500 font-satoshi leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
