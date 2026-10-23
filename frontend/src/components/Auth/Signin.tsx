import AuthLayout from "./AuthLayout";
import { useEffect, useState, type ChangeEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PassStrengthMeter from "../PasswordStrength/PassStrengthMeter";
import { User, Mail, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import {
  GoogleLogin,
  useGoogleOAuth,
  type CredentialResponse,
} from "@react-oauth/google";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function Signin() {
  const { signup, googleSignIn, login, isLoading, error, clearError } =
    useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(
    searchParams.get("mode") === "register",
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { scriptLoadedSuccessfully, clientId } = useGoogleOAuth();
  const [googleUnavailable, setGoogleUnavailable] = useState(false);
  useEffect(() => {
    if (scriptLoadedSuccessfully) return;
    const timeout = setTimeout(() => setGoogleUnavailable(true), 8000);
    return () => clearTimeout(timeout);
  }, [scriptLoadedSuccessfully]);

  const handleGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      const token = credentialResponse.credential;
      if (token) {
        await googleSignIn(token);
        navigate("/dashboard");
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error("Error during Google Sign-In:", err);
    }
  };

  const clearInputs = () => {
    setName("");
    setEmail("");
    setPassword("");
    setTermsAccepted(false);
  };

  const toggleMode = () => {
    clearError();
    clearInputs();
    setIsRegister(!isRegister);
  };

  const handleRegister = async () => {
    try {
      await signup(email, password, name);
      navigate("/verify-email");
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      if (user) {
        navigate("/dashboard");
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-card shadow-card border border-neutral-200 p-8">
        <h2 className="text-center font-satoshi text-heading-lg font-semibold text-neutral-900 mb-6">
          {isRegister ? "Create your free account" : "Sign in to Proforma"}
        </h2>
        <p className="ws-auth-description">
          {isRegister
            ? "Create branded invoices, email clients, and track payments from your workspace."
            : "Access your invoices, client details, and payment overview."}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isRegister) void handleRegister();
            else void handleLogin();
          }}
        >
          <div className="space-y-4">
            {/* Name — register only */}
            {isRegister && (
              <Input
                type="text"
                placeholder="Full Name"
                required
                autoComplete="name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                icon={<User className="h-5 w-5" />}
              />
            )}

            {/* Email */}
            <Input
              type="email"
              placeholder="Email Address"
              required
              autoComplete="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              onBlur={() => setEmail(email.toLowerCase())}
              icon={<Mail className="h-5 w-5" />}
            />

            {/* Password */}
            <div className="relative">
              <Input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Password"
                required
                minLength={isRegister ? 8 : undefined}
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
                onClick={() => setPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="flex items-center gap-1.5 text-body-sm text-status-error font-satoshi mt-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </p>
          )}

          {/* Password strength — register only */}
          {isRegister && <PassStrengthMeter password={password} />}

          {/* Checkbox row */}
          <div className="flex justify-between items-center mt-4">
            {isRegister ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 rounded accent-accent-600"
                />
                <span className="text-body-sm text-neutral-600 font-satoshi">
                  I accept the Terms and Conditions
                </span>
              </label>
            ) : (
              <>
                <Link
                  to="/forgot-password"
                  className="text-body-sm text-neutral-500 font-satoshi hover:text-accent-600 hover:underline"
                  onClick={() => {
                    clearError();
                    window.scrollTo(0, 0);
                  }}
                >
                  Forgot Password?
                </Link>
              </>
            )}
          </div>

          {/* Submit */}
          <Button
            className="w-full mt-5"
            type="submit"
            disabled={isLoading || (isRegister && !termsAccepted)}
            loading={isLoading}
          >
            {isLoading
              ? isRegister
                ? "Creating Account..."
                : "Authenticating..."
              : isRegister
                ? "Create Account"
                : "Sign in"}
          </Button>
        </form>
        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 border-t border-neutral-200" />
          <span className="text-body-sm text-neutral-400 font-satoshi">OR</span>
          <div className="flex-1 border-t border-neutral-200" />
        </div>

        {/* Google */}
        {scriptLoadedSuccessfully && clientId ? (
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => setGoogleUnavailable(true)}
            useOneTap={false}
            theme="outline"
            text="signin_with"
            shape="rectangular"
            auto_select={false}
          />
        ) : (
          <p className="ws-google-status" role="status">
            {googleUnavailable || !clientId ? (
              "Google sign-in is unavailable. You can continue with email."
            ) : (
              <>
                <Loader2 size={15} className="animate-spin" />
                Loading Google sign-in…
              </>
            )}
          </p>
        )}
        {googleUnavailable && scriptLoadedSuccessfully && clientId && (
          <p className="ws-google-status" role="alert">
            Google sign-in couldn’t complete. Please try again or use email.
          </p>
        )}

        {/* Toggle */}
        <button
          onClick={() => {
            toggleMode();
            window.scrollTo(0, 0);
          }}
          className="mt-5 w-full text-body-sm font-satoshi font-medium text-neutral-500 hover:text-accent-600 transition-colors"
        >
          {isRegister
            ? "Already have an account? Sign in"
            : "Don't have an account? Register"}
        </button>
      </div>
    </AuthLayout>
  );
}
