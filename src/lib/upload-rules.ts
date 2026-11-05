// Shared by the browser (fast feedback) and the upload route (the real check).
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function validateImage(file: { type: string; size: number }) {
  if (!EXTENSION_BY_TYPE[file.type]) return "Use a JPEG, PNG, WebP or GIF image.";
  if (file.size > MAX_IMAGE_BYTES) return "Images must be 5 MB or smaller.";
  return null;
}
