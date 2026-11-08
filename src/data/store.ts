import type { Lang } from "@/i18n/types";
import config from "./store.json";

/**
 * Configuração da loja brasileira. O `usdToBrl` é o único lugar onde a conversão
 * acontece: o catálogo (e o seed SQL) já gravam os preços em real, então o banco
 * e a vitrine falam a mesma língua.
 */
export const CURRENCY = config.currency;
export const USD_TO_BRL = config.usdToBrl;
export const SHIPPING_ORIGIN = config.origin;
export const SHIPPING_ORIGIN_EN = config.originEn;
export const SHIPPING_ORIGIN_CODE = config.originCode;
export const SHIPPING_BUTTON = config.shippingButton;

/** Categorias da loja brasileira (as demais do original ficam fora da vitrine). */
export const BRAZIL_CATEGORY_IDS = [0, 1, 2, 3, 4, 5, 6] as const;

export function brlFromUsd(usd: number): number {
  return Math.round(usd * USD_TO_BRL * 100) / 100;
}

/** R$ 1.100,00 em pt-BR / R$ 1,100.00 em en. */
export function formatBRL(value: number, lang: Lang = "pt-BR"): string {
  const [integer = "0", decimals = "00"] = value.toFixed(2).split(".");
  if (lang === "pt-BR") {
    const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `R$ ${grouped},${decimals}`;
  }
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `R$ ${grouped}.${decimals}`;
}
