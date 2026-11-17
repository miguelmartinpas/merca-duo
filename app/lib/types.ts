export type Locale = "en" | "es" | "fr" | "de" | "pt" | "zh" | "ru" | "ja";
export type Theme = "light" | "dark" | "system";

export interface Preferences {
  locale: Locale;
  theme: Theme;
}

export const LOCALES: Locale[] = ["en", "es", "fr", "de", "pt", "zh", "ru", "ja"];
