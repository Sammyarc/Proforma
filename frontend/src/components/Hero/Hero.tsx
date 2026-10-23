import HeroImage from '../../assets/Images/proforma-dashboard.png'
import HeroRating from '../Ratings/HeroRating'

export default function Hero() {
  return (
    <section className="relative px-4 pt-32 pb-16 text-center md:pt-40 md:pb-20 lg:pt-48 lg:pb-24 lg:px-8">
      {/* Grid Background */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        {/* Pill badge */}
        <span className="inline-flex items-center px-4 py-1.5 mb-6 bg-neutral-100 border border-neutral-200 rounded-full text-body-sm text-neutral-600 font-satoshi">
          Fast and Easy Custom Invoice Generator
        </span>

        {/* Heading */}
        <h1 className="font-satoshi text-display-sm font-extrabold text-neutral-900 md:text-display lg:text-display-lg">
          Create invoices in seconds, get paid faster
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-body-lg text-neutral-500 font-satoshi max-w-2xl">
          Streamline your billing process with Proforma — create professional,
          customizable invoices in seconds, automate repetitive tasks, and
          ensure faster payments.
        </p>

        <HeroRating />

        {/* Dashboard preview */}
        <img
          src={HeroImage}
          alt="Proforma dashboard"
          className="mt-12 w-full max-w-5xl rounded-card border border-neutral-200 shadow-elevated"
        />
      </div>
    </section>
  )
}
