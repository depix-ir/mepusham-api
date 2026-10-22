import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { catalogRepository, mapCategoryDtoToProductCategory, mapBrandDtoToProductBrand } from "../catalogRepository";
import { categoriesApiService } from "@/lib/services/categories";
import { brandsApiService } from "@/lib/services/brands";
import { ApiError } from "@/lib/api/client";

describe("Catalog Migration Integration Tests (Brands & Categories)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    catalogRepository.resetToDefaults();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("1. Successfully fetches public categories from API and maps DTOs", async () => {
    const mockCategoriesResponse = {
      categories: [
        {
          id: "cat-api-1",
          name: "کیف زنانه",
          slug: "womens-bags",
          is_active: true,
          image_id: "img-cat-1",
          parent_category_id: null,
        },
      ],
      count: 1,
      offset: 0,
      limit: 100,
    };

    global.fetch = mock(async () => {
      return new Response(JSON.stringify(mockCategoriesResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const categories = await catalogRepository.fetchCategoriesFromApi();

    expect(categories).toHaveLength(1);
    expect(categories[0].id).toBe("cat-api-1");
    expect(categories[0].name).toBe("کیف زنانه");
    expect(categories[0].slug).toBe("womens-bags");
    expect(categories[0].imageUrl).toBe("/media/img-cat-1");

    // Ensure mock categories are not returned after API call
    const current = catalogRepository.getCategories();
    expect(current).toHaveLength(1);
    expect(current[0].id).toBe("cat-api-1");
  });

  test("2. Successfully fetches public brands from API and maps DTOs", async () => {
    const mockBrandsResponse = {
      brands: [
        {
          id: "brand-api-1",
          name: "چرم مشهد",
          slug: "mashhad-leather",
          is_active: true,
          logo_id: "logo-1",
        },
      ],
      count: 1,
      offset: 0,
      limit: 100,
    };

    global.fetch = mock(async () => {
      return new Response(JSON.stringify(mockBrandsResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const brands = await catalogRepository.fetchBrandsFromApi();

    expect(brands).toHaveLength(1);
    expect(brands[0].id).toBe("brand-api-1");
    expect(brands[0].name).toBe("چرم مشهد");
    expect(brands[0].slug).toBe("mashhad-leather");
    expect(brands[0].logo).toBe("/media/logo-1");

    const current = catalogRepository.getBrands();
    expect(current).toHaveLength(1);
    expect(current[0].id).toBe("brand-api-1");
  });

  test("3. Handles empty API response cleanly without falling back to mock arrays", async () => {
    global.fetch = mock(async () => {
      return new Response(JSON.stringify({ categories: [], count: 0, offset: 0, limit: 100 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const categories = await catalogRepository.fetchCategoriesFromApi();
    expect(categories).toHaveLength(0);

    // Memory state reflects empty API response, NOT initial mock array
    const current = catalogRepository.getCategories();
    expect(current).toHaveLength(0);
  });

  test("4. Throws ApiError on HTTP 500 error from category API", async () => {
    global.fetch = mock(async () => {
      return new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      });
    }) as typeof fetch;

    expect(catalogRepository.fetchCategoriesFromApi()).rejects.toThrow(ApiError);
  });

  test("5. Handles network failure gracefully without returning mock fallbacks in production", async () => {
    global.fetch = mock(async () => {
      throw new Error("Network connection lost");
    }) as typeof fetch;

    // Reset memory state so no memory cache exists
    catalogRepository.saveCategories([]);
    catalogRepository.saveBrands([]);

    expect(catalogRepository.fetchCategoriesFromApi()).rejects.toThrow("Network connection lost");
    expect(catalogRepository.getCategories()).toEqual([]);

    expect(catalogRepository.fetchBrandsFromApi()).rejects.toThrow("Network connection lost");
    expect(catalogRepository.getBrands()).toEqual([]);
  });

  test("6. Correctly maps CategoryDto and BrandDto with null optional fields", () => {
    const categoryDto = {
      id: "cat-2",
      name: "کفش",
      slug: "shoes",
      is_active: true,
      image_id: null,
      parent_category_id: null,
    };

    const mappedCat = mapCategoryDtoToProductCategory(categoryDto);
    expect(mappedCat.id).toBe("cat-2");
    expect(mappedCat.imageUrl).toBeUndefined();
    expect(mappedCat.parentId).toBeUndefined();

    const brandDto = {
      id: "b-2",
      name: "نیک",
      slug: "nike",
      is_active: true,
      logo_id: null,
    };

    const mappedBrand = mapBrandDtoToProductBrand(brandDto);
    expect(mappedBrand.id).toBe("b-2");
    expect(mappedBrand.logo).toBeUndefined();
  });
});
