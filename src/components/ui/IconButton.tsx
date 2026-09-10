import React from "react";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ariaLabel: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function IconButton({
  children,
  ariaLabel,
  variant = "ghost",
  size = "md",
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shrink-0";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
    secondary: "bg-surface-subtle text-foreground hover:bg-surface-muted",
    outline: "border border-border text-foreground hover:bg-surface-subtle",
    ghost: "text-foreground hover:bg-surface-subtle",
  };

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12.5 h-12.5 text-base", // 50px x 50px
  };

  return (
    <button
      aria-label={ariaLabel}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
