// E2E da vitrine clonada — roda contra http://localhost:8080 (dev server).
//
//   npm i playwright-core          (fora do repo ou como devDependency)
//   CHROMIUM_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" node scripts/e2e-store.mjs
//   BASE_URL=https://... node scripts/e2e-store.mjs
//
// Sem CHROMIUM_PATH, usa o Chromium do cache do Playwright (%LOCALAPPDATA%\ms-playwright).
// O site é bilíngue (pt-BR por padrão, en no seletor de idioma), então o roteiro
// checa as duas línguas.
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

function resolveChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;

  const cache = join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  if (existsSync(cache)) {
    for (const entry of readdirSync(cache)) {
      if (!entry.startsWith("chromium-")) continue;
      for (const relative of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"]) {
        const candidate = join(cache, entry, relative);
        if (existsSync(candidate)) return candidate;
      }
    }
  }

  for (const candidate of [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ]) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error("No Chromium/Edge found. Set CHROMIUM_PATH.");
}

const EXE = resolveChromium();
const BASE = process.env.BASE_URL ?? "http://localhost:8080";
const SHOTS = process.env.SHOTS_DIR ?? "C:\\Users\\ryan\\steroid-clone\\shots";
mkdirSync(SHOTS, { recursive: true });

const results = [];
const consoleErrors = [];
const failedRequests = [];
let failures = 0;

function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail: String(detail).slice(0, 400) });
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` :: ${detail}` : ""}`);
}

const browser = await chromium.launch({
  executablePath: EXE,
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
page.on("requestfailed", (req) =>
  failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`),
);
page.on("response", (res) => {
  if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
});

// ---------------------------------------------------------------- 1. HOME
await page.goto(BASE, { waitUntil: "networkidle" });
check("home: carrega com 200", page.url() === `${BASE}/`, page.url());

const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
check("home: Bootstrap aplicado (fonte Helvetica Neue)", /Helvetica Neue/.test(bodyFont), bodyFont);

const navBg = await page.evaluate(() => {
  const nav = document.querySelector(".topNav");
  return nav ? getComputedStyle(nav).backgroundColor : "";
});
check("home: navbar com estilo (topNav #f2f2f2)", navBg === "rgb(242, 242, 242)", navBg);

const cards = await page.locator("ul.thumbnails li.span4").count();
check("home: 12 produtos na paginacao 1", cards === 12, `${cards} cards`);

const pager = (await page.locator(".actions").innerText()).replace(/\s+/g, " ").trim();
check("home: pager identico ao original (1 / 7)", pager === "1 / 7", pager);

const firstName = await page.locator("ul.thumbnails li.span4 h5").first().innerText();
check("home: primeiro produto = MCT Masteron (pt-BR)", /Masteron/.test(firstName), firstName);

const paymentIcons = await page.locator("footer.footer img[src^='/images/icon_']").count();
check("home: 9 icones de pagamento no rodape", paymentIcons === 9, `${paymentIcons} icones`);

const iconDisplay = await page.evaluate(() => {
  const img = document.querySelector("footer.footer img");
  return img ? getComputedStyle(img).display : "";
});
check(
  "home: icones do rodape inline (preflight do Tailwind neutralizado)",
  iconDisplay === "inline",
  iconDisplay,
);

const navText = (await page.locator(".topNav").innerText()).replace(/\s+/g, " ").trim();
check(
  "home: nav em portugues (Início / Suporte / Carrinho)",
  /Início/.test(navText) && /Suporte/.test(navText) && /Carrinho/.test(navText),
  navText.slice(0, 160),
);

const heading = await page.locator(".span9 .well h3").first().innerText();
check("home: titulo 'Todas as categorias'", /Todas as categorias/.test(heading), heading);

const shippingText = (await page.locator(".mybuttons").innerText()).replace(/\s+/g, " ").trim();
check(
  "home: banner de envio fala do Brasil",
  /Enviamos do Brasil/.test(shippingText),
  shippingText.slice(0, 120),
);

const brazilFlagOk = await page.evaluate(() => {
  const img = document.querySelector(".mybuttons img[src*='Brasil']");
  return img ? img.complete && img.naturalWidth > 0 : false;
});
check("home: botao de envio Brasil carrega", brazilFlagOk);

const sidebarText = (await page.locator("#sidebar").innerText()).replace(/\s+/g, " ").trim();
check(
  "home: categorias da loja brasileira (Brasil, sem EUA/Europa)",
  /Brasil/.test(sidebarText) && !/EUA|USA|Europa|Europa|UK/.test(sidebarText),
  sidebarText.slice(0, 160),
);

