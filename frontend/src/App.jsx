import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import PageMetadata from "./components/PageMetadata";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./hooks/ProtectedRoute";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RedirectAuthenticatedUser from "./hooks/RedirectAuthenticatedUser";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import DeletedAccountPage from "./pages/DeletedAccountPage";
import Upgrade from "./pages/Upgrade";
import PaymentStatus from "./pages/PaymentStatus";
import UpgradeSuccess from "./pages/UpgradeSuccess";
import UpgradeCancel from "./pages/UpgradeCancel";
import ResultPage from "./components/workspace/ResultPage";

const App = () => {
  return (
    <Router>
      <PageMetadata />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protected dashboard Route */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              {" "}
              <Dashboard />{" "}
            </ProtectedRoute>
          }
        />
        {/* Error Pages */}
        <Route
          path="*"
          element={
            <ResultPage
              tone="help"
              title="Page not found"
              description="This page does not exist or has moved. Return to the Proforma homepage."
              action="Back to Proforma"
              to="/"
            />
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/payment-success" element={<Success />} />
        <Route path="/upgrade-success" element={<UpgradeSuccess />} />

        <Route path="/payment-error" element={<Cancel />} />
        <Route path="/payment-cancelled" element={<Cancel />} />
        <Route path="/upgrade-error" element={<UpgradeCancel />} />
        <Route path="/account-deleted" element={<DeletedAccountPage />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Upgrade />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        theme="light"
        style={{ zIndex: 99999 }}
      />
    </Router>
  );
};

export default App;
