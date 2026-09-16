"use client";

import React, { useState, useRef, useEffect } from "react";
import { SortIcon, ChevronDownIcon, CheckIcon } from "@/components/icons";

export interface SortOption {
  id: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  showIcon?: boolean;
}

export function SortDropdown({
  options,
  value,
  onChange,
  className = "",
  buttonClassName = "",
  showIcon = true,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value) || options[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle option select
  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-right ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-11 px-3 bg-surface-subtle hover:bg-surface-muted border border-border-product rounded-xl flex items-center justify-between gap-2 text-xs font-medium text-foreground transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98] ${
          isOpen ? "border-primary ring-2 ring-primary/10" : ""
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {showIcon && <SortIcon size={16} className="text-primary shrink-0" />}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <ChevronDownIcon
          size={14}
          className={`text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1.5 min-w-[160px] bg-background border border-border-product rounded-xl shadow-lg py-1.5 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.id)}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-right transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:bg-surface-subtle"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <CheckIcon size={14} className="text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
