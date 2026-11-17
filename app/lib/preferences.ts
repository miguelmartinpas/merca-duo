"use client";

import { useSyncExternalStore } from "react";
import { PREFERENCES_KEY, loadJSON, saveJSON } from "./storage";
import { LOCALES, type Preferences } from "./types";

export const DEFAULT_PREFERENCES: Preferences = {
  locale: "en",
  theme: "system",
};

let current: Preferences = DEFAULT_PREFERENCES;
let loaded = false;
const listeners = new Set<() => void>();

function sanitize(raw: Partial<Preferences> | null): Preferences {
  const base: Preferences = DEFAULT_PREFERENCES;
  if (!raw || typeof raw !== "object") return base;
  return {
    locale: LOCALES.includes(raw.locale as never) ? raw.locale! : base.locale,
    theme: raw.theme === "light" || raw.theme === "dark" || raw.theme === "system" ? raw.theme : base.theme,
  };
}

function getSnapshot(): Preferences {
  if (!loaded) {
    loaded = true;
    current = sanitize(loadJSON<Partial<Preferences>>(PREFERENCES_KEY));
  }
  return current;
}

function getServerSnapshot(): Preferences {
  return DEFAULT_PREFERENCES;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function updatePreferences(patch: Partial<Preferences>) {
  current = { ...getSnapshot(), ...patch };
  saveJSON(PREFERENCES_KEY, current);
  listeners.forEach((l) => l());
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function rememberLocale(locale: string) {
  document.cookie = `wc-sos-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
