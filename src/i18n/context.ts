import { createContext, useContext } from "react";
import { STRINGS } from "./strings";
import { DEFAULT_LANG, isLang, STORAGE_KEY, type Lang } from "./types";

export type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Idioma salvo no navegador; sem cache, cai no padrão (pt-BR). */
export function readStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLang(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

const fallbackT = (key: string, vars?: Record<string, string | number>) =>
  interpolate(STRINGS.en[key] ?? key, vars);

/**
 * Hooks de idioma. Fora do <LanguageProvider> (por exemplo no ErrorComponent
 * quando a raiz quebrou) devolve o texto em inglês em vez de explodir.
 */
export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { lang: DEFAULT_LANG, setLang: () => {}, t: fallbackT };
  return ctx;
}

export function useT(): (key: string, vars?: Record<string, string | number>) => string {
  return useLang().t;
}
