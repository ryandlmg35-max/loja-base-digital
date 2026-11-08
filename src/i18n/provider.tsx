import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { interpolate, LanguageContext, readStoredLang } from "./context";
import { STRINGS } from "./strings";
import { DEFAULT_LANG, STORAGE_KEY, type Lang } from "./types";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // O servidor sempre renderiza o idioma padrão; o cliente troca depois de hidratar,
  // então o markup do SSR e o primeiro render batem.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = readStoredLang();
    if (stored !== DEFAULT_LANG) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Modo privado / cota cheia: a escolha vale só para esta sessão.
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const template = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
      return interpolate(template, vars);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
