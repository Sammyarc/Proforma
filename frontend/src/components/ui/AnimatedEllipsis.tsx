import { useState, useEffect } from 'react'

interface AnimatedEllipsisProps {
  interval?: number
}

export default function AnimatedEllipsis({ interval = 500 }: AnimatedEllipsisProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, interval)
    return () => clearInterval(timer)
  }, [interval])

  return <span>{dots}</span>
}
