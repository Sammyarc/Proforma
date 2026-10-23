import type { User, Connections } from './index'

// ── Auth Store ────────────────────────────────────────────────

export interface AuthState {
  user: User | null
  connections: Connections
  isAuthenticated: boolean
  error: string | null
  isLoading: boolean
  isCheckingAuth: boolean
  message: string | null

  clearError: () => void
  clearUser: () => void
  signup: (email: string, password: string, name: string) => Promise<void>
  googleSignIn: (token: string) => Promise<void>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  verifyEmail: (code: string) => Promise<User>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
}

// ── Invoice Store ─────────────────────────────────────────────

export interface InvoiceState {
  invoiceCount: number
  isLoading: boolean
  error: string | null
  periodStart?: string
  nextReset?: string

  fetchInvoiceCount: (userId: string) => Promise<void>
  setInvoiceCount: (count: number) => void
  incrementInvoiceCount: () => void
}
