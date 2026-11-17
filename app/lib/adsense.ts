export type AdsenseConfig = {
  client: string; // "pub-8964106244792231" (formato ads.txt)
  clientId: string; // "ca-pub-8964106244792231" (formato script y data-ad-client)
  slot: string; // "6692643577"
};

export const ADSENSE_CERT_AUTHORITY_ID = "f08c47fec0942fa0"; // ID fijo de Google en ads.txt

/** Devuelve la config, o null si AdSense está desactivado o mal formado. */
export function getAdsenseConfig(): AdsenseConfig | null {
  // Nombres literales para que Next los sustituya también en el bundle del cliente.
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT?.trim();
  if (!client || !slot) return null;
  if (!/^pub-\d{16}$/.test(client) || !/^\d+$/.test(slot)) return null;
  return { client, clientId: `ca-${client}`, slot };
}
