import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "es", "fr", "de", "pt", "zh", "ru", "ja"];
const DEFAULT_LOCALE = "en";

function getLocale(request: NextRequest): string {
  const saved = request.cookies.get("wc-sos-locale")?.value;
  if (saved && LOCALES.includes(saved)) return saved;

  const header = request.headers.get("accept-language") ?? "";
  const wanted = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return wanted.find((w) => LOCALES.includes(w.lang))?.lang ?? DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  request.nextUrl.pathname = `/${getLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Excluye internos de Next y archivos estáticos (icon.svg…)
  matcher: ["/((?!_next|.*\\..*).*)"],
};
