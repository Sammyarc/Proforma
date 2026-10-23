import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  children: ReactNode
}

export default function Card({ hoverable = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-card border border-neutral-200 shadow-card p-6
        ${hoverable ? 'hover:shadow-card-hover transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