const homePrices = (await page.locator("ul.thumbnails").first().innerText()).replace(/\s+/g, " ");
check("home: precos em real (R$ 148,50)", /R\$ 148,50/.test(homePrices), homePrices.slice(0, 160));

await page.screenshot({ path: `${SHOTS}\\01-home.png`, fullPage: false });

// ------------------------------------------------------- 2. CLIQUE NO PRODUTO
await page.locator('a[href="/product/145"]').first().click();
await page.waitForURL("**/product/145");
await page.waitForLoadState("networkidle");
const productTitle = await page.locator(".span7 h2").innerText();
check(
  "produto: abre /product/145 com o titulo traduzido",
  /Masteron Propionato/.test(productTitle),
  productTitle,
);
const productPrice = await page.locator(".qtyFrm h4").first().innerText();
check(
  "produto: preco exibido em real (Preço: R$ 148,50)",
  productPrice.replace(/\s+/g, " ").trim() === "Preço: R$ 148,50",
  productPrice,
);
const infoText = await page.locator("#home").innerText();
check("produto: descricao renderizada", infoText.length > 400, `${infoText.length} chars`);
check(
  "produto: descricao em portugues (meia-vida / ciclo)",
  /meia-vida/i.test(infoText) && /ciclo/i.test(infoText),
  infoText.slice(0, 160),
);
const imgOk = await page.evaluate(() => {
  const img = document.querySelector(".carousel-inner img");
  return img ? img.complete && img.naturalWidth > 0 : false;
});
check("produto: imagem do catalogo carrega", imgOk);
await page.screenshot({ path: `${SHOTS}\\02-produto.png`, fullPage: false });

// ------------------------------------------------------- 3. ADD TO CART
await page.fill("#qty", "2");
await page.locator("form.qtyFrm button.shopBtn").click();
await page.waitForURL("**/cart");
await page.waitForSelector("h2:has-text('Finalizar compra')");
await page.waitForSelector("table.table-bordered tbody tr");
const bodyText = (await page.locator(".span12 .well").innerText()).replace(/\s+/g, " ");
check(
  "carrinho: item listado com 2 unidades",
  /Masteron/.test(bodyText) && /R\$ 297,00/.test(bodyText),
  bodyText.slice(0, 220),
);
check("carrinho: frete R$ 27,50 (subtotal < 1.100)", /R\$ 27,50/.test(bodyText), "");
check("carrinho: total R$ 324,50 (297 + 27,50)", /R\$ 324,50/.test(bodyText), "");
check(
  "carrinho: minimo de pedido R$ 330,00 exibido",
  /pedido mínimo R\$ 330,00/.test(bodyText),
  "",
);
check(
  "carrinho: exige login para fechar pedido",
  /Entre ou faça o cadastro para fechar o pedido/.test(bodyText),
  "",
);
const badge = await page.locator('a[href="/cart"]').innerText();
check(
  "nav: contador do carrinho mostra (2)",
  /\(2\)/.test(badge),
  badge.replace(/\s+/g, " ").trim(),
);
await page.screenshot({ path: `${SHOTS}\\03-carrinho.png`, fullPage: false });

// ------------------------------------------------------- 4. CADASTRO
const email = `e2e.loja.${Date.now()}@gmail.com`;
const password = "LojaClone#2026";
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
const registerForm = page.locator("form").nth(0);
await registerForm.locator("#username").fill("E2E Tester");
await registerForm.locator("#register-email").fill(email);
await registerForm.locator("#pass1").fill(password);
await registerForm.locator("#pass2").fill(password);
await registerForm.locator('button[type="submit"]').click();
await page.waitForTimeout(3000);
const registerNotice = (await page.locator(".span6 .well").nth(0).innerText()).replace(/\s+/g, " ");
check(
  "cadastro: conta criada (com fallback de confirmacao de email)",
  /Conta criada/.test(registerNotice),
  registerNotice.slice(0, 200),
);
await page.screenshot({ path: `${SHOTS}\\04-cadastro.png`, fullPage: false });

