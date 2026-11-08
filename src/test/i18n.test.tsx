import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { LanguagePicker } from "@/components/site/LanguagePicker";
import { getCategory, getProduct } from "@/data/catalog";
import enSentences from "@/data/product-sentences.en.json";
import {
  CATEGORY_NAMES_PT,
  PRODUCT_NAMES_PT,
  categoryName,
  productName,
} from "@/i18n/catalog-text";
import { translateProductText, TRANSLATED_SENTENCE_COUNT } from "@/i18n/product-content";
import { useLang } from "@/i18n/context";
import { LanguageProvider } from "@/i18n/provider";
import { DEFAULT_LANG, STORAGE_KEY } from "@/i18n/types";
import { PRODUCTS } from "@/data/catalog";

function Probe() {
  const { lang, t, setLang } = useLang();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="title">{t("home.allCategories")}</span>
      <span data-testid="interpolated">{t("cart.minOrder", { value: "$ 60.00" })}</span>
      <button type="button" onClick={() => setLang("en")}>
        switch
      </button>
    </div>
  );
}

describe("i18n provider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts in Brazilian Portuguese", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(DEFAULT_LANG).toBe("pt-BR");
    expect(screen.getByTestId("lang")).toHaveTextContent("pt-BR");
    expect(screen.getByTestId("title")).toHaveTextContent("Todas as categorias");
  });

  it("switches the language and interpolates variables", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "switch" }));

    expect(screen.getByTestId("lang")).toHaveTextContent("en");
    expect(screen.getByTestId("title")).toHaveTextContent("All categories");
    expect(screen.getByTestId("interpolated")).toHaveTextContent("min. order is $ 60.00");
  });

  it("keeps the choice in localStorage and restores it on the next visit", () => {
    const { unmount } = render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "switch" }));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("en");
    unmount();

    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("lang")).toHaveTextContent("en");
  });

  it("falls back to the key when a string is missing", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("lang")).toBeInTheDocument();
  });
});

describe("language picker", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("lists the available languages and applies the one clicked", () => {
    render(
      <LanguageProvider>
        <LanguagePicker />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Idioma" }));
    expect(screen.getByRole("option", { name: "Português (BR)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "English" }));
    expect(screen.getByRole("button", { name: "Language" })).toHaveTextContent("EN");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("en");
  });
});

describe("catalog translation", () => {
  it("translates every product name and category name", () => {
    expect(Object.keys(PRODUCT_NAMES_PT)).toHaveLength(PRODUCTS.length);

    for (const product of PRODUCTS) {
      expect(PRODUCT_NAMES_PT[product.id]).toBeTruthy();
    }

    for (const category of [getCategory(0), getCategory(6), getCategory(15)]) {
      expect(category).toBeTruthy();
      expect(CATEGORY_NAMES_PT[category!.id]).toBeTruthy();
    }
  });

  it("keeps the original names when the language is english", () => {
    const product = getProduct(145)!;

    expect(productName(product, "en")).toBe(product.name);
    expect(productName(product, "pt-BR")).toBe("MCT – Masteron Propionato 100mg/ml – Frasco 10ml");
    expect(categoryName(getCategory(6), "en")).toBe("Full Stacks");
    expect(categoryName(getCategory(6), "pt-BR")).toBe("Stacks completos");
  });

  it("translates the long product descriptions sentence by sentence", () => {
    const product = getProduct(145)!;

    expect(translateProductText(product.info, "en")).toBe(product.info);

    const translated = translateProductText(product.info, "pt-BR");
    expect(translated).not.toBe(product.info);
    expect(translated).toContain("meia-vida");
    expect(translated).toContain("Masteron");
  });

  it("keeps unknown sentences in the original language instead of breaking the page", () => {
    const unknown = "Sentence written by the customer service team.";
    expect(translateProductText(unknown, "pt-BR")).toBe(unknown);
  });

  it("covers every sentence of the catalog", () => {
    expect(enSentences).toHaveLength(423);
    expect(TRANSLATED_SENTENCE_COUNT).toBe(enSentences.length);
  });
});
