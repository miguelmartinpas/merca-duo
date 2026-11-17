export const PREFERENCES_KEY = "wc-sos:preferences:v1";

// Fallback en memoria si localStorage no está disponible.
const memory = new Map<string, string>();

export function loadJSON<T>(key: string): T | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = memory.get(key) ?? null;
  }
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown): void {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    memory.set(key, raw);
  }
}

export function removeKey(key: string): void {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* sin persistencia */
  }
}
