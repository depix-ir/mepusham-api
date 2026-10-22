import {
  SizeGuide,
  SizeGuideTemplate,
  SizeGuideColumn,
  SizeGuideDataRow,
  SizeGuideData,
} from "@/types/product";
import { sizeGuideApiService, SizeGuideTemplateDto } from "@/lib/services/sizeGuide";

function mapDtoToSizeGuideTemplate(dto: SizeGuideTemplateDto): SizeGuideTemplate {
  const columns: SizeGuideColumn[] = (dto.columns || []).map((colStr, idx) => ({
    id: `col-${idx + 1}`,
    label: colStr,
    key: `col_${idx + 1}`,
    order: idx + 1,
  }));

  const rows: SizeGuideDataRow[] = (dto.rows || []).map((r, idx) => ({
    id: `row-${idx + 1}`,
    cells: r as Record<string, string>,
    order: idx + 1,
  }));

  return {
    id: dto.id,
    name: dto.title,
    description: dto.description || undefined,
    columns,
    rows,
    createdAt: dto.created_at || new Date().toISOString(),
    updatedAt: dto.updated_at || new Date().toISOString(),
    isActive: true,
  };
}

const STORAGE_KEY_TEMPLATES = "admin_sizeguide_templates_v1";

// Seed default templates
export const INITIAL_TEMPLATES: SizeGuideTemplate[] = [
  {
    id: "tpl-clothing-women",
    name: "راهنمای سایز پوشاک زنانه (استاندارد)",
    description: "قالب استاندارد برای بلوز، پیراهن، مانتو و کت زنانه",
    columns: [
      { id: "col-1", label: "سایز", key: "size", order: 1 },
      { id: "col-2", label: "دور سینه (cm)", key: "bust", order: 2 },
      { id: "col-3", label: "دور کمر (cm)", key: "waist", order: 3 },
      { id: "col-4", label: "دور باسن (cm)", key: "hip", order: 4 },
    ],
    rows: [
      {
        id: "row-1",
        cells: {
          "col-1": "S (36)",
          "col-2": "82 - 86",
          "col-3": "64 - 68",
          "col-4": "88 - 92",
        },
        order: 1,
      },
      {
        id: "row-2",
        cells: {
          "col-1": "M (38)",
          "col-2": "86 - 90",
          "col-3": "68 - 72",
          "col-4": "92 - 96",
        },
        order: 2,
      },
      {
        id: "row-3",
        cells: {
          "col-1": "L (40)",
          "col-2": "90 - 94",
          "col-3": "72 - 76",
          "col-4": "96 - 100",
        },
        order: 3,
      },
      {
        id: "row-4",
        cells: {
          "col-1": "XL (42)",
          "col-2": "94 - 98",
          "col-3": "76 - 80",
          "col-4": "100 - 104",
        },
        order: 4,
      },
    ],
    notes: "اندازه‌ها به سانتی‌متر است. با اندازه‌گیری دور بدن خود مناسب‌ترین سایز را انتخاب کنید.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "tpl-footwear-standard",
    name: "راهنمای سایز کفش و صندل",
    description: "قالب استاندارد اندازه‌گیری کفی پا بر حسب سانتی‌متر",
    columns: [
      { id: "col-1", label: "سایز ایران / اروپا", key: "eu", order: 1 },
      { id: "col-2", label: "طول پا (سانتی‌متر)", key: "cm", order: 2 },
      { id: "col-3", label: "سایز US", key: "us", order: 3 },
    ],
    rows: [
      {
        id: "row-1",
        cells: { "col-1": "36", "col-2": "23.0", "col-3": "5.5" },
        order: 1,
      },
      {
        id: "row-2",
        cells: { "col-1": "37", "col-2": "23.5", "col-3": "6.5" },
        order: 2,
      },
      {
        id: "row-3",
        cells: { "col-1": "38", "col-2": "24.0", "col-3": "7.5" },
        order: 3,
      },
      {
        id: "row-4",
        cells: { "col-1": "39", "col-2": "24.5", "col-3": "8.5" },
        order: 4,
      },
      {
        id: "row-5",
        cells: { "col-1": "40", "col-2": "25.0", "col-3": "9.0" },
        order: 5,
      },
    ],
    notes: "برای انتخاب دقیق، طول بزرگ‌ترین قدم پا از پاشنه تا شست را اندازه بگیرید.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "tpl-pants-unisex",
    name: "راهنمای سایز شلوار",
    description: "قالب استاندارد شلوار جین و پارچه‌ای",
    columns: [
      { id: "col-1", label: "سایز", key: "size", order: 1 },
      { id: "col-2", label: "دور کمر (cm)", key: "waist", order: 2 },
      { id: "col-3", label: "دور باسن (cm)", key: "hip", order: 3 },
      { id: "col-4", label: "قد شلوار (cm)", key: "length", order: 4 },
    ],
    rows: [
      {
        id: "row-1",
        cells: { "col-1": "29 / S", "col-2": "72", "col-3": "90", "col-4": "100" },
        order: 1,
      },
      {
        id: "row-2",
        cells: { "col-1": "30 / M", "col-2": "76", "col-3": "94", "col-4": "102" },
        order: 2,
      },
      {
        id: "row-3",
        cells: { "col-1": "31 / L", "col-2": "80", "col-3": "98", "col-4": "104" },
        order: 3,
      },
    ],
    notes: "قد شلوار از بالای فاق تا لبه پایین اندازه‌گیری شده است.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
];

let inMemoryTemplates: SizeGuideTemplate[] | null = null;

// Helper to safely get stored templates
function getStoredTemplates(): SizeGuideTemplate[] {
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
        inMemoryTemplates = [...INITIAL_TEMPLATES];
        return INITIAL_TEMPLATES;
      }
      const parsed = JSON.parse(raw);
      inMemoryTemplates = parsed;
      return parsed;
    } catch (err) {
      console.error("Failed to read size guide templates from storage:", err);
    }
  }

  if (!inMemoryTemplates) {
    inMemoryTemplates = [...INITIAL_TEMPLATES];
  }
  return inMemoryTemplates;
}

