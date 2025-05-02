import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./hooks/ProtectedRoute";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RedirectAuthenticatedUser from "./hooks/RedirectAuthenticatedUser";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";

const App = () => {
  return (
    <Router>
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
        <Route path="*" element={<Home />} />
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

        <Route path="/payment-error" element={<Cancel />} />
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
