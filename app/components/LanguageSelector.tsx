"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/app/lib/types";
import { LOCALE_NAMES } from "@/app/i18n/dictionaries";
import { useLocale, useT } from "@/app/i18n/I18nProvider";
import { rememberLocale, updatePreferences } from "@/app/lib/preferences";

export function LanguageSelector({
  onSelect,
  className = "",
}: {
  onSelect?: (l: Locale) => void;
  className?: string;
}) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("mousedown", onDown);
    root.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const onListKey = (e: React.KeyboardEvent) => {
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") items[(i + 1) % items.length]?.focus();
    else if (e.key === "ArrowUp") items[(i - 1 + items.length) % items.length]?.focus();
    else return;
    e.preventDefault();
  };

  const choose = (l: Locale) => {
    updatePreferences({ locale: l });
    rememberLocale(l);
    setOpen(false);
    router.push(`/${l}`, { scroll: false });
    onSelect?.(l);
  };

  return (
    <div ref={root} className={`relative inline-block ${className}`}>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("header.language")}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        <span className="pt-[0.15em] leading-none">{LOCALE_NAMES[locale]}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("header.language")}
          onKeyDown={onListKey}
          className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-border bg-background p-2 shadow-xl"
        >
          {LOCALES.map((l) => (
            <li
              key={l}
              lang={l}
              role="option"
              aria-selected={l === locale}
              tabIndex={0}
              onClick={() => choose(l)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  choose(l);
                }
              }}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted focus-visible:bg-muted ${
                l === locale ? "font-semibold text-accent" : ""
              }`}
            >
              {LOCALE_NAMES[l]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
