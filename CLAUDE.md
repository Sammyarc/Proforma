# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Proforma is a full-stack invoice generation SaaS application. Users can create, customize, and send professional invoices with integrated payment tracking. It has a tiered system (free vs pro) with monthly invoice limits.

## Tech Stack

- **Frontend:** React 18 + Vite, TailwindCSS, Zustand (state), React Router v7, Axios
- **Backend:** Node.js + Express, MongoDB/Mongoose, JWT auth (HTTP-only cookies)
- **Payments:** PayPal OAuth (encrypted token storage with AES-256-CBC), Stripe, Flutterwave
- **Auth:** Email/password (bcryptjs), Google OAuth 2.0, PayPal OAuth
- **Email:** Nodemailer + Google Mail API
- **File Upload:** Multer + Cloudinary
- **PDF:** jspdf + html2canvas

## Development Commands

### Frontend (`frontend/`)
```bash
npm run dev        # Vite dev server on port 5173
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (`server/`)
```bash
npm run dev        # Nodemon dev server on port 3000
npm start          # Production (cross-env NODE_ENV=production)
```

Both directories have independent `package.json` files — run `npm install` in each.

## Architecture

### Monorepo Layout
- `frontend/` — React SPA (Vite)
- `server/` — Express API server

### Frontend Structure
- `src/pages/` — Route-level page components (Home, Dashboard, Signup, Settings, etc.)
- `src/components/` — Reusable UI organized by feature (Auth/, Dashboard/, Invoice/, etc.)
- `src/store/` — Zustand stores: `authStore.js` (user/auth state + all auth actions), `invoiceStore.js` (invoice counts/tier limits)
- `src/hooks/` — `ProtectedRoute.jsx` (auth guard), `RedirectAuthenticatedUser.jsx`, `UsePaymentHandlers.jsx`
- `src/assets/` — Images, fonts, Lottie animations

### Backend Structure
- `routes/` — Express route files (auth, invoice, paypal, payment, settings, upgrade)
- `controllers/` — Business logic (auth.controller.js)
- `models/` — Mongoose schemas: `user.model.js`, `invoice.model.js`, `invoice.log.js`
- `middleware/` — `verifyToken.js` (JWT from cookies), `usageLimit.js` (monthly invoice cap)
- `mails/` — Email routes, config, templates (Nodemailer + Gmail API)
- `utils/` — `encrypt.js` (AES-256-CBC), `generateTokenAndSetCookie.js`
- `cronJobs/` — `deleteOldUsers.js` (scheduled cleanup)

### Data Flow Pattern
Frontend Zustand actions → Axios requests (withCredentials: true) → Express routes → JWT middleware → MongoDB → JSON response → Zustand state update → React re-render

### API URL Resolution
Frontend detects dev vs prod via `import.meta.env.MODE`:
- Dev: `http://localhost:3000`
- Prod: Vercel deployment URL

### Authentication Flow
1. JWT tokens set as HTTP-only cookies by the server
2. `ProtectedRoute` component checks auth on mount via `checkAuth()` store action
3. Email verification required before dashboard access
4. PayPal OAuth tokens encrypted with AES-256-CBC before database storage

## Key Conventions

- **ES Modules** throughout (both frontend and server use `"type": "module"`)
- **TailwindCSS** for all styling with custom fonts (Satoshi, Clash Display) and custom colors (Gray900, Gray800, MilkWhite, etc.) defined in `tailwind.config.js`
- **No TypeScript** — plain JSX/JS files
- **Toast notifications** via react-toastify for user feedback
- **Axios with credentials** — all API calls use `withCredentials: true` for cookie-based auth
- **MongoDB indexes** on invoice collection: `{ userId: 1, status: 1 }` and `{ userId: 1, invoiceDate: -1 }`
