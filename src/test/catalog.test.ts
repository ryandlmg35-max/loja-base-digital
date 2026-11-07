import { describe, expect, it } from "vitest";

import {
  CATEGORIES,
  FAQ_SECTIONS,
  PAGE_COUNT,
  PRODUCTS,
  SITE,
  VENDORS,
  getCategory,
  getProduct,
  getProductsByCategory,
  getVendor,
} from "@/data/catalog";

describe("Cloned catalog", () => {
  it("keeps every product of the original storefront", () => {
    expect(PRODUCTS).toHaveLength(79);
    expect(new Set(PRODUCTS.map((product) => product.id)).size).toBe(PRODUCTS.length);
  });

  it("lists the newest products first, like the original", () => {
    expect(PRODUCTS[0]?.id).toBe(145);
    expect(PRODUCTS[0]?.name).toContain("Masteron");
    expect(PRODUCTS[PRODUCTS.length - 1]?.id).toBe(67);
  });

  it("paginates 12 products per page over 7 pages", () => {
    expect(SITE.pageSize).toBe(12);
    expect(PAGE_COUNT).toBe(7);
    expect(PRODUCTS.slice(12, 24).map((product) => product.id)).toEqual([
      133, 132, 131, 130, 129, 128, 127, 126, 125, 124, 123, 122,
    ]);
  });

  it("keeps the category tree of the original sidebar", () => {
    expect(CATEGORIES.map((category) => category.id)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15,
    ]);
    expect(getCategory(6)?.name).toBe("Full Stacks");
    expect(getProductsByCategory(6).map((product) => product.id)).toEqual([67]);
    expect(getCategory(15)?.productIds).toEqual([]);
    expect(getCategory(0)?.productIds).toHaveLength(79);
  });

  it("resolves products and vendors by id", () => {
    expect(getProduct(145)?.price).toBe(27);
    expect(getProduct(1)).toBeUndefined();
    expect(getVendor(1)?.name).toBe("Ralts");
    expect(VENDORS).toHaveLength(3);
  });

  it("ships every FAQ block of the original", () => {
    expect(FAQ_SECTIONS.map((section) => section.title)).toEqual([
      "Shipping",
      "Payment methods",
      "Where to get crypto curreny?",
      "Is there a minimum Order?",
      "What happends with my data?",
      "I have another question!",
    ]);
  });

  it("keeps the commercial rules of the original cart", () => {
    expect(SITE.minOrder).toBe(60);
    expect(SITE.shippingCost).toBe(5);
    expect(SITE.freeShippingFrom).toBe(200);
  });
});
