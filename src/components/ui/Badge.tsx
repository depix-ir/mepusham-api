import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: BadgeProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold leading-none rounded-full shrink-0 select-none";

  const variants = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-surface-subtle text-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    error: "bg-error text-error-foreground",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-1 text-xs",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim()}>
      {children}
    </span>
  );
}
