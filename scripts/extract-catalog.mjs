// extract-catalog.mjs — parse the scraped Simply Steroids pages into a typed catalog module.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { format, resolveConfig } from "prettier";

const DUMP = "C:\\Users\\ryan\\steroid-clone\\dump";
const PAGES = join(DUMP, "pages");
const REPO = "C:\\Users\\ryan\\loja-base-digital";
const OUT_DIR = join(REPO, "src", "data");
mkdirSync(OUT_DIR, { recursive: true });

const PRETTIER_CONFIG = (await resolveConfig(join(OUT_DIR, "catalog.ts"))) ?? {};

/** Writes a generated file already formatted with the repo's prettier config. */
async function writeFormatted(path, source) {
  try {
    const formatted = await format(source, { ...PRETTIER_CONFIG, filepath: path });
    writeFileSync(path, formatted, "utf8");
  } catch {
    writeFileSync(path, source, "utf8");
  }
}

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&euro;/g, "€")
    .replace(/&pound;/g, "£")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d));

const stripTags = (s) =>
  decodeEntities(
    s
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|tr|h\d)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ---------------------------------------------------------------- products
const products = [];
const files = readdirSync(PAGES).filter((f) => /^product_\d+\.html$/.test(f));
for (const f of files) {
  const id = Number(f.match(/(\d+)/)[1]);
  const html = readFileSync(join(PAGES, f), "utf8");
  if (/Product not found/i.test(html)) continue;

  const name = stripTags(
    html.match(/<div class="span7">[\s\S]*?<h2>([\s\S]*?)<\/h2>/)?.[1] ?? "",
  ).trim();
  if (!name) continue;

  const price = Number(
    html.match(/<h4>Price:\s*\$\s*([\d.,]+)<\/h4>/)?.[1]?.replace(/,/g, "") ?? 0,
  );
  const stockText =
    html.match(/<h4 class="text-(success|danger)">([^<]*)<\/h4>/)?.[2]?.trim() ?? "In stock";
  const vendor = html.match(/<h4>from <a href="\/vendor\/(\d+)">([^<]*)<\/a><\/h4>/);
  const image =
    html.match(/<div class="carousel-inner"><div class="item active">\s*<img src="([^"]+)"/)?.[1] ??
    html.match(/<div class="carousel-inner">[\s\S]*?<img src="([^"]+)"/)?.[1] ??
    "";
  const info = (
    html.match(/<div class="tab-pane fade active in" id="home">([\s\S]*?)<\/div>/)?.[1] ?? ""
  )
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "")
    .trim();

  products.push({
    id,
    name,
    slug: slugify(name),
    price,
    stock: !/out of stock/i.test(stockText),
    stockText,
    vendorId: vendor ? Number(vendor[1]) : 0,
    vendorName: vendor ? vendor[2].trim() : "",
    image,
    info,
  });
}
products.sort((a, b) => a.id - b.id);

