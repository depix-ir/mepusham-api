"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Product,
  ProductVariant,
  ProductOption,
  ProductCategory,
  ProductBrand,
  ProductSpecification,
  ProductStatus,
} from "@/types/product";
import { products as initialProducts } from "@/data/products";
import { categories as initialCategories, brands as initialBrands } from "@/data/common";

const STORAGE_KEY_PRODUCTS = "admin_store_products_v1";
const STORAGE_KEY_CATEGORIES = "admin_store_categories_v1";
const STORAGE_KEY_BRANDS = "admin_store_brands_v1";

interface ProductContextType {
  products: Product[];
  categories: ProductCategory[];
  brands: ProductBrand[];
  isLoaded: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updatedData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteBulkProducts: (ids: string[]) => void;
  addCategory: (category: ProductCategory) => ProductCategory;
  addBrand: (brand: ProductBrand) => ProductBrand;
  addVariant: (productId: string, variant: ProductVariant) => void;
  updateVariant: (
    productId: string,
    variantId: string,
    updatedData: Partial<ProductVariant>
  ) => void;
  addOptionValue: (
    productId: string,
    optionId: string,
    value: { id: string; label: string; value: string }
  ) => void;
  deleteVariant: (productId: string, variantId: string) => void;
  bulkUpdateVariants: (
    productId: string,
    variantIds: string[],
    updatedData: Partial<ProductVariant>
  ) => void;
  bulkDeleteVariants: (productId: string, variantIds: string[]) => void;
  bulkUpdateStatus: (productIds: string[], status: ProductStatus) => void;
  bulkUpdateStock: (productIds: string[], stock: number) => void;
  resetToDefaults: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [brands, setBrands] = useState<ProductBrand[]>(initialBrands);
  const [isLoaded, setIsLoaded] = useState(false);

