"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Product, ProductQueryFilter, PaginatedProductsResponse } from "@/types/product";
import { getPaginatedProducts, PRODUCT_PAGE_SIZE } from "@/lib/product/service";

export type PaginationStatus =
  | "initial_loading"
  | "ready"
  | "loading_more"
  | "initial_error"
  | "load_more_error"
  | "empty";

export interface UsePaginatedProductsResult {
  products: Product[];
  status: PaginationStatus;
  hasNextPage: boolean;
  total: number;
  currentPage: number;
  isFetchingNextPage: boolean;
  error: string | null;
  fetchNextPage: () => Promise<void>;
  retryNextPage: () => Promise<void>;
  retryInitial: () => void;
  pageSize: number;
}

export function usePaginatedProducts(
  filters: ProductQueryFilter
): UsePaginatedProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<PaginationStatus>("initial_loading");
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState<number>(0);

  // Keep latest filters in ref for async callbacks
  const filtersRef = useRef<ProductQueryFilter>(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Safeguard refs against race conditions & duplicate fetches
  const requestedPagesRef = useRef<Set<number>>(new Set());
  const isFetchingRef = useRef<boolean>(false);

  // Brands joined as a stable string for serialization
  const brandKey = filters.brands && filters.brands.length > 0 ? [...filters.brands].sort().join(",") : "";

  // Create a deterministic serialized query key from filter values
  const serializedQueryKey = useMemo(() => {
    return JSON.stringify({
      category: filters.category || null,
      brands: brandKey,
      minPrice: filters.minPrice ? Number(filters.minPrice) : null,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : null,
      inStock: !!filters.inStock,
      hasDiscount: !!filters.hasDiscount,
      q: filters.q?.trim() || null,
      sort: filters.sort || "newest",
    });
  }, [
    filters.category,
    brandKey,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.hasDiscount,
    filters.q,
    filters.sort,
  ]);

  const activeQueryKeyRef = useRef<string>(serializedQueryKey);

  // Handle initial page fetch whenever query key or retry counter changes
  useEffect(() => {
    activeQueryKeyRef.current = serializedQueryKey;
    const currentKey = serializedQueryKey;
    const currentFilters = filtersRef.current;
    let isCancelled = false;

    async function loadInitial() {
      isFetchingRef.current = true;
      setStatus("initial_loading");
      setError(null);
      requestedPagesRef.current.clear();
      requestedPagesRef.current.add(1);

      try {
        const response: PaginatedProductsResponse = await getPaginatedProducts(
          currentFilters,
          1,
          PRODUCT_PAGE_SIZE
        );

        if (isCancelled || activeQueryKeyRef.current !== currentKey) return;

        setProducts(response.items);
        setTotal(response.total);
        setCurrentPage(1);
        setHasNextPage(response.hasNextPage);
        setStatus(response.total === 0 ? "empty" : "ready");
      } catch (err) {
        if (isCancelled || activeQueryKeyRef.current !== currentKey) return;
        setError(err instanceof Error ? err.message : "خطایی در دریافت اطلاعات رخ داد.");
        setStatus("initial_error");
      } finally {
        if (!isCancelled && activeQueryKeyRef.current === currentKey) {
          isFetchingRef.current = false;
        }
      }
    }

    loadInitial();

    return () => {
      isCancelled = true;
    };
  }, [serializedQueryKey, retryCounter]);

  // Fetch Next Page
  const fetchNextPage = useCallback(async () => {
    if (
      isFetchingRef.current ||
      !hasNextPage ||
      status === "initial_loading" ||
      status === "loading_more"
    ) {
      return;
    }

    const nextPage = currentPage + 1;

    // Deduplication check
    if (requestedPagesRef.current.has(nextPage)) {
      return;
    }

    const currentKey = activeQueryKeyRef.current;
    const currentFilters = filtersRef.current;

    isFetchingRef.current = true;
    requestedPagesRef.current.add(nextPage);
    setStatus("loading_more");
    setError(null);

    try {
      const response: PaginatedProductsResponse = await getPaginatedProducts(
        currentFilters,
        nextPage,
        PRODUCT_PAGE_SIZE
      );

      if (activeQueryKeyRef.current !== currentKey) return;

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newUniqueItems = response.items.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newUniqueItems];
      });

      setCurrentPage(nextPage);
      setHasNextPage(response.hasNextPage);
      setTotal(response.total);
      setStatus("ready");
    } catch (err) {
      if (activeQueryKeyRef.current !== currentKey) return;
      requestedPagesRef.current.delete(nextPage);
      setError(err instanceof Error ? err.message : "بارگذاری محصولات بیشتر با مشکل مواجه شد.");
      setStatus("load_more_error");
    } finally {
      if (activeQueryKeyRef.current === currentKey) {
        isFetchingRef.current = false;
      }
    }
  }, [currentPage, hasNextPage, status]);

  const retryNextPage = useCallback(async () => {
    if (status === "load_more_error") {
      setStatus("ready");
      await fetchNextPage();
    }
  }, [fetchNextPage, status]);

  const retryInitial = useCallback(() => {
    setRetryCounter((prev) => prev + 1);
  }, []);

  return {
    products,
    status,
    hasNextPage,
    total,
    currentPage,
    isFetchingNextPage: status === "loading_more",
    error,
    fetchNextPage,
    retryNextPage,
    retryInitial,
    pageSize: PRODUCT_PAGE_SIZE,
  };
}
