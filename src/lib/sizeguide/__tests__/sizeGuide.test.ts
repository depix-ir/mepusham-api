import { describe, test, expect, beforeEach } from "bun:test";
import {
  getSizeGuideTemplates,
  getSizeGuideTemplateById,
  createSizeGuideTemplate,
  updateSizeGuideTemplate,
  archiveSizeGuideTemplate,
  cloneTemplateToSizeGuide,
  saveSizeGuideAsTemplate,
  validateSizeGuide,
  normalizeSizeGuide,
} from "../sizeGuideService";
import { SizeGuide, SizeGuideTemplate, Product } from "@/types/product";

describe("Size Guide & Size Guide Template Domain Logic", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  test("1. Seed templates are retrieved correctly", () => {
    const templates = getSizeGuideTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0].name).toBeDefined();
    expect(templates[0].columns.length).toBeGreaterThan(0);
    expect(templates[0].rows.length).toBeGreaterThan(0);
  });

  test("2. Creating a new SizeGuideTemplate persists and can be retrieved", () => {
    const newTpl = createSizeGuideTemplate({
      name: "قالب آزمایشی پاپوش",
      description: "توضیح پاپوش",
      columns: [
        { id: "c1", label: "سایز", order: 1 },
        { id: "c2", label: "طول", order: 2 },
      ],
      rows: [
        { id: "r1", cells: { c1: "36", c2: "22" }, order: 1 },
      ],
      notes: "نکته تست",
    });

    expect(newTpl.id).toBeDefined();
    expect(newTpl.name).toBe("قالب آزمایشی پاپوش");
    expect(newTpl.isActive).toBe(true);

    const found = getSizeGuideTemplateById(newTpl.id);
    expect(found).not.toBeNull();
    expect(found?.name).toBe("قالب آزمایشی پاپوش");
  });

  test("3. Selecting / cloning a template creates an independent snapshot copy for a product", () => {
    const templates = getSizeGuideTemplates();
    const originalTpl = templates[0];

    const snapshot = cloneTemplateToSizeGuide(originalTpl, "prod-101");

    expect(snapshot.id).not.toBe(originalTpl.id);
    expect(snapshot.productId).toBe("prod-101");
    expect(snapshot.sourceTemplateId).toBe(originalTpl.id);
    expect(snapshot.title).toBe(originalTpl.name);
    expect(snapshot.columns.length).toBe(originalTpl.columns.length);
    expect(snapshot.rows.length).toBe(originalTpl.rows.length);

    // Mutate snapshot
    snapshot.columns.push({ id: "c-new", label: "ستون جدید", order: 99 });
    snapshot.rows[0].cells["c-new"] = "تست";

    // Original template must remain untouched!
    const reFetchedTpl = getSizeGuideTemplateById(originalTpl.id);
    expect(reFetchedTpl?.columns.length).toBe(originalTpl.columns.length);
    expect(reFetchedTpl?.columns.some((c) => c.id === "c-new")).toBe(false);
  });

  test("4. Editing product SizeGuide snapshot does not modify the source Template", () => {
    const tpl = createSizeGuideTemplate({
      name: "قالب پیراهن",
      columns: [{ id: "c1", label: "سایز", order: 1 }],
      rows: [{ id: "r1", cells: { c1: "M" }, order: 1 }],
    });

    const productSg = cloneTemplateToSizeGuide(tpl, "prod-202");

    // Modify product SG
    productSg.rows[0].cells["c1"] = "L";
    productSg.title = "عنوان تغییریافته فقط برای این محصول";

    // Verify original template is unchanged
    const sourceTpl = getSizeGuideTemplateById(tpl.id);
    expect(sourceTpl?.name).toBe("قالب پیراهن");
    expect(sourceTpl?.rows[0].cells["c1"]).toBe("M");
  });

  test("5. Save as Template creates a new independent SizeGuideTemplate from current SizeGuide", () => {
    const currentSg: SizeGuide = {
      id: "sg-custom-1",
      title: "راهنمای سایز کاپشن",
      columns: [
        { id: "col-1", label: "سایز", order: 1 },
        { id: "col-2", label: "قد کاپشن", order: 2 },
      ],
      rows: [
        { id: "row-1", cells: { "col-1": "L", "col-2": "75" }, order: 1 },
      ],
      notes: "قد از سرشانه",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTemplate = saveSizeGuideAsTemplate(
      currentSg,
      "قالب استاندارد کاپشن زمستانه",
      "برای تمامی کاپشن‌ها"
    );

    expect(newTemplate.id).toBeDefined();
    expect(newTemplate.name).toBe("قالب استاندارد کاپشن زمستانه");
    expect(newTemplate.columns.length).toBe(2);
    expect(newTemplate.rows[0].cells["col-2"]).toBe("75");
  });

  test("6. Dynamic column/row additions, deletions, renames and cell editing", () => {
    const sg: SizeGuide = {
      id: "sg-builder-test",
      title: "جدول dynamic",
      columns: [{ id: "c1", label: "سایز", order: 1 }],
      rows: [{ id: "r1", cells: { c1: "S" }, order: 1 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add Column
    sg.columns.push({ id: "c2", label: "دور کمر", order: 2 });
    // Rename Column
    sg.columns[0].label = "سایز استاندارد";
    // Add Row
    sg.rows.push({ id: "r2", cells: { c1: "M", c2: "70 cm" }, order: 2 });
    // Cell Editing
    sg.rows[0].cells["c2"] = "65 cm";

    expect(sg.columns.length).toBe(2);
    expect(sg.columns[0].label).toBe("سایز استاندارد");
    expect(sg.rows.length).toBe(2);
    expect(sg.rows[0].cells["c2"]).toBe("65 cm");

    // Delete Column and cleanup
    const deleteColId = "c2";
    sg.columns = sg.columns.filter((c) => c.id !== deleteColId);
    sg.rows.forEach((r) => delete r.cells[deleteColId]);

    expect(sg.columns.length).toBe(1);
    expect(sg.rows[0].cells["c2"]).toBeUndefined();
  });

  test("7. Deleting / Archiving a Template does not break products using previously cloned SizeGuide", () => {
    const tpl = createSizeGuideTemplate({
      name: "قالب قدیمی",
      columns: [{ id: "c1", label: "سایز", order: 1 }],
      rows: [{ id: "r1", cells: { c1: "XL" }, order: 1 }],
    });

    const productSg = cloneTemplateToSizeGuide(tpl, "prod-303");

    // Archive template
    archiveSizeGuideTemplate(tpl.id);

    // Template is inactive or archived
    const fetchedTpl = getSizeGuideTemplateById(tpl.id);
    expect(fetchedTpl?.isActive).toBe(false);

    // Product size guide snapshot remains 100% intact!
    expect(productSg.title).toBe("قالب قدیمی");
    expect(productSg.rows[0].cells["c1"]).toBe("XL");
  });

  test("8. Image is optional and structured table works fine without or with supplementary image", () => {
    const sgWithoutImage: SizeGuide = {
      id: "sg-1",
      title: "بدون عکس",
      columns: [{ id: "c1", label: "سایز", order: 1 }],
      rows: [{ id: "r1", cells: { c1: "S" }, order: 1 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(sgWithoutImage.imageUrl).toBeUndefined();

    const sgWithImage: SizeGuide = {
      ...sgWithoutImage,
      imageUrl: "/images/size-chart-diagram.webp",
    };

    expect(sgWithImage.imageUrl).toBe("/images/size-chart-diagram.webp");
  });

  test("9. Validation rules reject invalid titles, empty columns, duplicate column IDs", () => {
    // Empty title
    const invalid1 = validateSizeGuide({
      title: "   ",
      columns: [{ id: "c1", label: "سایز", order: 1 }],
    });
    expect(invalid1.isValid).toBe(false);
    expect(invalid1.errors[0]).toContain("عنوان");

    // No columns
    const invalid2 = validateSizeGuide({
      title: "جدول بدون ستون",
      columns: [],
    });
    expect(invalid2.isValid).toBe(false);

    // Duplicate column IDs
    const invalid3 = validateSizeGuide({
      title: "شناسه ستون تکراری",
      columns: [
        { id: "c1", label: "ست 1", order: 1 },
        { id: "c1", label: "ست 2", order: 2 },
      ],
    });
    expect(invalid3.isValid).toBe(false);

    // Valid
    const valid = validateSizeGuide({
      title: "راهنمای سایز معتبر",
      columns: [{ id: "c1", label: "سایز", order: 1 }],
      rows: [{ id: "r1", cells: { c1: "S" }, order: 1 }],
    });
    expect(valid.isValid).toBe(true);
    expect(valid.errors.length).toBe(0);
  });

  test("10. Normalizer seamlessly handles both legacy SizeGuideData and new structured SizeGuide", () => {
    const legacyData = {
      type: "clothing" as const,
      title: "راهنمای قديمی",
      description: "توضیحات",
      columns: [
        { key: "size", label: "سایز" },
        { key: "bust", label: "دور سینه" },
      ],
      rows: [{ size: "M", bust: "90" }],
    };

    const normalized = normalizeSizeGuide(legacyData, "prod-legacy");

    expect(normalized).not.toBeNull();
    expect(normalized?.title).toBe("راهنمای قديمی");
    expect(normalized?.columns.length).toBe(2);
    expect(normalized?.rows.length).toBe(1);
    expect(normalized?.rows[0].cells["size"]).toBe("M");
    expect(normalized?.rows[0].cells["bust"]).toBe("90");
  });
});
