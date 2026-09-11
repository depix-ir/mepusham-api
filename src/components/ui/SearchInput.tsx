import React from "react";
import { SearchIcon } from "@/components/icons";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  brandMark?: React.ReactNode;
}

export function SearchInput({
  brandMark,
  placeholder = "جستجوی محصول در نام برند",
  className = "",
  ...props
}: SearchInputProps) {
  return (
    <div className="relative flex items-center w-full h-[50px] bg-surface-subtle rounded-full px-4 border border-transparent focus-within:border-primary focus-within:bg-background transition-all">
      {brandMark && (
        <div className="shrink-0 md:hidden flex items-center pl-2 border-l border-border/60 text-xs font-bold text-primary select-none">
          {brandMark}
        </div>
      )}
      <input
        type="search"
        placeholder={placeholder}
        className={`w-full bg-transparent pr-3 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ${className}`.trim()}
        {...props}
      />
      <div className="shrink-0 text-muted-foreground pr-1 pointer-events-none">
        <SearchIcon size={20} />
      </div>
    </div>
  );
}
