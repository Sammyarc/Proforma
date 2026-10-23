// Keep auth, usage, billing and workspace requests on the same API origin.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://proforma-sohi.vercel.app")
).replace(/\/+$/, "");
