import { Product, ProductCategory, ProductBrand } from "@/types/product";
import { categoriesApiService, CategoryDto } from "@/lib/services/categories";
import { brandsApiService, BrandDto } from "@/lib/services/brands";

export const STORAGE_KEY_PRODUCTS = "admin_store_products_v1";
export const STORAGE_KEY_CATEGORIES = "admin_store_categories_v1";
export const STORAGE_KEY_BRANDS = "admin_store_brands_v1";

export function mapCategoryDtoToProductCategory(dto: CategoryDto): ProductCategory {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    imageUrl: dto.image_id ? `/media/${dto.image_id}` : undefined,
    parentId: dto.parent_category_id || undefined,
    isActive: dto.is_active,
  };
}

export function mapBrandDtoToProductBrand(dto: BrandDto): ProductBrand {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    logo: dto.logo_id ? `/media/${dto.logo_id}` : undefined,
  };
}

export type CatalogListener = () => void;

export interface ICatalogRepository {
  getProducts(options?: { isHydrated?: boolean }): Product[];
  getProductById(id: string, options?: { isHydrated?: boolean }): Product | null;
  getProductBySlug(slug: string, options?: { isHydrated?: boolean }): Product | null;
  saveProducts(products: Product[]): void;
  getCategories(options?: { isHydrated?: boolean }): ProductCategory[];
  saveCategories(categories: ProductCategory[]): void;
  fetchCategoriesFromApi(): Promise<ProductCategory[]>;
  getBrands(options?: { isHydrated?: boolean }): ProductBrand[];
  saveBrands(brands: ProductBrand[]): void;
  fetchBrandsFromApi(): Promise<ProductBrand[]>;
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
      return this.memoryProducts ?? [];
    }
    if (this.memoryProducts !== null) {
      return this.memoryProducts;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryProducts = parsed;
        return parsed;
      }
      this.memoryProducts = [];
      return [];
    } catch (e) {
      console.error("MockCatalogRepository: Failed to get products:", e);
      return this.memoryProducts ?? [];
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
    const previous = this.memoryProducts;
    this.memoryProducts = products;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      } catch (e) {
        console.error("MockCatalogRepository: Failed to save products:", e);
      }
    }
    if (previous !== products) {
      this.notifyListeners();
    }
  }

  getCategories(options?: { isHydrated?: boolean }): ProductCategory[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (this.memoryCategories !== null) {
      return this.memoryCategories;
    }
    if (!isHydrated) {
      return [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryCategories = parsed;
        return parsed;
      }
      this.memoryCategories = [];
      return [];
    } catch (e) {
      console.error("MockCatalogRepository: Failed to get categories:", e);
      return this.memoryCategories ?? [];
    }
  }

  async fetchCategoriesFromApi(): Promise<ProductCategory[]> {
    const response = await categoriesApiService.listPublicCategories({ limit: 100 });
    const mapped = (response?.categories || []).map(mapCategoryDtoToProductCategory);
    this.saveCategories(mapped);
    return mapped;
  }

  saveCategories(categories: ProductCategory[]): void {
    const previous = this.memoryCategories;
    this.memoryCategories = categories;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
      } catch (e) {
        console.error("MockCatalogRepository: Failed to save categories:", e);
      }
    }
    if (previous !== categories) {
      this.notifyListeners();
    }
  }

  getBrands(options?: { isHydrated?: boolean }): ProductBrand[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (this.memoryBrands !== null) {
      return this.memoryBrands;
    }
    if (!isHydrated) {
      return [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BRANDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryBrands = parsed;
        return parsed;
      }
      this.memoryBrands = [];
      return [];
    } catch (e) {
      console.error("MockCatalogRepository: Failed to get brands:", e);
      return this.memoryBrands ?? [];
    }
  }

  async fetchBrandsFromApi(): Promise<ProductBrand[]> {
    const response = await brandsApiService.listPublicBrands({ limit: 100 });
    const mapped = (response?.brands || []).map(mapBrandDtoToProductBrand);
    this.saveBrands(mapped);
    return mapped;
  }

  saveBrands(brands: ProductBrand[]): void {
    const previous = this.memoryBrands;
    this.memoryBrands = brands;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(brands));
      } catch (e) {
        console.error("MockCatalogRepository: Failed to save brands:", e);
      }
    }
    if (previous !== brands) {
      this.notifyListeners();
    }
  }

  resetToDefaults(): void {
    this.memoryProducts = [];
    this.memoryCategories = [];
    this.memoryBrands = [];
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
