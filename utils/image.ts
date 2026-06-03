// utils/image.ts
export const getForumImageSrc = (rawUrl?: string) => {
  if (!rawUrl) return "/placeholder.png";
  // If you set up /api/proxy-image (or run HTTPS in prod), switch to the proxy:
  // return `/api/proxy-image?url=${encodeURIComponent(rawUrl)}`;
  return rawUrl; // dev/local ok if remotePatterns allow localhost:3020
};
