"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { CoffeeButton } from "./CoffeeButton";
import { DonateButton } from "./DonateButton";
import { appName } from "@/app/lib/site";
import { useT } from "@/app/i18n/I18nProvider";

export function Header() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <a href="#" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span>{appName}</span>
        </a>

        <div className="ml-auto flex items-center gap-2">
          <CoffeeButton />
          <DonateButton label={t("header.donate")} />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSelector />
          <ThemeToggle />
        </div>

        <button
          ref={buttonRef}
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
          aria-label={t("header.menu")}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border px-4 md:hidden">
          <div className="flex items-center justify-between gap-4 py-4">
            <span className="text-sm">{t("header.language")}</span>
            <LanguageSelector onSelect={() => setOpen(false)} />
          </div>
          <div className="flex items-center justify-between gap-4 pb-4">
            <span className="text-sm">{t("header.theme")}</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
