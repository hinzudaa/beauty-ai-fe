export const siteConfig = {
  name: "Зурхайч",
  description: "Зурхайч",
};

export const siteUrl = "http://localhost:4000";

export const fetcher = (url: string) =>
  fetch(siteUrl + url).then((res) => res.json());

export type SiteConfig = typeof siteConfig;