// Helper to save templates
function saveStoredTemplates(templates: SizeGuideTemplate[]): void {
  inMemoryTemplates = templates;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    } catch (err) {
      console.error("Failed to save size guide templates to storage:", err);
    }
  }
}

/**
 * Retrieves all size guide templates (including inactive if requested)
 */
export function getSizeGuideTemplates(includeInactive: boolean = false): SizeGuideTemplate[] {
  const list = getStoredTemplates();
  if (includeInactive) return list;
  return list.filter((t) => t.isActive);
}

/**
 * Finds a template by ID
 */
export function getSizeGuideTemplateById(id: string): SizeGuideTemplate | null {
  const list = getStoredTemplates();
  return list.find((t) => t.id === id) || null;
}

/**
 * Creates a new template
 */
export function createSizeGuideTemplate(
  data: Omit<SizeGuideTemplate, "id" | "createdAt" | "updatedAt" | "isActive"> & {
    isActive?: boolean;
  }
): SizeGuideTemplate {
  const templates = getStoredTemplates();
  const now = new Date().toISOString();
  const newTemplate: SizeGuideTemplate = {
    ...data,
    id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    updatedAt: now,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  const updated = [newTemplate, ...templates];
  saveStoredTemplates(updated);
  return newTemplate;
}

/**
 * Updates an existing template without destroying attached product size guides
 */
export function updateSizeGuideTemplate(
  id: string,
  updatedData: Partial<Omit<SizeGuideTemplate, "id" | "createdAt">>
): SizeGuideTemplate | null {
  const templates = getStoredTemplates();
  let found: SizeGuideTemplate | null = null;

  const updated = templates.map((t) => {
    if (t.id !== id) return t;
    found = {
      ...t,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    return found;
  });

  if (found) {
    saveStoredTemplates(updated);
  }

  return found;
}

/**
 * Archives a template by setting isActive: false
 * This preserves snapshot integrity for products previously using this template
 */
export function archiveSizeGuideTemplate(id: string): boolean {
  const template = getSizeGuideTemplateById(id);
  if (!template) return false;
  updateSizeGuideTemplate(id, { isActive: false });
  return true;
}

/**
 * Clones a template into a standalone snapshot SizeGuide for a product
 */
export function cloneTemplateToSizeGuide(
  templateOrId: SizeGuideTemplate | string,
  productId?: string
): SizeGuide {
  let template: SizeGuideTemplate | null = null;
  if (typeof templateOrId === "string") {
    template = getSizeGuideTemplateById(templateOrId);
  } else {
    template = templateOrId;
  }

  if (!template) {
    throw new Error("Size guide template not found.");
  }

  const now = new Date().toISOString();
  return {
    id: `sg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId,
    title: template.name,
    description: template.description,
    columns: template.columns.map((col) => ({ ...col })),
    rows: template.rows.map((row) => ({
      ...row,
      cells: { ...row.cells },
    })),
    notes: template.notes,
    sourceTemplateId: template.id,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Saves an existing product SizeGuide snapshot as a new reusable template
 */
export function saveSizeGuideAsTemplate(
  sizeGuide: SizeGuide,
  name: string,
  description?: string
): SizeGuideTemplate {
  return createSizeGuideTemplate({
    name: name.trim() || sizeGuide.title,
    description: description?.trim() || sizeGuide.description,
    columns: sizeGuide.columns.map((col) => ({ ...col })),
    rows: sizeGuide.rows.map((row) => ({
      ...row,
      cells: { ...row.cells },
    })),
    notes: sizeGuide.notes,
    isActive: true,
  });
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a SizeGuide or Template entity
 */
export function validateSizeGuide(
  sg: Partial<SizeGuide> | Partial<SizeGuideTemplate>
): ValidationResult {
  const errors: string[] = [];

  const titleStr = "title" in sg ? sg.title : "name" in sg ? sg.name : "";
  if (!titleStr || !titleStr.trim()) {
    errors.push("عنوان راهنمای سایز نباید خالی باشد.");
  }

  if (!sg.columns || sg.columns.length === 0) {
    errors.push("جدول راهنمای سایز باید حداقل دارای یک ستون باشد.");
  } else {
    const emptyCols = sg.columns.filter((c) => !c.label || !c.label.trim());
    if (emptyCols.length > 0) {
      errors.push("عنوان تمامی ستون‌ها باید وارد شود.");
    }

    const colIds = new Set<string>();
    for (const c of sg.columns) {
      if (colIds.has(c.id)) {
        errors.push("شناسه تکراری در ستون‌ها وجود دارد.");
        break;
      }
      colIds.add(c.id);
    }
  }

  if (sg.rows && sg.rows.length > 0) {
    const rowIds = new Set<string>();
    for (const r of sg.rows) {
      if (rowIds.has(r.id)) {
        errors.push("شناسه تکراری در ردیف‌ها وجود دارد.");
        break;
      }
      rowIds.add(r.id);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Converts legacy SizeGuideData structure to new structured SizeGuide
 */
export function convertSizeGuideDataToSizeGuide(
  legacy: SizeGuideData,
  productId?: string
): SizeGuide {
  const now = new Date().toISOString();
  const columns: SizeGuideColumn[] = legacy.columns.map((col, idx) => ({
    id: col.key || `col-${idx + 1}`,
    label: col.label,
    key: col.key,
    order: idx + 1,
  }));

  const rows: SizeGuideDataRow[] = legacy.rows.map((row, idx) => {
    const cells: Record<string, string> = {};
    columns.forEach((col) => {
      const colKey = col.key || col.id;
      cells[col.id] = row[colKey] || row[col.id] || "";
    });
    return {
      id: `row-${idx + 1}`,
      cells,
      order: idx + 1,
    };
  });

  return {
    id: `sg-legacy-${Date.now()}`,
    productId,
    title: legacy.title || "راهنمای سایز",
    description: legacy.description,
    columns,
    rows,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Helper to check if a sizeGuide prop is structured SizeGuide
 */
export function isStructuredSizeGuide(
  sg: SizeGuide | SizeGuideData | undefined
): sg is SizeGuide {
  if (!sg) return false;
  return "columns" in sg && Array.isArray(sg.columns) && sg.columns.length > 0 && "id" in sg.columns[0];
}

/**
 * Normalizes any sizeGuide (legacy or structured) to structured SizeGuide format
 */
export function normalizeSizeGuide(
  sg: SizeGuide | SizeGuideData | undefined,
  productId?: string
): SizeGuide | null {
  if (!sg) return null;
  if (isStructuredSizeGuide(sg)) {
    return sg;
  }
  return convertSizeGuideDataToSizeGuide(sg as SizeGuideData, productId);
}

class SizeGuideService {
  async fetchTemplatesFromApi(): Promise<SizeGuideTemplate[]> {
    try {
      const res = await sizeGuideApiService.listTemplates();
      if (res && Array.isArray(res.templates) && res.templates.length > 0) {
        const templates = res.templates.map(mapDtoToSizeGuideTemplate);
        saveStoredTemplates(templates);
        return templates;
      }
    } catch (err) {
      console.warn("fetchTemplatesFromApi error:", err);
    }
    return getSizeGuideTemplates();
  }

  async createTemplateApi(data: {
    title: string;
    description?: string;
    columns: string[];
    rows: Record<string, unknown>[];
  }): Promise<SizeGuideTemplate | null> {
    try {
      const res = await sizeGuideApiService.createTemplate(data);
      if (res && res.template) {
        const tpl = mapDtoToSizeGuideTemplate(res.template);
        const existing = getStoredTemplates();
        saveStoredTemplates([tpl, ...existing]);
        return tpl;
      }
    } catch (err) {
      console.warn("createTemplateApi error:", err);
    }
    return null;
  }

  async fetchProductSizeGuideFromApi(productId: string): Promise<SizeGuide | null> {
    try {
      const res = await sizeGuideApiService.getStoreProductSizeGuide(productId);
      if (res && res.size_guide) {
        const tpl = mapDtoToSizeGuideTemplate(res.size_guide);
        return cloneTemplateToSizeGuide(tpl, productId);
      }
    } catch (err) {
      console.warn("fetchProductSizeGuideFromApi error:", err);
    }
    return this.getSizeGuideForProduct(productId);
  }

  getSizeGuideForProduct(productId: string): SizeGuide | null {
    if (typeof localStorage === "undefined") return null;
    try {
      const stored = localStorage.getItem(`product_sizeguide_${productId}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return null;
  }
}

export const sizeGuideService = new SizeGuideService();
