import { describe, expect, it, vi } from "vitest";
import { getProduct } from "@/data/catalog";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

import { PaymentPanel, type PlacedOrder } from "@/components/site/PaymentPanel";
import { render, screen } from "@testing-library/react";

const PRODUCT = getProduct(145)!;

const order: PlacedOrder = {
  id: "pedido-1",
  total: 324.5,
  createdAt: "2026-11-07T22:00:00.000Z",
  lines: [{ product: PRODUCT, qty: 2, lineTotal: PRODUCT.price * 2 }],
  pendingItems: [],
};

describe("PaymentPanel", () => {
  it("shows the receipt, the items and the total", () => {
    render(<PaymentPanel order={order} />);

    expect(screen.getByText("Order registered")).toBeInTheDocument();
    expect(screen.getByText("pedido-1")).toBeInTheDocument();
    expect(screen.getByText("Pending payment")).toBeInTheDocument();
    expect(screen.getByText("R$ 324,50")).toBeInTheDocument();
    expect(screen.getByText(PRODUCT.name)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("publishes the crypto addresses configured in the environment", () => {
    vi.stubEnv("VITE_CRYPTO_BITCOIN", "bc1qtestaddress0000");
    render(<PaymentPanel order={order} />);

    expect(screen.getByText("Bitcoin (BTC)")).toBeInTheDocument();
    expect(screen.getByText("bc1qtestaddress0000")).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it("falls back to the support page when no address is published", () => {
    render(<PaymentPanel order={order} />);

    expect(screen.getByText(/Payment addresses are published by the store/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute("href", "/support");
  });

  it("warns about the lines that are not stored in the database", () => {
    render(<PaymentPanel order={{ ...order, pendingItems: [PRODUCT.name] }} />);

    expect(screen.getByText(/not in the database yet/i)).toBeInTheDocument();
    expect(screen.getByText(/catalog sync/i)).toBeInTheDocument();
  });
});
