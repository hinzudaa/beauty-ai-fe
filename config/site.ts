export const siteConfig = {
  name:        "Looka",
  description: "Монгол хүний нүүр, биеийн онцлогт тохирсон AI гоо сайхны зөвлөгч",
};

/** Backend API base URL */
export const siteUrl = "http://localhost:4000";

/** Frontend app base URL — used for shareable links (og:url, Facebook share) */
export const appUrl = "http://localhost:3000";

export const fetcher = (url: string) =>
  fetch(siteUrl + url).then((res) => res.json());

export type SiteConfig = typeof siteConfig;
