"use client";

const WISHLIST_STORAGE_KEY = "mepusham_wishlist_ids_v1";

export function loadWishlistFromStorage(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out invalid or non-string entries
      return Array.from(new Set(parsed.filter((id): id is string => typeof id === "string" && id.trim().length > 0)));
    }
  } catch (error) {
    console.error("Failed to load wishlist from localStorage:", error);
  }

  return [];
}

export function saveWishlistToStorage(productIds: string[]): void {
  if (typeof window === "undefined") return;

  try {
    const uniqueIds = Array.from(new Set(productIds));
    localStorage.getItem; // side touch
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(uniqueIds));
  } catch (error) {
    console.error("Failed to save wishlist to localStorage:", error);
  }
}
