import type { User, Invoice, Connections, PaymentStatus } from './index'

// ── Auth API ──────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean
  message: string
  user: User
}

export interface CheckAuthResponse {
  success: boolean
  user: User
  connections: Connections
}

export interface MessageResponse {
  success: boolean
  message: string
}

// ── Invoice API ───────────────────────────────────────────────

export interface InvoiceCountResponse {
  success: boolean
  count: number
  periodStart: string
  nextReset: string
  message?: string
}

export interface InvoiceListResponse {
  success: boolean
  invoices: Invoice[]
  total: number
  page: number
  totalPages: number
}

export interface OverviewStatsResponse {
  success: boolean
  totalInvoices: number
  pendingPayments: number
  completedPayments: number
  failedPayments: number
  pendingAmount: number
  completedAmount: number
  failedAmount: number
}

export interface MonthlySummaryItem {
  month: string
  paid: number
  pending: number
  failed: number
}

export interface OverviewSummaryResponse {
  success: boolean
  summary: MonthlySummaryItem[]
}

export interface ClientListItem {
  clientName: string
  clientAddress: string
  invoiceCount: number
}

export interface ClientListResponse {
  success: boolean
  clients: ClientListItem[]
  total: number
  page: number
  totalPages: number
}

// ── Settings API ──────────────────────────────────────────────

export interface UserSettingsResponse {
  success: boolean
  user: {
    businessName?: string
    email: string
    city?: string
    country?: string
    state?: string
    phoneNumber?: string
    logoUrl?: string
  }
}

export interface UploadLogoResponse {
  success: boolean
  logoUrl: string
}

// ── Payment API ───────────────────────────────────────────────

export interface PaymentLinkResponse {
  success: boolean
  paymentUrl: string
}

// ── Pagination ────────────────────────────────────────────────

export interface PaginationParams {
  page: number
  limit: number
  status?: PaymentStatus | 'all'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
