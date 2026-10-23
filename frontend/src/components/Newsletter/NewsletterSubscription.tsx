import { useState, type FormEvent } from 'react'
import { Mail, ArrowRight, Check } from 'lucide-react'
import Button from '../ui/Button'

export default function NewsletterSubscription() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setEmail('')
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <section className="mx-4 lg:mx-8 rounded-card bg-neutral-800 py-12 px-6 md:py-16 lg:px-12">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        {/* Left — Form */}
        <div>
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="newsletter-email"
              className="block text-body-sm font-medium text-neutral-300 font-satoshi mb-2"
            >
              Email Address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmail(email.toLowerCase())}
                  className="w-full bg-transparent border border-neutral-600 text-white rounded-input px-3 py-2.5 pr-10 font-satoshi text-body placeholder:text-neutral-500 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              </div>
              <Button type="submit" variant="secondary" className="gap-1.5 whitespace-nowrap">
                Subscribe
                <ArrowRight className="h-4 w-4 hidden sm:block" />
              </Button>
            </div>
            {isSubmitted && (
              <p className="mt-2 text-body-sm font-satoshi text-status-success">
                Thanks for subscribing!
              </p>
            )}
          </form>
        </div>

        {/* Right — Text */}
        <div>
          <h2 className="text-heading-lg font-bold text-white font-satoshi mb-3">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-body text-neutral-400 font-satoshi mb-4">
            Join our subscriber list to get the latest updates, exclusive
            offers, and insights delivered directly to your inbox.
          </p>
          <ul className="space-y-2 text-neutral-400 font-satoshi text-body-sm">
            {['Weekly industry updates', 'Exclusive subscriber discounts', 'Tips and best practices'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
