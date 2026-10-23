import AuthLayout from "../components/Auth/AuthLayout";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";

export default function EmailVerificationPage() {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { error, isLoading, verifyEmail } = useAuthStore();

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      await verifyEmail(verificationCode);
      navigate("/dashboard");
      toast.success("Email verified successfully");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit") as unknown as FormEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-card shadow-card border border-neutral-200 p-8">
        <h2 className="text-center font-satoshi text-heading-lg font-semibold text-neutral-900 mb-2">
          Verify your email
        </h2>
        <p className="text-body-sm text-center text-neutral-500 font-satoshi mb-6">
          Enter the 6-digit code from your Proforma verification email to
          activate your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                aria-label={`Verification digit ${index + 1}`}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-heading-sm font-bold bg-white border border-neutral-200 font-satoshi rounded-input focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
              />
            ))}
          </div>

          {error && (
            <p className="text-body-sm text-status-error font-satoshi">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || code.some((d) => !d)}
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
