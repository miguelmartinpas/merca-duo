"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import type { Locale } from "@/app/lib/types";
import { dictionaries, type DictKey } from "./dictionaries";

type TFn = (key: DictKey, vars?: Record<string, string | number>) => string;
const LocaleContext = createContext<Locale>("en");

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT(): TFn {
  const locale = useLocale();
  return useCallback<TFn>(
    (key, vars) => {
      let text = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
      }
      return text;
    },
    [locale],
  );
}
