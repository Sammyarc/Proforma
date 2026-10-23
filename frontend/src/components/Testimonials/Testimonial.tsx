interface TestimonialItem {
  quote: string
  name: string
  title: string
  image: string
}

const testimonials: TestimonialItem[] = [
  {
    quote: 'This tool has completely transformed the way I manage invoices. It\'s fast, efficient, and user-friendly.',
    name: 'Jane Doe',
    title: 'Freelancer',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    quote: 'I love the customization options. My invoices look professional, and my clients appreciate it!',
    name: 'John Smith',
    title: 'Small Business Owner',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    quote: 'The platform\'s ease of use and seamless payment integration has saved me so much time. Highly recommend!',
    name: 'Emily Clark',
    title: 'Agency Owner',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    quote: 'An incredible tool that makes invoicing smooth and simple. My productivity has increased significantly!',
    name: 'Michael Lee',
    title: 'Entrepreneur',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
]

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  return (
    <div className="bg-white shadow-card rounded-card p-6 lg:p-8 mx-3 min-w-[280px] lg:min-w-[380px] border border-neutral-100">
      <p className="whitespace-normal text-body text-neutral-600 font-satoshi mb-4 leading-relaxed">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h4 className="text-body-sm font-semibold text-neutral-800 font-satoshi">
            {testimonial.name}
          </h4>
          <p className="text-caption text-neutral-500 font-satoshi">
            {testimonial.title}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Testimonial() {
  const doubled = [...testimonials, ...testimonials]

  return (
    <section className="py-16 md:py-24 lg:py-32">
      <h2 className="text-display-sm text-center font-bold font-satoshi text-neutral-900 mb-12 md:text-display">
        What Our Users Say
      </h2>

      {/* Carousel 1 — scroll right */}
      <div className="relative mb-6">
        <div className="absolute top-0 left-0 h-full w-[15%] bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
        <div className="overflow-x-clip">
          <div className="animate-scroll">
            {doubled.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-[15%] bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Carousel 2 — scroll left */}
      <div className="relative">
        <div className="absolute top-0 left-0 h-full w-[15%] bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
        <div className="overflow-x-clip">
          <div className="animate-scroll-reverse">
            {doubled.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-[15%] bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  )
}
