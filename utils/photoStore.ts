export const photoStore = {
  set(dataUrl: string, preview: string) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("bai_photo", dataUrl);
    sessionStorage.setItem("bai_preview", preview);
  },
  get(): { dataUrl: string; preview: string } | null {
    if (typeof window === "undefined") return null;
    const dataUrl = sessionStorage.getItem("bai_photo");
    const preview = sessionStorage.getItem("bai_preview");
    return dataUrl && preview ? { dataUrl, preview } : null;
  },
  clear() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("bai_photo");
    sessionStorage.removeItem("bai_preview");
  },
};
