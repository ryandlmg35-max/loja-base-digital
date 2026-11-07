import { supabase } from "@/integrations/supabase/client";
import type { CartLine } from "@/lib/cart";

export type OrderResult = { ok: true; orderId: string } | { ok: false; error: string };

/**
 * Creates the order in the Supabase tables that Lovable already provisioned:
 * `pedidos` (header) + `pedido_itens` (lines). Products are matched by name against
 * `produtos`, so run seed/catalogo.sql once to have the catalog in the database.
 */
export async function createOrder(lines: CartLine[], total: number): Promise<OrderResult> {
  if (lines.length === 0) {
    return { ok: false, error: "The cart is empty." };
  }

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { ok: false, error: "Please login or register to place an order." };
  }

  const names = lines.map((line) => line.product.name);
  const { data: rows, error: productsError } = await supabase
    .from("produtos")
    .select("id, nome")
    .in("nome", names);

  if (productsError) {
    return { ok: false, error: productsError.message };
  }

  const idByName = new Map<string, string>();
  for (const row of rows ?? []) {
    idByName.set(row.nome.trim().toLowerCase(), row.id);
  }

  const missing = names.filter((name) => !idByName.has(name.trim().toLowerCase()));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Products missing in the database: ${missing.join(", ")}. Run seed/catalogo.sql first.`,
    };
  }

  const { data: pedido, error: orderError } = await supabase
    .from("pedidos")
    .insert({ valor_total: total, status: "pendente" })
    .select("id")
    .single();

  if (orderError || !pedido) {
    return { ok: false, error: orderError?.message ?? "Could not create the order." };
  }

  const itens = lines.map((line) => ({
    pedido_id: pedido.id,
    produto_id: idByName.get(line.product.name.trim().toLowerCase()) ?? "",
    quantidade: line.qty,
    preco_unitario: line.product.price,
  }));

  const { error: itemsError } = await supabase.from("pedido_itens").insert(itens);

  if (itemsError) {
    // Roll back the header so no half-written order stays in the database.
    await supabase.from("pedidos").delete().eq("id", pedido.id);
    return { ok: false, error: itemsError.message };
  }

  return { ok: true, orderId: pedido.id };
}
