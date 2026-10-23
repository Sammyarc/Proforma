import AuthLayout from "../components/Auth/AuthLayout";
import { useState, type FormEvent } from "react";
import { useAuthStore } from "../store/authStore";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, forgotPassword, error } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch {
      /* The store supplies the inline error. */
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-card shadow-card border border-neutral-200 p-8">
        <h2 className="text-center font-satoshi text-heading-lg font-semibold text-neutral-900 mb-2">
          Reset your password
        </h2>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <p className="text-body-sm text-center text-neutral-500 font-satoshi mb-6">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
            <Input
              type="email"
              required
              placeholder="Email Address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmail(email.toLowerCase())}
              icon={<Mail className="h-5 w-5" />}
            />
            {error && (
              <p role="alert" className="text-body-sm text-status-error mt-3">
                {error}
              </p>
            )}
            <Button type="submit" loading={isLoading} className="w-full mt-4">
              Send reset link
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 bg-status-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <p className="text-body-sm text-neutral-500 font-satoshi">
              If an account exists for {email}, you will receive a password
              reset link shortly.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Link
            to="/signup"
            className="text-body-sm font-satoshi text-neutral-500 hover:text-accent-600 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
