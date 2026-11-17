import { ADSENSE_CERT_AUTHORITY_ID, getAdsenseConfig } from "@/app/lib/adsense";

export function GET() {
  const config = getAdsenseConfig();
  if (!config) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${config.client}, DIRECT, ${ADSENSE_CERT_AUTHORITY_ID}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
