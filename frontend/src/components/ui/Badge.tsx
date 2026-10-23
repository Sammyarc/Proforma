import type { PaymentStatus } from '@/types'

interface BadgeProps {
  status: PaymentStatus
  className?: string
}

const statusClasses: Record<PaymentStatus, string> = {
  paid:      'bg-status-success-bg text-green-700 border-green-200',
  pending:   'bg-status-warning-bg text-yellow-700 border-yellow-200',
  cancelled: 'bg-status-error-bg text-red-700 border-red-200',
  overdue:   'bg-status-error-bg text-red-700 border-red-200',
}

const statusLabels: Record<PaymentStatus, string> = {
  paid:      'Paid',
  pending:   'Pending',
  cancelled: 'Cancelled',
  overdue:   'Overdue',
}

export default function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        rounded-badge border text-body-sm font-medium font-satoshi capitalize
        ${statusClasses[status]}
        ${className}
      `}
    >
      {statusLabels[status]}
    </span>
  )
}
