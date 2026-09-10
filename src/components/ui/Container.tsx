import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  clean?: boolean;
}

export function Container({
  children,
  className = "",
  clean = false,
  ...props
}: ContainerProps) {
  const basePadding = clean ? "" : "px-4 md:px-14 lg:px-24";

  return (
    <div
      className={`w-full max-w-[1440px] mx-auto ${basePadding} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