// ------------------------------------------------------- 5. LOGIN
const loginForm = page.locator("form").nth(1);
await loginForm.locator("#login-email").fill(email);
await loginForm.locator("#login-pass").fill(password);
await loginForm.locator('button[type="submit"]').click();
await page.waitForTimeout(2500);
const loginNotice = (await page.locator(".span6 .well").nth(1).innerText()).replace(/\s+/g, " ");
const loggedIn = /logado como/i.test(await page.locator("body").innerText());
check(
  "login: conta sem email confirmado nao entra (gate do Supabase)",
  !loggedIn && /Email not confirmed/i.test(loginNotice),
  loginNotice.slice(0, 200),
);
const resendVisible = await page.locator("button:has-text('Reenviar confirmação')").count();
check(
  "login: botao 'Reenviar confirmação' aparece quando o email nao esta confirmado",
  resendVisible === 1,
  `${resendVisible}`,
);

// credencial errada
await loginForm.locator("#login-email").fill(email);
await loginForm.locator("#login-pass").fill("senhaErrada123");
await loginForm.locator('button[type="submit"]').click();
await page.waitForTimeout(2000);
const wrongNotice = (await page.locator(".span6 .well").nth(1).innerText()).replace(/\s+/g, " ");
check(
  "login: senha errada mostra erro",
  /Invalid login credentials/i.test(wrongNotice),
  wrongNotice.slice(0, 160),
);
await page.screenshot({ path: `${SHOTS}\\05-login.png`, fullPage: false });

// ------------------------------------------------------- 6. PERSISTENCIA DO CARRINHO
await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
const persisted = (await page.locator(".span12 .well").innerText()).replace(/\s+/g, " ");
check(
  "carrinho: persiste no localStorage entre paginas",
  /Masteron/.test(persisted) && /R\$ 324,50/.test(persisted),
  "",
);

// ------------------------------------------------------- 7. FAQ / TOPLIST / VENDOR
await page.goto(`${BASE}/faq`, { waitUntil: "networkidle" });
const faqBlocks = await page.locator(".tabWrapper").count();
check("faq: 6 blocos de perguntas", faqBlocks === 6, `${faqBlocks} blocos`);
const faqText = (await page.locator(".span12").innerText()).replace(/\s+/g, " ");
check(
  "faq: traduzido (Envio / Frete grátis)",
  /Envio/.test(faqText) && /Frete grátis/.test(faqText),
  faqText.slice(0, 160),
);
check(
  "faq: envio do Brasil e precos em real",
  /enviados do Brasil/.test(faqText) && /R\$ 27,50/.test(faqText) && /R\$ 1\.100,00/.test(faqText),
  faqText.slice(0, 200),
);
check(
  "faq: sem rastro de envio dos EUA/Reino Unido no texto",
  !/Estados Unidos|USA|Reino Unido|do EUA/.test(faqText),
  faqText.slice(0, 200),
);
await page.goto(`${BASE}/toplist`, { waitUntil: "networkidle" });
const toplist = (await page.locator(".well").innerText()).replace(/\s+/g, " ");
check(
  "toplist: vendors listados com feedback",
  /Ralts/.test(toplist) && /92\.7%/.test(toplist),
  toplist.slice(0, 160),
);
await page.goto(`${BASE}/vendor/1`, { waitUntil: "networkidle" });
const vendorText = (await page.locator(".well").innerText()).replace(/\s+/g, " ");
check(
  "vendor: detalhes do Ralts (rank/desde/feedbacks)",
  /Ativo desde/.test(vendorText) && /2013-10-01/.test(vendorText),
  vendorText.slice(0, 200),
);

// ------------------------------------------------------- 8. CATEGORIA
await page.goto(`${BASE}/cat/6`, { waitUntil: "networkidle" });
const catText = (await page.locator(".span9 .well").innerText()).replace(/\s+/g, " ");
check(
  "categoria: Stacks completos lista o produto do original",
  /Stacks completos/.test(catText) && /Testosterona Cipionato/.test(catText),
  catText.slice(0, 160),
);
await page.goto(`${BASE}/cat/1`, { waitUntil: "networkidle" });
const emptyCat = (await page.locator(".span9 .well").innerText()).replace(/\s+/g, " ");
check(
  "categoria: vazia mostra 'Nenhum produto encontrado'",
  /Nenhum produto encontrado/.test(emptyCat),
  emptyCat.slice(0, 120),
);