  // Safely load from localStorage after hydration
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      const storedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      const storedBrands = localStorage.getItem(STORAGE_KEY_BRANDS);

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
      if (storedBrands) {
        setBrands(JSON.parse(storedBrands));
      }
    } catch (e) {
      console.error("Failed to load products state from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever state changes after initial load
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to localStorage:", e);
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to save categories to localStorage:", e);
    }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(brands));
    } catch (e) {
      console.error("Failed to save brands to localStorage:", e);
    }
  }, [brands, isLoaded]);

  // Actions
  const addProduct = useCallback((newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, updatedData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = {
          ...p,
          ...updatedData,
          updatedAt: new Date().toISOString(),
        };
        // Re-calculate totals if inventory or pricing updated
        if (updated.variants && updated.variants.length > 0) {
          const totalStock = updated.variants.reduce(
            (sum, v) => sum + (v.inventory?.stock || 0),
            0
          );
          updated.inventory = {
            ...updated.inventory,
            totalStock,
            hasAvailableVariants: totalStock > 0,
          };
        }
        return updated;
      })
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const deleteBulkProducts = useCallback((ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
  }, []);

  const addCategory = useCallback((category: ProductCategory) => {
    setCategories((prev) => {
      if (
        prev.some(
          (c) =>
            c.id === category.id ||
            c.name.trim().toLowerCase() === category.name.trim().toLowerCase()
        )
      ) {
        return prev;
      }
      return [...prev, category];
    });
    return category;
  }, []);

  const addBrand = useCallback((brand: ProductBrand) => {
    setBrands((prev) => {
      if (prev.some((b) => b.id === brand.id)) return prev;
      return [...prev, brand];
    });
    return brand;
  }, []);

  const addVariant = useCallback((productId: string, newVariant: ProductVariant) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedVariants = [...(p.variants || []), newVariant];
        const totalStock = updatedVariants.reduce(
          (sum, v) => sum + (v.inventory?.stock || 0),
          0
        );
        return {
          ...p,
          variants: updatedVariants,
          inventory: {
            ...p.inventory,
            totalStock,
            hasAvailableVariants: totalStock > 0,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const addOptionValue = useCallback(
    (
      productId: string,
      optionId: string,
      newValue: { id: string; label: string; value: string }
    ) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const updatedOptions = p.options.map((opt) => {
            if (opt.id !== optionId) return opt;
            // check if value exists
            if (opt.values.some((v) => v.id === newValue.id || v.label === newValue.label)) {
              return opt;
            }
            return {
              ...opt,
              values: [
                ...opt.values,
                {
                  ...newValue,
                  sortOrder: opt.values.length + 1,
                },
              ],
            };
          });
          return {
            ...p,
            options: updatedOptions,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const updateVariant = useCallback(
    (productId: string, variantId: string, updatedData: Partial<ProductVariant>) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const updatedVariants = p.variants.map((v) =>
            v.id === variantId ? { ...v, ...updatedData } : v
          );
          const totalStock = updatedVariants.reduce(
            (sum, v) => sum + (v.inventory?.stock || 0),
            0
          );
          return {
            ...p,
            variants: updatedVariants,
            inventory: {
              ...p.inventory,
              totalStock,
              hasAvailableVariants: totalStock > 0,
            },
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const deleteVariant = useCallback((productId: string, variantId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedVariants = p.variants.filter((v) => v.id !== variantId);
        const totalStock = updatedVariants.reduce(
          (sum, v) => sum + (v.inventory?.stock || 0),
          0
        );
        return {
          ...p,
          variants: updatedVariants,
          inventory: {
            ...p.inventory,
            totalStock,
            hasAvailableVariants: totalStock > 0,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const bulkUpdateVariants = useCallback(
    (productId: string, variantIds: string[], updatedData: Partial<ProductVariant>) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const updatedVariants = p.variants.map((v) =>
            variantIds.includes(v.id) ? { ...v, ...updatedData } : v
          );
          const totalStock = updatedVariants.reduce(
            (sum, v) => sum + (v.inventory?.stock || 0),
            0
          );
          return {
            ...p,
            variants: updatedVariants,
            inventory: {
              ...p.inventory,
              totalStock,
              hasAvailableVariants: totalStock > 0,
            },
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const bulkDeleteVariants = useCallback((productId: string, variantIds: string[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedVariants = p.variants.filter((v) => !variantIds.includes(v.id));
        const totalStock = updatedVariants.reduce(
          (sum, v) => sum + (v.inventory?.stock || 0),
          0
        );
        return {
          ...p,
          variants: updatedVariants,
          inventory: {
            ...p.inventory,
            totalStock,
            hasAvailableVariants: totalStock > 0,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const bulkUpdateStatus = useCallback((productIds: string[], status: ProductStatus) => {
    setProducts((prev) =>
      prev.map((p) =>
        productIds.includes(p.id)
          ? { ...p, status, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const bulkUpdateStock = useCallback((productIds: string[], stock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (!productIds.includes(p.id)) return p;
        const updatedVariants = p.variants.map((v) => ({
          ...v,
          inventory: { ...v.inventory, stock },
        }));
        const totalStock =
          updatedVariants.length > 0
            ? updatedVariants.reduce((sum, v) => sum + v.inventory.stock, 0)
            : stock;
        return {
          ...p,
          inventory: {
            ...p.inventory,
            totalStock,
            hasAvailableVariants: totalStock > 0,
          },
          variants: updatedVariants,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const resetToDefaults = useCallback(() => {
    setProducts(initialProducts);
    setCategories(initialCategories);
    setBrands(initialBrands);
    try {
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      localStorage.removeItem(STORAGE_KEY_BRANDS);
    } catch (e) {
      console.error("Failed to reset localStorage:", e);
    }
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        brands,
        isLoaded,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteBulkProducts,
        addCategory,
        addBrand,
        addVariant,
        addOptionValue,
        updateVariant,
        deleteVariant,
        bulkUpdateVariants,
        bulkDeleteVariants,
        bulkUpdateStatus,
        bulkUpdateStock,
        resetToDefaults,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
