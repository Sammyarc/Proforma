import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useInvoiceStore } from "../store/invoiceStore";

export default function ProtectedRoute({ children }) {
  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();
  const fetchInvoiceCount = useInvoiceStore((s) => s.fetchInvoiceCount);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    let active = true;
    checkAuth().finally(() => {
      if (active) setInitialized(true);
    });
    return () => {
      active = false;
    };
  }, [checkAuth]);
  useEffect(() => {
    if (user?._id) fetchInvoiceCount(user._id);
  }, [user?._id, fetchInvoiceCount]);
  if (!initialized || isCheckingAuth)
    return (
      <div className="ws-result-page" role="status">
        <span className="ws-result-brand">
          proforma<span>.</span>
        </span>
        <Loader2 size={22} className="animate-spin my-6" />
        <p className="ws-small-note">Making room for your day…</p>
      </div>
    );
  if (!isAuthenticated || !user) return <Navigate to="/signup" replace />;
  if (!user.isVerified) return <Navigate to="/verify-email" replace />;
  return children;
}
