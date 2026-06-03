// Small util at the top of the file (or move to a utils file)
export const getAuthToken = () => {
  // 1) Try localStorage (change the key if yours is different)
  if (typeof window !== "undefined") {
    const fromLS = window.localStorage?.getItem("token");
    if (fromLS) return fromLS;
    // 2) Fallback to cookie (non-HttpOnly). Adjust cookie name if needed.
    const m = document.cookie.match(/(?:^|; )token=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
};
