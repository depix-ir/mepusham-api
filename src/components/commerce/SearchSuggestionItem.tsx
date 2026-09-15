import React from "react";
import { SearchIcon } from "@/components/icons";
import { SearchSuggestion } from "@/lib/search/suggestionService";

export interface SearchSuggestionItemProps {
  id?: string;
  suggestion: SearchSuggestion;
  isSelected?: boolean;
  onSelect: (text: string) => void;
  onMouseEnter?: () => void;
}

export function SearchSuggestionItem({
  id,
  suggestion,
  isSelected = false,
  onSelect,
  onMouseEnter,
}: SearchSuggestionItemProps) {
  return (
    <button
      id={id || `suggestion-item-${suggestion.id}`}
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(suggestion.text)}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center justify-between px-4 py-3 min-h-[48px] text-right text-xs md:text-sm transition-colors rounded-lg cursor-pointer ${
        isSelected
          ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
          : "text-foreground hover:bg-surface-subtle"
      }`}
    >
      <div className="flex items-center gap-3 truncate">
        <SearchIcon
          size={18}
          className={`shrink-0 ${
            isSelected ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <span className="truncate">{suggestion.text}</span>
      </div>

      {suggestion.type === "category" && (
        <span className="shrink-0 text-[10px] md:text-xs text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full font-medium">
          دسته‌بندی
        </span>
      )}
      {suggestion.type === "brand" && (
        <span className="shrink-0 text-[10px] md:text-xs text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded-full font-medium">
          برند
        </span>
      )}
    </button>
  );
}
