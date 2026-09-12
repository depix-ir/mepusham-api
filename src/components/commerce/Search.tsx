"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon, ChevronRightIcon } from "@/components/icons";
import { useSearchSuggestions } from "@/lib/search/useSearchSuggestions";
import { SearchSuggestionsPanel } from "./SearchSuggestionsPanel";

export interface SearchProps {
  placeholder?: string;
  brandMark?: React.ReactNode;
  className?: string;
  onSearch?: (query: string) => void;
}

export function Search({
  placeholder = "جستجوی محصول در نام برند",
  brandMark,
  className = "",
  onSearch,
}: SearchProps) {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const handleExecuteSearch = useCallback(
    (selectedText: string) => {
      const trimmed = selectedText.trim();
      if (!trimmed) return;

      if (onSearch) {
        onSearch(trimmed);
      } else {
        router.push(`/products?q=${encodeURIComponent(trimmed)}`);
      }
    },
    [router, onSearch]
  );

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    isOpen,
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
  } = useSearchSuggestions({
    onSelect: handleExecuteSearch,
  });

  // Handle click outside to close desktop suggestion panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        closeSuggestions();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [closeSuggestions]);

  // Focus mobile input when mobile active search mode is opened
  useEffect(() => {
    if (isMobileActive) {
      // Small timeout to allow overlay animation/mount
      const focusTimer = setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(focusTimer);
    }
  }, [isMobileActive]);

  const handleInputFocus = () => {
    openSuggestions();
  };

  const handleMobileInputClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      openMobileSearch();
    }
  };

  return (
    <div
      ref={searchContainerRef}
      className={`relative w-full ${className}`.trim()}
    >
      {/* =========================================================================
          DESKTOP & DEFAULT HEADER SEARCH INPUT
         ========================================================================= */}
      <div className="relative flex items-center w-full h-[50px] bg-surface-subtle rounded-full px-4 border border-transparent focus-within:border-primary focus-within:bg-background transition-all">
        {brandMark && (
          <div className="shrink-0 md:hidden flex items-center pl-2 border-l border-border/60 text-xs font-bold text-primary select-none">
            {brandMark}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onClick={handleMobileInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-autocomplete="list"
          className="w-full bg-transparent pr-3 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {query ? (
          <button
            type="button"
            onClick={clearQuery}
            aria-label="پاک کردن متن جستجو"
            className="shrink-0 p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <XIcon size={18} />
          </button>
        ) : (
          <div className="shrink-0 text-muted-foreground pr-1 pointer-events-none">
            <SearchIcon size={20} />
          </div>
        )}
      </div>

      {/* =========================================================================
          DESKTOP SUGGESTION DROPDOWN PANEL
         ========================================================================= */}
      {isOpen && !isMobileActive && (
        <div className="hidden md:block absolute top-full right-0 left-0 mt-2 z-50">
          <SearchSuggestionsPanel
            suggestions={suggestions}
            query={query}
            isLoading={isLoading}
            selectedIndex={selectedIndex}
            onSelectSuggestion={selectSuggestion}
            onHoverIndex={setSelectedIndex}
          />
        </div>
      )}

      {/* =========================================================================
          MOBILE ACTIVE SEARCH OVERLAY (Dedicated Mobile Search State)
         ========================================================================= */}
      {isMobileActive && (
        <div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col p-3 gap-3 animate-in fade-in duration-150">
          {/* Top Navigation Row: Back Button + Full Search Input */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeMobileSearch}
              aria-label="بازگشت"
              className="p-2 -mr-1 text-foreground hover:text-primary transition-colors cursor-pointer rounded-full active:bg-surface-subtle"
            >
              <ChevronRightIcon size={24} />
            </button>

            <div className="relative flex-1 flex items-center h-12 bg-surface-subtle rounded-full px-4 border border-primary bg-background">
              <input
                ref={mobileInputRef}
                type="text"
                inputMode="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-transparent pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />

              {query ? (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="پاک کردن"
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XIcon size={18} />
                </button>
              ) : (
                <SearchIcon size={18} className="text-muted-foreground shrink-0" />
              )}
            </div>
          </div>

          {/* Mobile Suggestions Area */}
          <div className="flex-1 overflow-y-auto pt-1">
            <SearchSuggestionsPanel
              suggestions={suggestions}
              query={query}
              isLoading={isLoading}
              selectedIndex={selectedIndex}
              onSelectSuggestion={selectSuggestion}
              onHoverIndex={setSelectedIndex}
            />
          </div>
        </div>
      )}
    </div>
  );
}
