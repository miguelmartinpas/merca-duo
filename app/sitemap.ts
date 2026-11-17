import type { MetadataRoute } from "next";
import { siteUrl } from "@/app/lib/site";
import { LOCALES } from "@/app/lib/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${siteUrl}/${l}`]));
  return LOCALES.map((l) => ({
    url: `${siteUrl}/${l}`,
    alternates: { languages },
  }));
}
