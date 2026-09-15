import React from "react";
import { SearchSuggestion } from "@/lib/search/suggestionService";
import { SearchSuggestionItem } from "./SearchSuggestionItem";

export interface SearchSuggestionsPanelProps {
  id?: string;
  suggestions: SearchSuggestion[];
  query: string;
  isLoading?: boolean;
  selectedIndex: number;
  onSelectSuggestion: (text: string) => void;
  onHoverIndex?: (index: number) => void;
}

export function SearchSuggestionsPanel({
  id = "search-suggestions-dropdown",
  suggestions,
  query,
  isLoading = false,
  selectedIndex,
  onSelectSuggestion,
  onHoverIndex,
}: SearchSuggestionsPanelProps) {
  const isQueryEmpty = !query.trim();

  return (
    <div
      id={id}
      role="listbox"
      aria-label="پیشنهادهای جستجو"
      className="w-full bg-background border border-border-product rounded-2xl shadow-lg p-2 flex flex-col gap-1 transition-all duration-150 ease-out animate-in fade-in slide-in-from-top-1"
    >
      {/* Header Label */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground border-b border-border/40 mb-1">
        <span>{isQueryEmpty ? "پیشنهادهای محبوب" : "پیشنهادهای جستجو"}</span>
        {isLoading && (
          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
        )}
      </div>

      {/* Suggestion List */}
      {suggestions.length > 0 ? (
        <div className="flex flex-col gap-0.5">
          {suggestions.map((item, index) => (
            <SearchSuggestionItem
              key={item.id}
              id={`${id}-item-${item.id}`}
              suggestion={item}
              isSelected={selectedIndex === index}
              onSelect={onSelectSuggestion}
              onMouseEnter={() => onHoverIndex && onHoverIndex(index)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="px-4 py-6 text-center text-xs md:text-sm text-muted-foreground flex flex-col items-center justify-center gap-1">
          <p>
            پیشنهادی برای <span className="font-bold text-foreground">«{query.trim()}»</span> پیدا نشد
          </p>
          <span className="text-[11px] text-muted">
            لطفاً عبارت دیگری را امتحان کنید
          </span>
        </div>
      )}
    </div>
  );
}
