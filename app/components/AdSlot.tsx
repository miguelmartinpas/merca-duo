"use client";

import { useEffect, useRef } from "react";
import { getAdsenseConfig } from "@/app/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot() {
  const config = getAdsenseConfig();
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!config || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Bloqueadores de anuncios o script no cargado: se ignora.
    }
  }, [config]);

  if (!config) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 has-[ins[data-ad-status=unfilled]]:hidden">
      <ins
        ref={ref}
        className="adsbygoogle block min-h-[100px] w-full overflow-hidden"
        data-ad-client={config.clientId}
        data-ad-slot={config.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </section>
  );
}