// ------------------------------------------------------- listing order/price
const order = [];
const listingPrice = new Map();
for (let p = 1; p <= 7; p++) {
  const html = readFileSync(join(PAGES, `index_p${p}.html`), "utf8");
  const cards = [...html.matchAll(/<a href="\/product\/(\d+)"><img src="[^"]+" alt="([^"]*)"/g)];
  for (const m of cards) {
    const pid = Number(m[1]);
    if (!order.includes(pid)) order.push(pid);
  }
  for (const m of html.matchAll(
    /<a href="\/product\/(\d+)">[\s\S]*?<strong>\$([\d.]+)<\/strong>/g,
  )) {
    listingPrice.set(Number(m[1]), Number(m[2]));
  }
}
for (const prod of products) {
  if (listingPrice.has(prod.id)) prod.price = listingPrice.get(prod.id);
}
const sorted = [...products].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
if (order.length) ((products.length = 0), products.push(...sorted));

// -------------------------------------------------------------- categories
const CATEGORY_NAMES = [
  [0, "All products"],
  [1, "Grape seed oil (USA)"],
  [2, "HGH/HCG Products (USA)"],
  [3, "MCT oil (USA)"],
  [4, "Oral Products (USA)"],
  [5, "Peptides (USA)"],
  [6, "Full Stacks"],
  [8, "Grape seed oil (EU)"],
  [9, "MCT oil (EU)"],
  [10, "Oral Products (EU)"],
  [11, "Grape seed oil (UK)"],
  [12, "HGH/HCG Products (UK)"],
  [13, "MCT oil (UK)"],
  [14, "Oral Products (UK)"],
  [15, "Peptides (UK)"],
];
const categories = CATEGORY_NAMES.map(([id, name]) => ({ id, name, productIds: [] }));
const catById = new Map(categories.map((c) => [c.id, c]));
for (const f of readdirSync(PAGES).filter((f) => /^cat_\d+\.html$/.test(f))) {
  const cid = Number(f.match(/(\d+)/)[1]);
  const html = readFileSync(join(PAGES, f), "utf8");
  if (!catById.has(cid)) continue;
  // /cat/15 does not exist on the original store: the server answers with the home listing.
  const isHomeRedirect = /<title>Home - All Categories/.test(html);
  if (isHomeRedirect) {
    catById.get(cid).productIds = [];
    continue;
  }
  const ids = [...new Set([...html.matchAll(/\/product\/(\d+)/g)].map((m) => Number(m[1])))];
  catById.get(cid).productIds = ids.filter((id) => products.some((p) => p.id === id));
}
catById.get(0).productIds = products.map((p) => p.id);
for (const prod of products) {
  prod.categories = categories
    .filter((c) => c.id !== 0 && c.productIds.includes(prod.id))
    .map((c) => c.id);
}

// -------------------------------------------------------------------- vendors
const vendors = [];
const topHtml = readFileSync(join(PAGES, "page_toplist.html"), "utf8");
for (const m of topHtml.matchAll(
  /<a href="\/vendor\/(\d+)">([^<]*)<\/a>\s*-\s*(\d+)\s*sales\s*-\s*<span[^>]*>\(([\d.]+)%\s*feedback\)/g,
)) {
  vendors.push({
    id: Number(m[1]),
    name: m[2].trim(),
    sales: Number(m[3]),
    feedback: `${m[4]}%`,
    image: `/images/vendors/${m[1]}.png`,
    rank: "",
    activeSince: "",
    selling: "",
    feedbacks: "",
    positive: 0,
    totalFeedbacks: 0,
    lastSale: "",
  });
}
for (const vendor of vendors) {
  const file = join(PAGES, `vendor_${vendor.id}.html`);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  vendor.rank = stripTags(
    html.match(/<td style="padding-right:20px;"><b>Rank:<\/b><\/td>\s*<td>([^<]*)<\/td>/)?.[1] ??
      "",
  ).trim();
  vendor.activeSince = stripTags(
    html.match(
      /<td style="padding-right:20px;"><b>Active since:<\/b><\/td>\s*<td>([^<]*)<\/td>/,
    )?.[1] ?? "",
  ).trim();
  vendor.selling = stripTags(
    html.match(
      /<td style="padding-right:20px;"><b>Selling :<\/b><\/td>\s*<td>([\s\S]*?)<\/td>/,
    )?.[1] ?? "",
  ).trim();
  vendor.feedbacks = stripTags(
    html.match(
      /<td style="padding-right:20px;"><b>Feedbacks:<\/b><\/td>\s*<td>([\s\S]*?)<\/td>/,
    )?.[1] ?? "",
  ).trim();
  vendor.lastSale = stripTags(
    html.match(
      /<td style="padding-right:20px;"><b>Last sale:<\/b><\/td>\s*<td>([^<]*)<\/td>/,
    )?.[1] ?? "",
  ).trim();
  const fb = vendor.feedbacks.match(/(\d+)\s*-\s*(\d+)\s*positive\s*\((\d+(?:\.\d+)?)%\)/);
  if (fb) {
    vendor.totalFeedbacks = Number(fb[1]);
    vendor.positive = Number(fb[2]);
  }
}

// ------------------------------------------------------------------------ FAQ
const faqHtml = readFileSync(join(PAGES, "page_faq.html"), "utf8");
const faqSections = [];
const faqRe =
  /<li class="active"[^>]*><a><span class="icon-chevron-right"><\/span>([\s\S]*?)<\/a><\/li>[\s\S]*?<div class="tab-pane fade active in" id="[^"]*">([\s\S]*?)<\/div>/g;
let m;
while ((m = faqRe.exec(faqHtml))) {
  faqSections.push({ title: stripTags(m[1]).trim(), html: m[2].trim() });
}

// ------------------------------------------------------------------- output
const SITE = {
  name: "Simply Steroids",
  tagline: "Highest quality drugs & meds. Fast shipping from USA, Europe and UK.",
  description:
    "Large Selection. Fast Shipping. Worldwide. LSD, Fentanyl, Heroin, MDMA, Ecstasy, Cannabis, Weed, Hashish, Pills and many more.",
  keywords: "LSD, Fentanyl, Heroin, MDMA, Ecstasy, Cannabis, Weed, Hashish, Pills",
  copyright: "Copyright (c) 2015-2026 Simply Steroids",
  shippingCost: 5,
  freeShippingFrom: 200,
  minOrder: 60,
  pageSize: 12,
  referralBonus: 0,
};

const paymentIcons = [
  ["monero", "Monero"],
  ["bitcoin", "Bitcoin"],
  ["ethereum", "Ethereum"],
  ["litecoin", "Litecoin"],
  ["solana", "Solana"],
  ["dogecoin", "Dogecoin"],
  ["tron", "TRON"],
  ["xrp", "Ripple"],
  ["usdt", "USDT"],
];

