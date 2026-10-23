import Customize from '../../assets/Videos/customize invoice.mp4'
import Generate from '../../assets/Videos/review and generate.mp4'
import Send from '../../assets/Videos/Send Invoice.mp4'

interface Step {
  id: number
  title: string
  description: string
  videoSrc: string
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Customize Your Invoice',
    description:
      'Input your business details, add line items, set payment terms, and customize the design to match your brand identity.',
    videoSrc: Customize,
  },
  {
    id: 2,
    title: 'Review and Generate',
    description:
      'Preview your invoice, make any necessary adjustments, add notes or terms, and generate a professional PDF with one click.',
    videoSrc: Generate,
  },
  {
    id: 3,
    title: 'Send to Client',
    description:
      'Automatically email the invoice to your client, track when they view it, and receive notifications when payment is made.',
    videoSrc: Send,
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 md:py-24 lg:py-32 lg:px-8">
      <h2 className="text-center text-display-sm font-bold font-satoshi text-neutral-900 mb-12 md:text-display lg:mb-20">
        How It Works
      </h2>

      <div className="max-w-6xl mx-auto flex flex-col gap-16 lg:gap-24">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col items-center gap-8 lg:gap-12 ${
              index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'
            }`}
          >
            {/* Video */}
            <div className="w-full lg:w-1/2 overflow-hidden rounded-card shadow-card-hover border border-neutral-200">
              <video
                src={step.videoSrc}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text */}
            <div className="w-full lg:w-1/2">
              <span className="text-display-sm font-clash text-neutral-300">
                0{step.id}
              </span>
              <h3 className="text-heading-lg font-clash text-neutral-900 mt-2 mb-3">
                {step.title}
              </h3>
              <p className="text-body text-neutral-500 font-satoshi leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
