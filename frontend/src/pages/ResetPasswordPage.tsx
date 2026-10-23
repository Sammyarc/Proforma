import AuthLayout from "../components/Auth/AuthLayout";
import { useState, type FormEvent } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, error, isLoading, message } = useAuthStore();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      if (token) {
        await resetPassword(token, password);
        toast.success(
          "Password reset successfully, redirecting to login page...",
        );
        setTimeout(() => navigate("/signup"), 2000);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error resetting password";
      toast.error(errorMessage);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-card shadow-card border border-neutral-200 p-8">
        <h2 className="text-center font-satoshi text-heading-lg font-semibold text-neutral-900 mb-6">
          Set a new password
        </h2>

        {error && (
          <p className="text-body-sm text-status-error font-satoshi mb-4">
            {error}
          </p>
        )}
        {message && (
          <p className="text-body-sm text-status-success font-satoshi mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" />}
            required
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" />}
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? "Resetting..." : "Save new password"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
