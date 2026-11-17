"use client";

import { useLayoutEffect } from "react";
import { usePreferences, updatePreferences } from "@/app/lib/preferences";
import { useT } from "@/app/i18n/I18nProvider";
import type { DictKey } from "@/app/i18n/dictionaries";
import type { Theme } from "@/app/lib/types";

const ICONS: Record<Theme, React.ReactNode> = {
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  dark: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  system: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
};

const OPTIONS: Theme[] = ["light", "dark", "system"];

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme } = usePreferences();
  const t = useT();

  // Aplica la clase y, en modo "system", sigue los cambios del sistema.
  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && mq.matches),
      );
    apply();
    if (theme !== "system") return;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  return (
    <div
      role="group"
      aria-label={t("theme.toggle")}
      className={`inline-flex items-center gap-1 rounded-full border border-border p-1 ${className}`}
    >
      {OPTIONS.map((o) => {
        const label = t(`theme.${o}` as DictKey);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={theme === o}
            aria-label={label}
            title={label}
            onClick={() => updatePreferences({ theme: o })}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              theme === o ? "bg-muted text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {ICONS[o]}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
