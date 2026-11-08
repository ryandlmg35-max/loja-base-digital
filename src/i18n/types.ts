export const LANGUAGES = [
  { code: "pt-BR", label: "Português (BR)", short: "PT-BR" },
  { code: "en", label: "English", short: "EN" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANG: Lang = "pt-BR";

export const STORAGE_KEY = "steroid-store.lang.v1";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && LANGUAGES.some((language) => language.code === value);
}
