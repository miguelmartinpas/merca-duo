import type { Locale } from "@/app/lib/types";

export type Dictionary = Record<string, string>;

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  zh: "中文",
  ru: "Русский",
  ja: "日本語",
};

const en = {
  "header.menu": "Menu",
  "header.language": "Language",
  "header.theme": "Theme",
  "header.donate": "Donate",
  "seo.title": "WC SOS — Find the nearest toilet in an emergency",
  "seo.description": "Find public toilets and venues with restrooms near you, with a walking route in one tap.",
  "theme.toggle": "Toggle light/dark theme",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "System",
} satisfies Dictionary;

export type DictKey = keyof typeof en;
type Dict = Record<DictKey, string>;

const es: Dict = {
  "header.menu": "Menú",
  "header.language": "Idioma",
  "header.theme": "Tema",
  "header.donate": "Donar",
  "seo.title": "WC SOS — Encuentra el baño más cercano en una emergencia",
  "seo.description": "Encuentra baños públicos y locales con aseo cerca de ti, con ruta a pie en un toque.",
  "theme.toggle": "Cambiar tema claro/oscuro",
  "theme.light": "Claro",
  "theme.dark": "Oscuro",
  "theme.system": "Sistema",
};

const fr: Dict = {
  "header.menu": "Menu",
  "header.language": "Langue",
  "header.theme": "Thème",
  "header.donate": "Faire un don",
  "seo.title": "WC SOS — Trouvez les toilettes les plus proches en urgence",
  "seo.description": "Trouvez des toilettes publiques et des établissements avec sanitaires près de vous, avec itinéraire à pied en un geste.",
  "theme.toggle": "Basculer entre thème clair et sombre",
  "theme.light": "Clair",
  "theme.dark": "Sombre",
  "theme.system": "Système",
};

const de: Dict = {
  "header.menu": "Menü",
  "header.language": "Sprache",
  "header.theme": "Design",
  "header.donate": "Spenden",
  "seo.title": "WC SOS — Die nächste Toilette im Notfall finden",
  "seo.description": "Finde öffentliche Toiletten und Lokale mit WC in deiner Nähe, mit Fußweg per Fingertipp.",
  "theme.toggle": "Zwischen hellem und dunklem Design wechseln",
  "theme.light": "Hell",
  "theme.dark": "Dunkel",
  "theme.system": "System",
};

const pt: Dict = {
  "header.menu": "Menu",
  "header.language": "Idioma",
  "header.theme": "Tema",
  "header.donate": "Doar",
  "seo.title": "WC SOS — Encontre a casa de banho mais próxima numa emergência",
  "seo.description": "Encontre casas de banho públicas e estabelecimentos com WC perto de si, com rota a pé num toque.",
  "theme.toggle": "Alternar tema claro/escuro",
  "theme.light": "Claro",
  "theme.dark": "Escuro",
  "theme.system": "Sistema",
};

const zh: Dict = {
  "header.menu": "菜单",
  "header.language": "语言",
  "header.theme": "主题",
  "header.donate": "捐赠",
  "seo.title": "WC SOS — 紧急情况下快速找到最近的厕所",
  "seo.description": "查找附近的公共厕所和提供卫生间的场所，一键获取步行路线。",
  "theme.toggle": "切换浅色/深色主题",
  "theme.light": "浅色",
  "theme.dark": "深色",
  "theme.system": "跟随系统",
};

const ru: Dict = {
  "header.menu": "Меню",
  "header.language": "Язык",
  "header.theme": "Тема",
  "header.donate": "Пожертвовать",
  "seo.title": "WC SOS — Ближайший туалет в экстренной ситуации",
  "seo.description": "Находите общественные туалеты и заведения с санузлом рядом с вами и стройте пеший маршрут одним касанием.",
  "theme.toggle": "Переключить светлую/тёмную тему",
  "theme.light": "Светлая",
  "theme.dark": "Тёмная",
  "theme.system": "Системная",
};

const ja: Dict = {
  "header.menu": "メニュー",
  "header.language": "言語",
  "header.theme": "テーマ",
  "header.donate": "寄付",
  "seo.title": "WC SOS — 緊急時に最寄りのトイレをすばやく検索",
  "seo.description": "近くの公衆トイレやトイレのある施設を探し、ワンタップで徒歩ルートを表示します。",
  "theme.toggle": "ライト／ダークテーマを切り替え",
  "theme.light": "ライト",
  "theme.dark": "ダーク",
  "theme.system": "システム",
};

export const dictionaries: Record<Locale, Dict> = { en, es, fr, de, pt, zh, ru, ja };
