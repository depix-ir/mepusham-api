import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
    secondary: "bg-surface-subtle text-foreground hover:bg-surface-muted",
    outline: "border border-border text-foreground hover:bg-surface-subtle",
    ghost: "text-foreground hover:bg-surface-subtle",
    danger: "bg-error text-error-foreground hover:opacity-90",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs rounded-md",
    md: "h-11 px-4 text-sm rounded-md",
    lg: "h-12 px-6 text-base rounded-md",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
