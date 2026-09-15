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
  retryInitial: () => Promise<void>;
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

  // Safeguard refs against race conditions & duplicate fetches
  const requestedPagesRef = useRef<Set<number>>(new Set());
  const isFetchingRef = useRef<boolean>(false);

  // Create a stable query key from the filter object
  const queryKey = useMemo(() => {
    return JSON.stringify({
      category: filters.category || null,
      brands: filters.brands ? [...filters.brands].sort() : [],
      minPrice: filters.minPrice || null,
      maxPrice: filters.maxPrice || null,
      inStock: !!filters.inStock,
      hasDiscount: !!filters.hasDiscount,
      q: filters.q?.trim() || null,
      sort: filters.sort || "newest",
    });
  }, [
    filters.category,
    filters.brands,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.hasDiscount,
    filters.q,
    filters.sort,
  ]);

  const activeQueryKeyRef = useRef<string>(queryKey);

  // Fetch page 1 when queryKey changes
  const fetchInitialPage = useCallback(
    async (key: string) => {
      isFetchingRef.current = true;
      setStatus("initial_loading");
      setError(null);
      requestedPagesRef.current.clear();
      requestedPagesRef.current.add(1);

      try {
        const response: PaginatedProductsResponse = await getPaginatedProducts(filters, 1, PRODUCT_PAGE_SIZE);

        // Check if query key changed while fetching
        if (activeQueryKeyRef.current !== key) return;

        setProducts(response.items);
        setTotal(response.total);
        setCurrentPage(1);
        setHasNextPage(response.hasNextPage);

        if (response.total === 0) {
          setStatus("empty");
        } else {
          setStatus("ready");
        }
      } catch (err) {
        if (activeQueryKeyRef.current !== key) return;
        setError(err instanceof Error ? err.message : "خطایی در دریافت اطلاعات رخ داد.");
        setStatus("initial_error");
      } finally {
        if (activeQueryKeyRef.current === key) {
          isFetchingRef.current = false;
        }
      }
    },
    [filters, queryKey]
  );

  // Trigger initial fetch or reset on queryKey change
  useEffect(() => {
    activeQueryKeyRef.current = queryKey;
    fetchInitialPage(queryKey);
  }, [queryKey, fetchInitialPage]);

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
    isFetchingRef.current = true;
    requestedPagesRef.current.add(nextPage);
    setStatus("loading_more");
    setError(null);

    try {
      const response: PaginatedProductsResponse = await getPaginatedProducts(
        filters,
        nextPage,
        PRODUCT_PAGE_SIZE
      );

      // Verify queryKey hasn't changed during async request
      if (activeQueryKeyRef.current !== currentKey) return;

      setProducts((prev) => {
        // Prevent duplicate products if response contains already existing IDs
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
      // Allow re-requesting failed page
      requestedPagesRef.current.delete(nextPage);
      setError(err instanceof Error ? err.message : "بارگذاری محصولات بیشتر با مشکل مواجه شد.");
      setStatus("load_more_error");
    } finally {
      if (activeQueryKeyRef.current === currentKey) {
        isFetchingRef.current = false;
      }
    }
  }, [currentPage, filters, hasNextPage, status]);

  const retryNextPage = useCallback(async () => {
    if (status === "load_more_error") {
      setStatus("ready");
      await fetchNextPage();
    }
  }, [fetchNextPage, status]);

  const retryInitial = useCallback(async () => {
    await fetchInitialPage(activeQueryKeyRef.current);
  }, [fetchInitialPage]);

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
