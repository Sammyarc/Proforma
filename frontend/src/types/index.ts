// ── Tier & Enums ──────────────────────────────────────────────

export type Tier = 'free' | 'pro'

export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'overdue'

export type PaymentMethod = 'paypal' | 'credit_card' | 'bank_transfer'

// ── User ──────────────────────────────────────────────────────

export interface Notification {
  _id: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface PayPalTokens {
  accessToken?: string
  refreshToken?: string
  tokenExpiry?: string
}

export interface User {
  _id: string
  email: string
  name: string
  tier: Tier
  isVerified: boolean
  isGoogleUser: boolean
  lastLogin: string
  profileImage?: string
  isDeleted: boolean
  deletedAt?: string | null
  notifications: Notification[]
  businessName?: string
  city?: string
  country?: string
  state?: string
  phoneNumber?: string
  logoUrl?: string
  paypal?: PayPalTokens
  createdAt: string
  updatedAt: string
}

// ── Invoice ───────────────────────────────────────────────────

export interface Invoice {
  _id: string
  userId: string
  invoiceNumber: string
  clientName: string
  clientAddress: string
  companyName: string
  companyAddress?: string
  description?: string
  amountNumeric: number
  invoiceDate: string
  dueDate: string
  paymentLink?: string
  invoiceUrl: string
  invoiceFileName?: string
  paymentId?: string
  payerId?: string
  paidAt?: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  sentDate: string
  createdAt: string
  updatedAt: string
}

// ── Client (derived from invoice data) ────────────────────────

export interface Client {
  clientName: string
  clientAddress: string
  invoiceCount: number
}

// ── Connections ───────────────────────────────────────────────

export interface Connections {
  paypal: boolean
}

// ── Payment Provider ──────────────────────────────────────────

export type PaymentProvider =
  | 'paypal'
  | 'flutterwave'
  | 'stripe'
  | 'paystack'
  | 'skrill'
  | 'googlepay'

export interface PaymentProviderOption {
  name: string
  provider: PaymentProvider
  icon: string
  connected: boolean
  action: () => void
}

// ── Download/Export ───────────────────────────────────────────

export type DownloadFormat = 'png' | 'jpg'

export type SendStep = 'generating' | 'uploading' | 'sending' | 'success' | 'error'
