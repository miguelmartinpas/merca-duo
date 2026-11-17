import { AdSlot } from "@/app/components/AdSlot";
import { Footer } from "@/app/components/Footer";
import { Header } from "@/app/components/Header";
import { dictionaries } from "@/app/i18n/dictionaries";
import { appName, siteUrl } from "@/app/lib/site";
import type { Locale } from "@/app/lib/types";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const dict = dictionaries[lang as Locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: appName,
    description: dict["seo.description"],
    inLanguage: lang,
    url: `${siteUrl}/${lang}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main className="flex-1">
        <AdSlot />
      </main>
      <Footer />
    </>
  );
}
