import { useState, useEffect, useRef } from 'react'

export default function Features() {
  const [peopleCount, setPeopleCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)
  const [rateCount, setRateCount] = useState(0)
  const [animationStarted, setAnimationStarted] = useState(false)
  const countersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = countersRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animationStarted) {
          setAnimationStarted(true)
          const duration = 2000
          const interval = 50
          const peopleStep = 1000 / (duration / interval)
          const usersStep = 10000 / (duration / interval)
          const rateStep = 85 / (duration / interval)

          const timer = setInterval(() => {
            setPeopleCount((prev) => Math.min(prev + peopleStep, 1000))
            setUsersCount((prev) => Math.min(prev + usersStep, 10000))
            setRateCount((prev) => Math.min(prev + rateStep, 85))
          }, interval)

          setTimeout(() => clearInterval(timer), duration + 100)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(currentRef)
    return () => observer.unobserve(currentRef)
  }, [animationStarted])

  const formatPeople = () => {
    if (peopleCount >= 1000) return '1K'
    const k = Math.floor(peopleCount / 1000)
    const d = Math.floor((peopleCount % 1000) / 100)
    return d > 0 ? `${k}.${d}K` : `${k}K`
  }

  const formatUsers = () => {
    if (usersCount >= 10000) return '10K'
    return `${Math.floor(usersCount / 1000)}K`
  }

  const stats = [
    { value: `${formatPeople()}+`, label: 'Invoices Generated and Sent' },
    { value: `${formatUsers()}+`, label: 'Active Users' },
    { value: `${Math.floor(rateCount)}%`, label: 'Fast Payments Rating' },
  ]

  return (
    <section className="py-16 md:py-24 lg:py-32" id="features">
      <div
        ref={countersRef}
        className="max-w-4xl mx-auto grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:gap-0"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className={i < stats.length - 1 ? 'md:border-r md:border-neutral-200' : ''}
          >
            <h2 className="text-display-sm font-clash text-neutral-900 md:text-display">
              {stat.value}
            </h2>
            <p className="text-body text-neutral-500 font-satoshi mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
