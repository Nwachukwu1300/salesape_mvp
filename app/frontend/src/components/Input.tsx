import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const inputId =
      props.id ||
      props.name ||
      `input-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-label={
            label ??
            (props["aria-label"] ? String(props["aria-label"]) : undefined)
          }
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all ${
            error ? "border-red-500 focus:ring-red-500" : "focus:ring-pink-500"
          } ${className}`}
          style={
            {
              "--tw-ring-color": error ? "#ef4444" : "#f724de",
            } as React.CSSProperties
          }
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
