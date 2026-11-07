import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Product } from "@/data/catalog";

export type CartLine = {
  product: Product;
  qty: number;
  lineTotal: number;
};

type CartState = Record<string, number>;

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (productId: number, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "steroid-store.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const state: CartState = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const id = Number(key);
      const qty = Number(value);
      if (Number.isFinite(id) && Number.isFinite(qty) && qty > 0 && getProduct(id)) {
        state[String(id)] = Math.floor(qty);
      }
    }
    return state;
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({});
  const [hydrated, setHydrated] = useState(false);

  // localStorage is read after mount so the SSR markup and the first client render match.
  useEffect(() => {
    setState(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private mode / quota exceeded: the cart stays in memory for this session.
    }
  }, [state, hydrated]);

  const add = useCallback((productId: number, qty = 1) => {
    setState((prev) => {
      const current = prev[String(productId)] ?? 0;
      return { ...prev, [String(productId)]: current + Math.max(1, Math.floor(qty)) };
    });
  }, []);

  const setQty = useCallback((productId: number, qty: number) => {
    setState((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[String(productId)];
      } else {
        next[String(productId)] = Math.floor(qty);
      }
      return next;
    });
  }, []);

  const remove = useCallback((productId: number) => {
    setState((prev) => {
      const next = { ...prev };
      delete next[String(productId)];
      return next;
    });
  }, []);

  const clear = useCallback(() => setState({}), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = Object.entries(state)
      .map(([id, qty]) => {
        const product = getProduct(Number(id));
        if (!product) return null;
        return { product, qty, lineTotal: product.price * qty };
      })
      .filter((line): line is CartLine => line !== null)
      .sort((a, b) => b.product.id - a.product.id);

    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
      hydrated,
      add,
      setQty,
      remove,
      clear,
    };
  }, [state, hydrated, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
