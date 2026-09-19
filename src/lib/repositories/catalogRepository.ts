import { Product, ProductCategory, ProductBrand } from "@/types/product";
import { products as initialProducts } from "@/data/products";
import { categories as initialCategories, brands as initialBrands } from "@/data/common";

export const STORAGE_KEY_PRODUCTS = "admin_store_products_v1";
export const STORAGE_KEY_CATEGORIES = "admin_store_categories_v1";
export const STORAGE_KEY_BRANDS = "admin_store_brands_v1";

export type CatalogListener = () => void;

export interface ICatalogRepository {
  getProducts(options?: { isHydrated?: boolean }): Product[];
  getProductById(id: string, options?: { isHydrated?: boolean }): Product | null;
  getProductBySlug(slug: string, options?: { isHydrated?: boolean }): Product | null;
  saveProducts(products: Product[]): void;
  getCategories(options?: { isHydrated?: boolean }): ProductCategory[];
  saveCategories(categories: ProductCategory[]): void;
  getBrands(options?: { isHydrated?: boolean }): ProductBrand[];
  saveBrands(brands: ProductBrand[]): void;
  subscribe(listener: CatalogListener): () => void;
  resetToDefaults(): void;
}

class MockCatalogRepository implements ICatalogRepository {
  private memoryProducts: Product[] | null = null;
  private memoryCategories: ProductCategory[] | null = null;
  private memoryBrands: ProductBrand[] | null = null;
  private listeners: Set<CatalogListener> = new Set();

  subscribe(listener: CatalogListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("CatalogListener error:", err);
      }
    });
  }

  getProducts(options?: { isHydrated?: boolean }): Product[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) {
      return this.memoryProducts ?? initialProducts;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryProducts = parsed;
        return parsed;
      }
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(initialProducts));
      this.memoryProducts = initialProducts;
      return initialProducts;
    } catch (e) {
      console.error("MockCatalogRepository: Failed to get products:", e);
      return this.memoryProducts ?? initialProducts;
    }
  }

  getProductById(id: string, options?: { isHydrated?: boolean }): Product | null {
    const products = this.getProducts(options);
    return products.find((p) => p.id === id) || null;
  }

  getProductBySlug(slug: string, options?: { isHydrated?: boolean }): Product | null {
    const products = this.getProducts(options);
    return products.find((p) => p.slug === slug) || null;
  }

  saveProducts(products: Product[]): void {
    this.memoryProducts = products;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      } catch (e) {
        console.error("MockCatalogRepository: Failed to save products:", e);
      }
    }
    this.notifyListeners();
  }

  getCategories(options?: { isHydrated?: boolean }): ProductCategory[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) {
      return this.memoryCategories ?? initialCategories;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryCategories = parsed;
        return parsed;
      }
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(initialCategories));
      this.memoryCategories = initialCategories;
      return initialCategories;
    } catch (e) {
      console.error("MockCatalogRepository: Failed to get categories:", e);
      return this.memoryCategories ?? initialCategories;
    }
  }

  saveCategories(categories: ProductCategory[]): void {
    this.memoryCategories = categories;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
      } catch (e) {
        console.error("MockCatalogRepository: Failed to save categories:", e);
      }
    }
    this.notifyListeners();
  }

  getBrands(options?: { isHydrated?: boolean }): ProductBrand[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) {
      return this.memoryBrands ?? initialBrands;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BRANDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryBrands = parsed;
        return parsed;
      }
      localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(initialBrands));
      this.memoryBrands = initialBrands;
      return initialBrands;
    } catch (e) {
      console.error("MockCatalogRepository: Failed to get brands:", e);
      return this.memoryBrands ?? initialBrands;
    }
  }

  saveBrands(brands: ProductBrand[]): void {
    this.memoryBrands = brands;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(brands));
      } catch (e) {
        console.error("MockCatalogRepository: Failed to save brands:", e);
      }
    }
    this.notifyListeners();
  }

  resetToDefaults(): void {
    this.memoryProducts = initialProducts;
    this.memoryCategories = initialCategories;
    this.memoryBrands = initialBrands;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY_PRODUCTS);
        localStorage.removeItem(STORAGE_KEY_CATEGORIES);
        localStorage.removeItem(STORAGE_KEY_BRANDS);
      } catch (e) {
        console.error("MockCatalogRepository: Failed to reset defaults:", e);
      }
    }
    this.notifyListeners();
  }
}

export const catalogRepository: ICatalogRepository = new MockCatalogRepository();
