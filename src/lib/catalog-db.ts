import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, type Product } from "@/data/catalog";

export type DbProduct = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem_url: string | null;
  estoque: number;
};

export type CatalogState = {
  products: Product[];
  dbByName: Map<string, DbProduct>;
  loaded: boolean;
  error: string | null;
};

const BASE_STATE: CatalogState = {
  products: PRODUCTS,
  dbByName: new Map(),
  loaded: false,
  error: null,
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * The storefront ships with the full catalog bundled (pixel-perfect clone out of the box).
 * When the Supabase `produtos` table holds the same products (see seed/catalogo.sql), the
 * database becomes the source of truth for price, stock and description.
 */
export async function loadCatalog(): Promise<CatalogState> {
  const { data, error } = await supabase
    .from("produtos")
    .select("id, nome, descricao, preco, imagem_url, estoque");

  if (error) {
    return { ...BASE_STATE, products: PRODUCTS, loaded: true, error: error.message };
  }

  const rows = (data ?? []) as DbProduct[];
  const dbByName = new Map<string, DbProduct>();
  for (const row of rows) {
    dbByName.set(normalize(row.nome), row);
  }

  const merged = PRODUCTS.map((product) => {
    const row = dbByName.get(normalize(product.name));
    if (!row) return product;
    return {
      ...product,
      price: Number(row.preco),
      stock: row.estoque > 0,
      stockText: row.estoque > 0 ? "In stock" : "Out of stock",
      image: row.imagem_url ?? product.image,
      info: row.descricao ?? product.info,
    };
  });

  return { products: merged, dbByName, loaded: true, error: null };
}

export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>(BASE_STATE);

  useEffect(() => {
    let cancelled = false;
    void loadCatalog().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
