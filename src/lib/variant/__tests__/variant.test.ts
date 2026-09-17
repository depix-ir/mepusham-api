import { describe, expect, test } from "bun:test";
import { validateImageFile } from "@/lib/media/uploadService";
import {
  generateLiveVariants,
  checkVariantCollision,
  ColorSelection,
} from "@/lib/variant/variantGenerator";
import { ProductOption, ProductVariant } from "@/types/product";

describe("Upload Service Validation", () => {
  test("accepts valid image file types", () => {
    const validFile = new File(["dummy content"], "photo.png", { type: "image/png" });
    const result = validateImageFile(validFile);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("rejects invalid non-image file types", () => {
    const invalidFile = new File(["dummy content"], "document.pdf", { type: "application/pdf" });
    const result = validateImageFile(invalidFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("فرمت فایل غیرمجاز است");
  });

  test("rejects image files exceeding max size limit", () => {
    // 10MB dummy file
    const largeBlob = new Uint8Array(10 * 1024 * 1024);
    const largeFile = new File([largeBlob], "large.jpg", { type: "image/jpeg" });
    const result = validateImageFile(largeFile, { maxSizeMB: 5 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("حجم فایل بیشتر از حد مجاز است");
  });
});

describe("Deterministic Variant Generator Pure Service", () => {
  const mockColorOption: ProductOption = {
    id: "opt-color",
    name: "رنگ",
    type: "color",
    required: true,
    sortOrder: 0,
    values: [
      { id: "val-black", label: "مشکی", value: "#000000", sortOrder: 0 },
      { id: "val-white", label: "سفید", value: "#FFFFFF", sortOrder: 1 },
    ],
  };

  const mockSizeOption: ProductOption = {
    id: "opt-size",
    name: "سایز",
    type: "size",
    required: true,
    sortOrder: 1,
    values: [
      { id: "val-s", label: "S", value: "S", sortOrder: 0 },
      { id: "val-m", label: "M", value: "M", sortOrder: 1 },
      { id: "val-l", label: "L", value: "L", sortOrder: 2 },
    ],
  };

  test("generates live variant combinations deterministically", () => {
    const colorSelections: ColorSelection[] = [
      { id: "val-black", label: "مشکی", hex: "#000000", sizes: ["S", "M"] },
      { id: "val-white", label: "سفید", hex: "#FFFFFF", sizes: ["M", "L"] },
    ];

    const generated = generateLiveVariants(
      mockColorOption,
      mockSizeOption,
      colorSelections,
      [],
      { defaultPrice: 500000, defaultStock: 10, skuPrefix: "SHIRT" }
    );

    expect(generated.length).toBe(4);
    const activeVariants = generated.filter((v) => v.status === "active");
    expect(activeVariants.length).toBe(4);

    const skus = activeVariants.map((v) => v.sku);
    expect(skus).toContain("SHIRT-مشکی-S");
    expect(skus).toContain("SHIRT-مشکی-M");
    expect(skus).toContain("SHIRT-سفید-M");
    expect(skus).toContain("SHIRT-سفید-L");
  });

  test("preserves existing variant prices, stock, and SKUs when updating selections", () => {
    const existingVariant: ProductVariant = {
      id: "existing-var-1",
      sku: "CUSTOM-SKU-BLACK-M",
      optionValues: [
        { optionId: "opt-color", valueId: "val-black" },
        { optionId: "opt-size", valueId: "val-m" },
      ],
      pricing: { price: 990000, compareAtPrice: 1200000 },
      inventory: { stock: 45, trackStock: true },
      status: "active",
    };

    const colorSelections: ColorSelection[] = [
      { id: "val-black", label: "مشکی", hex: "#000000", sizes: ["S", "M"] },
    ];

    const generated = generateLiveVariants(
      mockColorOption,
      mockSizeOption,
      colorSelections,
      [existingVariant],
      { defaultPrice: 500000, defaultStock: 10, skuPrefix: "SHIRT" }
    );

    const blackM = generated.find((v) =>
      v.optionValues.some((ov) => ov.valueId === "val-black") &&
      v.optionValues.some((ov) => ov.valueId === "val-m")
    );

    expect(blackM).toBeDefined();
    expect(blackM?.id).toBe("existing-var-1");
    expect(blackM?.sku).toBe("CUSTOM-SKU-BLACK-M");
    expect(blackM?.pricing.price).toBe(990000);
    expect(blackM?.inventory.stock).toBe(45);
  });

  test("marks unselected existing variants as inactive instead of destroying data", () => {
    const existingVariant: ProductVariant = {
      id: "existing-var-deleted",
      sku: "OLD-SKU-WHITE-L",
      optionValues: [
        { optionId: "opt-color", valueId: "val-white" },
        { optionId: "opt-size", valueId: "val-l" },
      ],
      pricing: { price: 750000 },
      inventory: { stock: 3, trackStock: true },
      status: "active",
    };

    // User only selects Black / S now
    const colorSelections: ColorSelection[] = [
      { id: "val-black", label: "مشکی", hex: "#000000", sizes: ["S"] },
    ];

    const generated = generateLiveVariants(
      mockColorOption,
      mockSizeOption,
      colorSelections,
      [existingVariant],
      { defaultPrice: 500000, defaultStock: 10 }
    );

    const preservedInactive = generated.find((v) => v.id === "existing-var-deleted");
    expect(preservedInactive).toBeDefined();
    expect(preservedInactive?.status).toBe("inactive");
    expect(preservedInactive?.pricing.price).toBe(750000);
  });

  test("detects combination collision accurately", () => {
    const variants: ProductVariant[] = [
      {
        id: "var-1",
        optionValues: [
          { optionId: "opt-color", valueId: "val-black" },
          { optionId: "opt-size", valueId: "val-m" },
        ],
        pricing: { price: 100 },
        inventory: { stock: 5, trackStock: true },
        status: "active",
      },
    ];

    const isCollision = checkVariantCollision(
      "var-2",
      [
        { optionId: "opt-color", valueId: "val-black" },
        { optionId: "opt-size", valueId: "val-m" },
      ],
      variants
    );

    expect(isCollision).toBe(true);

    const noCollision = checkVariantCollision(
      "var-1", // checking against itself
      [
        { optionId: "opt-color", valueId: "val-black" },
        { optionId: "opt-size", valueId: "val-m" },
      ],
      variants
    );

    expect(noCollision).toBe(false);
  });
});
