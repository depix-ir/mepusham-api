"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { loadWishlistFromStorage, saveWishlistToStorage } from "./wishlist.persistence";

export interface WishlistContextType {
  likedProductIds: string[];
  isLiked: (productId: string) => boolean;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  count: number;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage post-hydration
  useEffect(() => {
    const loadedIds = loadWishlistFromStorage();
    if (loadedIds && loadedIds.length > 0) {
      setLikedProductIds(loadedIds);
    }
    setIsHydrated(true);
  }, []);

  // Save to storage on state change after initial hydration
  useEffect(() => {
    if (!isHydrated) return;
    saveWishlistToStorage(likedProductIds);
  }, [likedProductIds, isHydrated]);

  const isLiked = useCallback(
    (productId: string) => {
      if (!productId) return false;
      return likedProductIds.includes(productId);
    },
    [likedProductIds]
  );

  const add = useCallback((productId: string) => {
    if (!productId) return;
    setLikedProductIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  }, []);

  const remove = useCallback((productId: string) => {
    if (!productId) return;
    setLikedProductIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const toggle = useCallback((productId: string) => {
    if (!productId) return;
    setLikedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const clear = useCallback(() => {
    setLikedProductIds([]);
  }, []);

  const count = useMemo(() => likedProductIds.length, [likedProductIds]);

  const value = useMemo(
    () => ({
      likedProductIds,
      isLiked,
      add,
      remove,
      toggle,
      count,
      clear,
    }),
    [likedProductIds, isLiked, add, remove, toggle, count, clear]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