const ts = `// AUTO-GENERATED by scripts/extract-catalog.mjs — do not edit by hand.
// Snapshot of the Simply Steroids storefront: ${products.length} products, ${categories.length} categories.

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: boolean;
  stockText: string;
  vendorId: number;
  vendorName: string;
  image: string;
  info: string;
  categories: number[];
};

export type Category = {
  id: number;
  name: string;
  productIds: number[];
};

export type Vendor = {
  id: number;
  name: string;
  sales: number;
  feedback: string;
  image: string;
  rank: string;
  activeSince: string;
  selling: string;
  feedbacks: string;
  positive: number;
  totalFeedbacks: number;
  lastSale: string;
};

export type FaqSection = {
  title: string;
  html: string;
};

export const SITE = ${JSON.stringify(SITE, null, 2)} as const;

export const PAYMENT_ICONS: ReadonlyArray<readonly [string, string]> = ${JSON.stringify(paymentIcons)};

export const SHIPPING_BUTTONS: ReadonlyArray<readonly [string, string]> = [
  ["USA", "USA-Products-Button-Small.jpg"],
  ["EU", "EU-Products-Button-Small.jpg"],
  ["UK", "UK-Products-Button-Small.jpg"],
];

export const CATEGORIES: Category[] = ${JSON.stringify(categories, null, 2)};

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};

export const VENDORS: Vendor[] = ${JSON.stringify(vendors, null, 2)};

export const FAQ_SECTIONS: FaqSection[] = ${JSON.stringify(faqSections, null, 2)};

const productIndex = new Map(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id: number): Product | undefined {
  return productIndex.get(id);
}

export function getCategory(id: number): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getProductsByCategory(categoryId: number): Product[] {
  const category = getCategory(categoryId);
  if (!category) return [];
  return category.productIds.map((id) => productIndex.get(id)).filter((p): p is Product => Boolean(p));
}

export function getVendor(id: number): Vendor | undefined {
  return VENDORS.find((v) => v.id === id);
}

export function getVendorProducts(id: number): Product[] {
  return PRODUCTS.filter((p) => p.vendorId === id);
}

export const PRODUCT_COUNT = PRODUCTS.length;
export const PAGE_COUNT = Math.ceil(PRODUCTS.length / SITE.pageSize);
`;

writeFileSync(join(OUT_DIR, "catalog.ts"), ts, "utf8");
await writeFormatted(join(OUT_DIR, "catalog.ts"), ts);

writeFileSync(
  join(DUMP, "catalog.json"),
  JSON.stringify({ site: SITE, categories, products, vendors, faqSections }, null, 2),
  "utf8",
);

// Hidden keyword block that the original ships in the footer (kept for identical markup).
const homeHtml = readFileSync(join(PAGES, "index_p1.html"), "utf8");
const seoBlock = homeHtml.match(
  /<div style="visibility:hidden;height:0px;width:0px;position:fixed;">([\s\S]*?)<\/div>/,
)?.[1];
if (seoBlock) {
  await writeFormatted(
    join(OUT_DIR, "footer-seo.ts"),
    `// AUTO-GENERATED by scripts/extract-catalog.mjs — hidden footer block of the original store.\n` +
      `export const FOOTER_SEO_HTML = ${JSON.stringify(seoBlock.trim())};\n`,
  );
}

// SQL seed for the `produtos` table that Lovable already provisioned.
// Run it once in the Lovable SQL editor (or the Supabase SQL editor) so the database
// holds the same catalog the storefront renders.
const plainText = (html) =>
  decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );

const sqlEscape = (value) => `'${String(value).replace(/'/g, "''")}'`;

const seedDir = join(REPO, "seed");
mkdirSync(seedDir, { recursive: true });

const seedRows = products.map((product) => {
  const description = plainText(product.info).replace(/\n/g, "\n");
  return `  (${sqlEscape(product.name)}, ${sqlEscape(description)}, ${product.price.toFixed(2)}, ${sqlEscape(product.image)}, 100)`;
});

const seedSql = `-- Catalog seed for the cloned store.
-- Paste this into the Lovable SQL editor (Database -> SQL) or the Supabase SQL editor.
-- It is idempotent: existing rows with the same product name are replaced.
--
-- products: id, nome, descricao, preco, imagem_url, estoque, criado_em

delete from public.produtos
where nome in (
${products.map((product) => `  ${sqlEscape(product.name)}`).join(",\n")}
);

insert into public.produtos (nome, descricao, preco, imagem_url, estoque) values
${seedRows.join(",\n")};
`;

writeFileSync(join(seedDir, "catalogo.sql"), seedSql, "utf8");

console.log(
  `products=${products.length} categories=${categories.length} vendors=${vendors.length} faq=${faqSections.length}`,
);
for (const p of products.slice(0, 5)) {
  console.log(
    `#${p.id} ${p.name} | $${p.price} | ${p.image} | vendor=${p.vendorName} | stock=${p.stock}`,
  );
}
console.log("out:", join(OUT_DIR, "catalog.ts"));
