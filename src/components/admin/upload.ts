"use client";

import { MAX_IMAGE_BYTES, validateImage } from "@/lib/upload-rules";

// Uploads one image to the Admin upload route. Returns the public URL or an error.
export async function uploadImage(file: File): Promise<{ url: string } | { error: string }> {
  const problem = validateImage(file);
  if (problem) return { error: problem };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Images must be 5 MB or smaller." };

  const body = new FormData();
  body.append("file", file);

  let response: Response;
  try {
    response = await fetch("/api/admin/upload", { method: "POST", body });
  } catch {
    return { error: "Upload failed. Check your connection and try again." };
  }

  // requireAdmin() redirects to the login page when the session has expired.
  const isJson = response.headers.get("content-type")?.includes("application/json");
  if (response.redirected || !isJson) {
    return { error: "Your session has expired. Open the login page and sign in again." };
  }
  const data = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !data.url) return { error: data.error ?? "Upload failed." };
  return { url: data.url };
}
