import type { Metadata } from "next";
import { Cookie, Overpass, Overpass_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { dictionaries } from "@/app/i18n/dictionaries";
import { I18nProvider } from "@/app/i18n/I18nProvider";
import { getAdsenseConfig } from "@/app/lib/adsense";
import { OG_LOCALES, appName, googleSiteVerification, siteUrl } from "@/app/lib/site";
import { LOCALES, type Locale } from "@/app/lib/types";
import "../globals.css";

const sans = Overpass({
  variable: "--font-sans-brand",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const mono = Overpass_Mono({
  variable: "--font-mono-brand",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const cookie = Cookie({
  variable: "--font-cookie",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["cursive"],
});

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const locale = lang as Locale;
  const dict = dictionaries[locale];
  const title = dict["seo.title"];
  const description = dict["seo.description"];
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, `/${l}`]));
  languages["x-default"] = "/en";
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: `/${locale}`, languages },
    openGraph: {
      type: "website",
      siteName: appName,
      url: `/${locale}`,
      title,
      description,
      locale: OG_LOCALES[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
    verification: { google: googleSiteVerification },
  };
}

// Se ejecuta antes del primer render: aplica tema e idioma guardados (sin parpadeo).
const initScript = `(function(){try{var d=document.documentElement,p=null;try{p=JSON.parse(localStorage.getItem("wc-sos:preferences:v1"))}catch(e){}var t=p&&(p.theme==="dark"||p.theme==="light")?p.theme:"system";d.classList.toggle("dark",t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches));}catch(e){}})()`;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const adsense = getAdsenseConfig();
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${cookie.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={lang as Locale}>{children}</I18nProvider>
        {adsense && (
          <Script
            async
            crossOrigin="anonymous"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.clientId}`}
          />
        )}
      </body>
    </html>
  );
}
