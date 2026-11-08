import { describe, expect, it } from "vitest";
import { SITE } from "@/data/catalog";
import { cartTotals } from "@/lib/cart";

describe("cartTotals", () => {
  it("charges the flat shipping fee below the free-shipping threshold", () => {
    expect(cartTotals(297)).toEqual({ shippingCost: SITE.shippingCost, total: 324.5 });
  });

  it("ships free from the threshold", () => {
    expect(cartTotals(SITE.freeShippingFrom)).toEqual({
      shippingCost: 0,
      total: SITE.freeShippingFrom,
    });
  });

  it("keeps an empty cart at zero", () => {
    expect(cartTotals(0)).toEqual({ shippingCost: 0, total: 0 });
  });
});
