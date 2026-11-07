import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProduct } from "@/data/catalog";
import { createOrder } from "@/lib/orders";

type Row = Record<string, unknown>;

type OrderItem = {
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
};

const PRODUCT = getProduct(145)!;
const PRODUCT_NAME = PRODUCT.name;

const { state, mockSupabase } = vi.hoisted(() => {
  const state = {
    user: { id: "user-1", email: "shopper@loja.test" } as { id: string; email: string } | null,
    products: [] as Array<{ id: string; nome: string }>,
    pedidos: [] as Array<{ id: string; valor_total: number; status: string }>,
    itens: [] as OrderItem[],
    deleted: [] as string[],
    failItems: false,
    pedidoSeq: 0,
  };

  const resolve = (
    table: string,
    mode: "select" | "insert" | "delete",
    payload: Row[] | null,
    filter: string[] | null,
  ): { data: unknown; error: { message: string } | null } => {
    if (table === "produtos") {
      const rows = state.products.filter((row) => !filter || filter.includes(row.nome));
      return { data: rows, error: null };
    }
    if (table === "pedidos") {
      if (mode === "insert") {
        const created = (payload ?? []).map((row) => ({
          id: `pedido-${++state.pedidoSeq}`,
          valor_total: Number(row["valor_total"] ?? 0),
          status: String(row["status"] ?? "pendente"),
        }));
        state.pedidos.push(...created);
        return { data: created, error: null };
      }
      if (mode === "delete") {
        state.deleted.push(...(filter ?? []));
        state.pedidos = state.pedidos.filter((row) => !(filter ?? []).includes(row.id));
        return { data: [], error: null };
      }
      return { data: state.pedidos, error: null };
    }
    if (table === "pedido_itens") {
      if (mode === "insert") {
        if (state.failItems) {
          return { data: null, error: { message: "violates foreign key constraint" } };
        }
        state.itens.push(...(payload as unknown as OrderItem[]));
        return { data: payload, error: null };
      }
      return { data: state.itens, error: null };
    }
    return { data: [], error: null };
  };

  const mockSupabase = {
    auth: {
      getUser: async () => ({ data: { user: state.user }, error: null }),
    },
    from(table: string) {
      let mode: "select" | "insert" | "delete" = "select";
      let payload: Row[] | null = null;
      let filter: string[] | null = null;

      const api = {
        select: () => api,
        in: (_column: string, values: string[]) => {
          filter = values;
          return api;
        },
        eq: (_column: string, value: string) => {
          filter = [value];
          return api;
        },
        insert: (rows: Row | Row[]) => {
          mode = "insert";
          payload = Array.isArray(rows) ? rows : [rows];
          return api;
        },
        delete: () => {
          mode = "delete";
          return api;
        },
        single: async () => {
          const result = resolve(table, mode, payload, filter);
          const data = Array.isArray(result.data) ? (result.data[0] ?? null) : result.data;
          return { ...result, data };
        },
        then: (
          onFulfilled: (value: { data: unknown; error: { message: string } | null }) => unknown,
        ) => Promise.resolve(resolve(table, mode, payload, filter)).then(onFulfilled),
      };

      return api;
    },
  };

  return { state, mockSupabase };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: mockSupabase }));

beforeEach(() => {
  state.user = { id: "user-1", email: "shopper@loja.test" };
  state.products = [];
  state.pedidos = [];
  state.itens = [];
  state.deleted = [];
  state.failItems = false;
  state.pedidoSeq = 0;
});

describe("createOrder", () => {
  it("writes the order header and the lines when the catalog is in the database", async () => {
    state.products = [{ id: "prod-145", nome: PRODUCT_NAME }];

    const result = await createOrder(
      [{ product: PRODUCT, qty: 2, lineTotal: PRODUCT.price * 2 }],
      PRODUCT.price * 2,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.pendingItems).toEqual([]);
    expect(result.linkedItems).toBe(1);
    expect(state.pedidos).toHaveLength(1);
    expect(state.pedidos[0]!.valor_total).toBe(PRODUCT.price * 2);
    expect(state.pedidos[0]!.status).toBe("pendente");
    expect(state.itens).toHaveLength(1);
    expect(state.itens[0]!.produto_id).toBe("prod-145");
    expect(state.itens[0]!.quantidade).toBe(2);
    expect(state.itens[0]!.preco_unitario).toBe(PRODUCT.price);
    expect(state.itens[0]!.pedido_id).toBe(result.orderId);
  });

  it("keeps the order and reports the lines missing from the database", async () => {
    const result = await createOrder(
      [{ product: PRODUCT, qty: 1, lineTotal: PRODUCT.price }],
      PRODUCT.price,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.pendingItems).toEqual([PRODUCT_NAME]);
    expect(result.linkedItems).toBe(0);
    expect(state.pedidos).toHaveLength(1);
    expect(state.itens).toHaveLength(0);
  });

  it("refuses to create an order without a session", async () => {
    state.user = null;

    const result = await createOrder(
      [{ product: PRODUCT, qty: 1, lineTotal: PRODUCT.price }],
      PRODUCT.price,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/login or register/i);
    expect(state.pedidos).toHaveLength(0);
  });

  it("rolls the header back when the line insert fails", async () => {
    state.products = [{ id: "prod-145", nome: PRODUCT_NAME }];
    state.failItems = true;

    const result = await createOrder(
      [{ product: PRODUCT, qty: 1, lineTotal: PRODUCT.price }],
      PRODUCT.price,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/foreign key/i);
    expect(state.pedidos).toHaveLength(0);
    expect(state.deleted).toHaveLength(1);
  });

  it("refuses an empty cart", async () => {
    const result = await createOrder([], 0);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/empty/i);
  });
});
