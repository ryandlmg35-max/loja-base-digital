import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/context";
import { LANGUAGES } from "@/i18n/types";

/**
 * Seletor de idioma do topo. A escolha fica no localStorage e vale para todas as
 * pÃ¡ginas: a vitrine, o produto, o carrinho e o checkout.
 */
export function LanguagePicker() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = LANGUAGES.find((language) => language.code === lang) ?? LANGUAGES[0];

  return (
    <div className="language-picker" ref={wrapperRef}>
      <button
        type="button"
        className="language-trigger"
        title={t("nav.languageTitle")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.language")}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="icon-globe" /> {current.short}
      </button>
      {open ? (
        <ul className="language-menu" role="listbox" aria-label={t("nav.language")}>
          {LANGUAGES.map((language) => (
            <li key={language.code}>
              <button
                type="button"
                role="option"
                aria-selected={language.code === lang}
                className={language.code === lang ? "active" : ""}
                onClick={() => {
                  setLang(language.code);
                  setOpen(false);
                }}
              >
                {language.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
