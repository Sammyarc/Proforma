import { Check, X } from "lucide-react";

interface CriteriaItem {
  label: string;
  met: boolean;
}

function PasswordCriteria({ password }: { password: string }) {
  const criteria: CriteriaItem[] = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-1 mt-3">
      {criteria.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 text-body-sm font-satoshi"
        >
          {item.met ? (
            <Check className="h-3.5 w-3.5 text-status-success" />
          ) : (
            <X className="h-3.5 w-3.5 text-neutral-400" />
          )}
          <span
            className={item.met ? "text-status-success" : "text-neutral-400"}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

interface PassStrengthMeterProps {
  password: string;
}

export default function PassStrengthMeter({
  password,
}: PassStrengthMeterProps) {
  const getStrength = (pass: string): number => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z\d]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const colorMap: Record<number, string> = {
    0: "bg-status-error",
    1: "bg-red-400",
    2: "bg-status-warning",
    3: "bg-yellow-400",
    4: "bg-status-success",
  };

  const textMap: Record<number, string> = {
    0: "Very Weak",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-caption text-neutral-400 font-satoshi">
          Password strength
        </span>
        <span className="text-caption text-neutral-400 font-satoshi">
          {textMap[strength]}
        </span>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-1 w-1/4 rounded-full transition-colors duration-300 ${
              index < strength ? colorMap[strength] : "bg-neutral-200"
            }`}
          />
        ))}
      </div>

      <PasswordCriteria password={password} />
    </div>
  );
}
