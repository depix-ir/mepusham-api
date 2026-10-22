export interface UploadResult {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
];

import { mediaApiService } from "@/lib/services/media";

const createdObjectUrls = new Set<string>();

export function validateImageFile(file: File, options?: UploadOptions): { valid: boolean; error?: string } {
  const maxSizeMB = options?.maxSizeMB ?? DEFAULT_MAX_SIZE_MB;
  const allowedTypes = options?.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

  if (!file.type.startsWith("image/") || !allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `فرمت فایل غیرمجاز است. فرمت‌های مجاز: JPG, PNG, WEBP, GIF, SVG`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `حجم فایل بیشتر از حد مجاز است (حداکثر ${maxSizeMB} مگابایت).`,
    };
  }

  return { valid: true };
}

/**
 * Mock Upload Adapter
 * In V1, creates an Object URL from the File and simulates async network latency.
 * Designed to easily connect to S3, Cloudinary, Supabase Storage, or custom API in the future.
 */
export async function uploadMediaFile(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  const validation = validateImageFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error || "فایل غیرمجاز است.");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    const apiRes = await mediaApiService.uploadAdminMedia(formData);
    if (apiRes && apiRes.media) {
      return {
        id: apiRes.media.id,
        url: apiRes.media.url,
        name: apiRes.media.original_filename || file.name,
        size: apiRes.media.file_size || file.size,
        type: apiRes.media.mime_type || file.type,
      };
    }
  } catch (err) {
    console.warn("uploadMediaFile API call error, falling back to local object URL:", err);
  }

  const objectUrl = URL.createObjectURL(file);
  createdObjectUrls.add(objectUrl);

  return {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    url: objectUrl,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Cleanup created object URLs to prevent browser memory leaks
 */
export function revokeMediaObjectUrl(url: string): void {
  if (createdObjectUrls.has(url)) {
    URL.revokeObjectURL(url);
    createdObjectUrls.delete(url);
  }
}
