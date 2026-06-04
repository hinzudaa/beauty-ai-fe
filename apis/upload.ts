import { siteUrl } from "@/config/site";
import { tokenStore } from "@/utils/request";
import { ApiError } from "@/utils/request";

export interface UploadResult {
  url: string;   // Cloudflare R2 CDN URL
  key: string;   // R2 object key, e.g. "selfies/uuid.jpg"
}

/**
 * Upload a selfie directly to Cloudflare R2 via multipart/form-data.
 * Returns the public CDN URL.
 */
export async function uploadSelfie(file: File): Promise<UploadResult> {
  const token = tokenStore.get();
  const form  = new FormData();
  form.append("file", file);

  const res = await fetch(`${siteUrl}/upload`, {
    method:  "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body:    form,
    // Note: do NOT set Content-Type — browser sets it automatically with boundary
  });

  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json?.error ?? "Upload failed");
  return json as UploadResult;
}
