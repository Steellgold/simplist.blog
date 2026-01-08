import { SimplistClient } from "@simplist.blog/sdk";

if (!process.env.SIMPLIST_API_KEY) {
  throw new Error("SIMPLIST_API_KEY is not defined");
}

export const simplist = new SimplistClient({
  apiKey: process.env.SIMPLIST_API_KEY,
  baseUrl: process.env.SIMPLIST_BASE_URL || "https://api.simplist.blog",
  path: process.env.SIMPLIST_PATH || "blog",
});

export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}
