import { describe, expect, it } from "vitest";

import { SITE } from "@/data/catalog";
import {
  BRAZIL_CATEGORY_IDS,
  CURRENCY,
  SHIPPING_ORIGIN,
  USD_TO_BRL,
  brlFromUsd,
  formatBRL,
} from "@/data/store";

describe("preços em real", () => {
  it("converte o valor em dólar do catálogo original", () => {
    expect(USD_TO_BRL).toBe(5.5);
    expect(brlFromUsd(27)).toBe(148.5);
    expect(brlFromUsd(5)).toBe(27.5);
    expect(brlFromUsd(200)).toBe(1100);
  });

  it("formata o real no padrão brasileiro e no inglês", () => {
    expect(formatBRL(148.5, "pt-BR")).toBe("R$ 148,50");
    expect(formatBRL(148.5, "en")).toBe("R$ 148.50");
    expect(formatBRL(1100, "pt-BR")).toBe("R$ 1.100,00");
    expect(formatBRL(1100, "en")).toBe("R$ 1,100.00");
    expect(formatBRL(27.5, "en")).toBe("R$ 27.50");
  });

  it("mantém as regras comerciais da loja em real", () => {
    expect(CURRENCY).toBe("BRL");
    expect(SITE.shippingCost).toBe(brlFromUsd(5));
    expect(SITE.freeShippingFrom).toBe(brlFromUsd(200));
    expect(SITE.minOrder).toBe(brlFromUsd(60));
  });

  it("expõe a origem do envio e as categorias da loja brasileira", () => {
    expect(SHIPPING_ORIGIN).toBe("Brasil");
    expect([...BRAZIL_CATEGORY_IDS]).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
