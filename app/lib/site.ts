import type { Locale } from "@/app/lib/types";

export const buyMeACoffeeUrl = "https://www.buymeacoffee.com/myitutilities";
export const paypalDonateUrl =
  "https://www.paypal.com/donate/?business=2PZ3L74E8C3JJ&no_recurring=0&currency_code=USD&item_name=I+am+a+software+developer+who+loves+little+projects+in+my+spare+time.+If+you+enjoy+what+I+create%2C+your+support+helps+me.";

export const appName = "WC SOS";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://wcsos.apelogictech.com"
).replace(/\/$/, "");

export const googleSiteVerification = "UvrLAlw31qayA0K5dtd_R3uCw0h-CCzNGJgVIQjGGPE";

export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_PT",
  zh: "zh_CN",
  ru: "ru_RU",
  ja: "ja_JP",
};
