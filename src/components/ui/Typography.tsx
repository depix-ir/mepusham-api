import React from "react";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?:
    | "display"
    | "h1"
    | "h2"
    | "h3"
    | "body"
    | "body-sm"
    | "caption"
    | "label";
  as?: React.ElementType;
  weight?: "light" | "regular" | "medium" | "bold" | "black";
  className?: string;
  children: React.ReactNode;
}

export function Typography({
  variant = "body",
  as,
  weight,
  className = "",
  children,
  ...props
}: TypographyProps) {
  const Tag = as || getDefaultElement(variant);

  const variants = {
    display: "text-2xl md:text-4xl leading-tight",
    h1: "text-xl md:text-3xl leading-snug",
    h2: "text-lg md:text-2xl leading-snug",
    h3: "text-base md:text-xl leading-normal",
    body: "text-sm md:text-base leading-relaxed",
    "body-sm": "text-xs md:text-sm leading-relaxed",
    caption: "text-[10px] md:text-xs leading-normal",
    label: "text-xs md:text-sm leading-none",
  };

  const weights = {
    light: "font-light",
    regular: "font-normal",
    medium: "font-medium",
    bold: "font-bold",
    black: "font-black",
  };

  const weightClass = weight ? weights[weight] : "";

  return React.createElement(
    Tag,
    {
      className: `${variants[variant]} ${weightClass} ${className}`.trim(),
      ...props,
    },
    children
  );
}

function getDefaultElement(variant: string): keyof React.JSX.IntrinsicElements {
  switch (variant) {
    case "display":
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "caption":
      return "span";
    case "label":
      return "label";
    default:
      return "p";
  }
}