// ------------------------------------------------------- 9. PAGINA ADMIN
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
const adminText = (await page.locator(".well").innerText()).replace(/\s+/g, " ");
check(
  "admin: painel de sincronizacao do catalogo renderiza",
  /Sincronizar catálogo com o banco/.test(adminText),
  adminText.slice(0, 160),
);
const syncBtn = page.locator("button:has-text('Sincronizar catálogo')");
await syncBtn.click();
await page.waitForTimeout(2500);
const syncNotice = (await page.locator(".well").innerText()).replace(/\s+/g, " ");
check(
  "admin: sync responde admin_key_unavailable no runtime local (fallback documentado)",
  /admin_key_unavailable/.test(syncNotice),
  syncNotice.slice(0, 200),
);
await page.screenshot({ path: `${SHOTS}\\06-admin.png`, fullPage: false });

// ------------------------------------------------------- 10. ROTA INEXISTENTE
const resp = await page.goto(`${BASE}/nao-existe`, { waitUntil: "domcontentloaded" });
check("404: rota inexistente responde 404", resp?.status() === 404, String(resp?.status()));

// ------------------------------------------------- 11. SELETOR DE IDIOMA
await page.goto(BASE, { waitUntil: "networkidle" });
const langTrigger = page.locator(".language-trigger");
check(
  "idioma: seletor visivel na navbar (PT-BR)",
  (await langTrigger.innerText()).includes("PT-BR"),
  await langTrigger.innerText(),
);

await langTrigger.click();
const ptOption = await page.locator('.language-menu button:has-text("Português (BR)")').count();
const enOption = await page.locator('.language-menu button:has-text("English")').count();
check(
  "idioma: menu lista PT-BR e English",
  ptOption === 1 && enOption === 1,
  `${ptOption}/${enOption}`,
);

await page.locator('.language-menu button:has-text("English")').click();
await page.waitForTimeout(400);
const navEn = (await page.locator(".topNav").innerText()).replace(/\s+/g, " ").trim();
check(
  "idioma: site muda para ingles",
  /Home/.test(navEn) && /Support/.test(navEn) && /Cart/.test(navEn),
  navEn.slice(0, 160),
);

await page.goto(`${BASE}/product/145`, { waitUntil: "networkidle" });
const titleEn = await page.locator(".span7 h2").innerText();
check("idioma: pagina de produto em ingles", /Masteron Propionate/.test(titleEn), titleEn);
const priceEn = await page.locator(".qtyFrm h4").first().innerText();
check(
  "idioma: preco em real no formato ingles (R$ 148.50)",
  priceEn.replace(/\s+/g, " ").trim() === "Price: R$ 148.50",
  priceEn,
);
const infoEn = await page.locator("#home").innerText();
check("idioma: descricao longa em ingles", /half life/i.test(infoEn), infoEn.slice(0, 120));
await page.screenshot({ path: `${SHOTS}\\07-ingles.png`, fullPage: false });

await page.goto(`${BASE}/faq`, { waitUntil: "networkidle" });
const faqEn = (await page.locator(".span12").innerText()).replace(/\s+/g, " ");
check(
  "idioma: FAQ em ingles com envio do Brasil e preco em real",
  /shipped from Brazil/.test(faqEn) && /R\$ 27\.50/.test(faqEn),
  faqEn.slice(0, 160),
);

await page.reload({ waitUntil: "networkidle" });
const navEnReload = (await page.locator(".topNav").innerText()).replace(/\s+/g, " ").trim();
check(
  "idioma: escolha persiste apos reload (localStorage)",
  /Home/.test(navEnReload),
  navEnReload.slice(0, 120),
);

await page.locator(".language-trigger").click();
await page.locator('.language-menu button:has-text("Português (BR)")').click();
await page.waitForTimeout(400);
const navPt = (await page.locator(".topNav").innerText()).replace(/\s+/g, " ").trim();
check(
  "idioma: volta para portugues",
  /Início/.test(navPt) && /Suporte/.test(navPt),
  navPt.slice(0, 120),
);

// ------------------------------------------------------- RELATORIO
const report = {
  base: BASE,
  email,
  password,
  total: results.length,
  failures,
  results,
  consoleErrors,
  failedRequests: [...new Set(failedRequests)],
};
writeFileSync(`${SHOTS}\\e2e-report.json`, JSON.stringify(report, null, 2), "utf8");
console.log("\n=== console errors ===");
console.log(consoleErrors.length ? consoleErrors.join("\n") : "(nenhum)");
console.log("\n=== requests >= 400 / falhas ===");
console.log([...new Set(failedRequests)].join("\n") || "(nenhum)");
console.log(`\nRESULTADO: ${results.length - failures}/${results.length} ok, ${failures} falhas`);

await browser.close();
process.exit(failures > 0 ? 1 : 0);
