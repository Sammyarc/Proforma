import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const visibleLabel = label ?? props.placeholder;
    const inputId = id ?? generatedId;

    return (
      <div className="w-full">
        {visibleLabel && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-body-sm font-medium text-neutral-700 font-satoshi"
          >
            {visibleLabel}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`
              w-full rounded-input border bg-white px-3 py-2
              text-body font-satoshi text-neutral-800
              placeholder:text-neutral-400
              transition-colors duration-150
              hover:border-neutral-300
              focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:border-accent-500
              disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
              ${icon ? "pl-10" : ""}
              ${error ? "border-status-error focus:ring-status-error" : "border-neutral-200"}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-caption text-status-error font-satoshi"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
