import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getSearchSuggestions, SearchSuggestion } from "./suggestionService";

export interface UseSearchSuggestionsOptions {
  initialQuery?: string;
  debounceMs?: number;
  limit?: number;
  onSelect?: (suggestionText: string) => void;
}

export function useSearchSuggestions({
  initialQuery = "",
  debounceMs = 250,
  limit = 4,
  onSelect,
}: UseSearchSuggestionsOptions = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileActive, setIsMobileActive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setIsLoading(true);
  }, []);

  // Synchronize debouncedQuery with query using debounceMs
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsLoading(false);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  // Compute suggestions derived from debouncedQuery
  const suggestions: SearchSuggestion[] = useMemo(() => {
    return getSearchSuggestions(debouncedQuery, undefined, { limit });
  }, [debouncedQuery, limit]);

  const selectSuggestion = useCallback(
    (text: string) => {
      setQuery(text);
      setDebouncedQuery(text);
      setIsLoading(false);
      setIsOpen(false);
      setIsMobileActive(false);
      if (onSelect) {
        onSelect(text);
      }
    },
    [onSelect]
  );

  const clearQuery = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setQuery("");
    setDebouncedQuery("");
    setIsLoading(false);
    setSelectedIndex(-1);
  }, []);

  const openSuggestions = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSuggestions = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  const openMobileSearch = useCallback(() => {
    setIsMobileActive(true);
    setIsOpen(true);
  }, []);

  const closeMobileSearch = useCallback(() => {
    setIsMobileActive(false);
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        setIsOpen(true);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (suggestions.length === 0) return;
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (suggestions.length === 0) return;
        setSelectedIndex((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex].text);
        } else if (query.trim()) {
          selectSuggestion(query.trim());
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeSuggestions();
        closeMobileSearch();
        (e.target as HTMLInputElement)?.blur();
      }
    },
    [isOpen, suggestions, selectedIndex, query, selectSuggestion, closeSuggestions, closeMobileSearch]
  );

  return {
    query,
    setQuery: updateQuery,
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    isMobileActive,
    openMobileSearch,
    closeMobileSearch,
    selectedIndex,
    setSelectedIndex,
    selectSuggestion,
    clearQuery,
    openSuggestions,
    closeSuggestions,
    handleKeyDown,
  };
}
