import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

type BillingCycle = 'free' | 'pro'

interface PlanData {
  price: string
  description: string
  features: string[]
}

const pricingData: Record<BillingCycle, PlanData> = {
  free: {
    price: '0',
    description: 'Perfect for individuals and small businesses',
    features: [
      'Up to 10 Invoices per month',
      'Basic customization',
      'PDF generation',
      'Email support',
      'PDF Downloads',
      'Client management',
      'Payment integrations',
    ],
  },
  pro: {
    price: '108',
    description: 'Save 10% with annual billing',
    features: [
      'Create unlimited invoices',
      'Advanced customization',
      'PDF generation',
      'Priority email support',
      'PDF Downloads',
      'Client management',
      'Payment integrations',
      'One month free',
      'Advanced reporting',
    ],
  },
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('free')
  const planData = pricingData[billingCycle]
  const navigate = useNavigate()

  const handleBilling = () => {
    navigate(billingCycle === 'free' ? '/signup' : '/pricing')
  }

  return (
    <section className="py-16 md:py-24 lg:py-32" id="pricing">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <h2 className="text-center text-display-sm font-bold font-satoshi text-neutral-900 mb-8 md:text-display">
          Choose a Plan
        </h2>

        {/* Billing toggle */}
        <div className="flex justify-center gap-1 mb-10">
          {(['free', 'pro'] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`relative px-6 py-2 text-body font-medium font-satoshi transition-colors duration-200 ${
                billingCycle === cycle
                  ? 'border-b-2 border-neutral-800 text-neutral-800'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {cycle === 'free' ? 'Free' : 'Pro'}
              {cycle === 'pro' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-badge bg-status-success-bg text-green-700 border border-green-200 px-2 py-0.5 text-caption font-medium">
                  Save 10%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Two-column pricing */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Left — Price card */}
          <Card className="w-full max-w-md relative lg:w-1/2">
            {billingCycle === 'pro' && (
              <span className="absolute -top-3 right-6 bg-white px-3 py-0.5 text-caption font-semibold text-neutral-500 font-satoshi border border-neutral-200 rounded-badge">
                Recommended
              </span>
            )}

            <div className="pt-2">
              <div className="mt-4 mb-2">
                <span className="text-display font-bold text-neutral-900 font-satoshi">
                  ${planData.price}
                </span>
                {billingCycle === 'pro' && (
                  <span className="text-heading-sm text-neutral-400 font-satoshi">/year</span>
                )}
              </div>
              <p className="text-body text-neutral-500 font-satoshi mb-8">
                {planData.description}
              </p>
              <Button onClick={handleBilling} className="w-full">
                {billingCycle === 'free' ? 'Get Started' : 'Go to Plan'}
              </Button>
            </div>
          </Card>

          {/* Right — Features */}
          <div className="w-full lg:w-1/2 lg:pt-6">
            <h4 className="text-heading font-semibold font-clash text-neutral-900 mb-4">
              What's included:
            </h4>
            <ul className="space-y-3">
              {planData.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="h-5 w-5 text-accent-500 mt-0.5 flex-shrink-0" />
                  <span className="text-body text-neutral-600 font-satoshi">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
