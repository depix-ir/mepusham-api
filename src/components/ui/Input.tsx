import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  rightIcon,
  leftIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-foreground select-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            {rightIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full h-11 bg-surface-subtle border border-transparent rounded-md px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors ${
            rightIcon ? "pr-10" : ""
          } ${leftIcon ? "pl-10" : ""} ${
            error ? "border-error focus:border-error" : ""
          } ${className}`.trim()}
          {...props}
        />
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            {leftIcon}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
