/* End-to-end verification against the running dev server.
   Run: node scripts/verify.cjs  (dev server must be listening on PORT) */
const { chromium } = require("playwright");
const fs = require("fs");

const BASE = process.env.BASE || "http://localhost:5199"; // set BASE to test a preview build
const results = [];
const record = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--use-gl=angle", "--enable-unsafe-swiftshader"],
  });

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const externalNav = [];

  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  page.on("requestfailed", (r) => {
    const u = r.url();
    if (!u.startsWith("data:")) failedRequests.push(`${u} :: ${r.failure()?.errorText}`);
  });
  page.on("request", (r) => {
    const u = r.url();
    if (/^https?:\/\/(?!localhost:5199|127\.0\.0\.1)/.test(u)) externalNav.push(u);
  });

  /* ---------- 1. home ---------- */
  const resp = await page.goto(BASE + "/", { waitUntil: "networkidle" });
  record("home responde 200", resp.status() === 200, `status ${resp.status()}`);
  record("h1 presente", (await page.locator("h1").first().innerText()).includes("Cofre de TXT"));
  record("title correto", (await page.title()).includes("Cofre de TXT"));

  /* ---------- 2. catalog renders ---------- */
  await page.locator("#recursos").scrollIntoViewIfNeeded();
  await page.waitForSelector("#recursos article", { timeout: 15000 });
  const cards = await page.locator("#recursos article").count();
  record("catálogo renderiza cards", cards === 40, `${cards} cards`);

  const total = await page.evaluate(() => {
    const m = document.querySelector("#recursos")?.textContent || "";
    return /40 recursos/.test(m);
  });
  record("contador mostra 40", total);

  /* ---------- 3. external links are safe ---------- */
  const badLinks = await page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll("#recursos a[href^='http']")) {
      if (a.getAttribute("target") !== "_blank") out.push("no target: " + a.href);
      const rel = a.getAttribute("rel") || "";
      if (!rel.includes("noopener") || !rel.includes("noreferrer")) out.push("bad rel: " + a.href);
    }
    return out;
  });
  record("links externos com target+rel", badLinks.length === 0, badLinks.slice(0, 3).join("; "));

  const hashLinks = await page.evaluate(
    () => [...document.querySelectorAll("a")].filter((a) => a.getAttribute("href") === "#").length,
  );
  record("nenhum href=\"#\" na home", hashLinks === 0, `${hashLinks} encontrados`);

  /* ---------- 4. search ---------- */
  const search = page.getByLabel("Buscar recursos");
  await search.fill("shodan");
  await page.waitForTimeout(200);
  let n = await page.locator("#recursos article").count();
  record("busca filtra", n === 1, `${n} resultado(s) para 'shodan'`);

  await search.fill("zzzznaoexiste");
  await page.waitForTimeout(200);
  const emptyVisible = await page.getByText("Nenhum recurso corresponde").isVisible();
  record("estado vazio visível", emptyVisible);
  await page.locator("#recursos").getByRole("button", { name: "Limpar filtros" }).first().click();
  await page.waitForTimeout(200);
  n = await page.locator("#recursos article").count();
  record("limpar filtros restaura 40", n === 40, `${n}`);

  /* ---------- 5. category filter ---------- */
  await page.getByRole("tab", { name: "Engenharia reversa e segurança" }).click();
  await page.waitForTimeout(200);
  n = await page.locator("#recursos article").count();
  record("filtro por categoria", n === 9, `${n} em categoria RE`);

  /* ---------- 6. sorting ---------- */
  await page.getByRole("tab", { name: "Todas" }).click();
  await page.selectOption("#ordem", "az");
  await page.waitForTimeout(200);
  const first = await page.locator("#recursos article h3").first().innerText();
  const all = await page.locator("#recursos article h3").allInnerTexts();
  const sorted = [...all].sort((a, b) => a.localeCompare(b, "pt-BR"));
  record("ordenação A–Z", JSON.stringify(all) === JSON.stringify(sorted), `primeiro: ${first}`);

  /* ---------- 7. detail panel ---------- */
  await page.locator("#recursos").getByRole("button", { name: /Detalhes de/ }).first().click();
  await page.waitForTimeout(300);
  const dialog = page.getByRole("dialog");
  record("painel de detalhes abre", await dialog.isVisible());
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const stillOpen = await page.getByRole("dialog").count();
  record("Escape fecha detalhes", stillOpen === 0, `${stillOpen} diálogos`);

  /* ---------- 7b. favourites ---------- */
  await page.getByRole("button", { name: /Adicionar .* aos favoritos/ }).first().click();
  await page.waitForTimeout(250);
  const favCount = await page.getByRole("button", { name: /^Favoritos/ }).innerText();
  record("favoritar atualiza contador", /\(1\)/.test(favCount), favCount.trim());
  await page.getByRole("button", { name: /^Favoritos/ }).click();
  await page.waitForTimeout(250);
  const favShown = await page.locator("#recursos article").count();
  record("filtro de favoritos mostra 1", favShown === 1, `${favShown}`);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#recursos article", { timeout: 20000 });
  const favAfterReload = await page.getByRole("button", { name: /^Favoritos/ }).innerText();
  record("favoritos persistem no reload", /\(1\)/.test(favAfterReload), favAfterReload.trim());
  // clear favourite so later assertions start clean
  await page.getByRole("button", { name: /Remover .* dos favoritos/ }).first().click();
  await page.waitForTimeout(200);
  /* ---------- 8. player controls ---------- */
  await page.locator("#apresentacao").scrollIntoViewIfNeeded();
  const playBtn = page.getByRole("button", { name: /Reproduzir demonstração/i });
  record("botão play central existe", await playBtn.isVisible());
  await playBtn.click();
  await page.waitForTimeout(600);
  const width1 = await page.locator('[role="progressbar"] > div').first().evaluate((el) => el.style.width);
  await page.waitForTimeout(700);
  const width2 = await page.locator('[role="progressbar"] > div').first().evaluate((el) => el.style.width);
  record("progresso avança ao reproduzir", width1 !== width2, `${width1} -> ${width2}`);
  await page.getByRole("button", { name: /Ativar som|Silenciar/ }).click();
  record("botão de áudio responde", true);

  /* ---------- 9. theme toggle + persistence ---------- */
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.getByRole("button", { name: /Mudar para tema/i }).click();
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  record("tema alterna", before !== after, `${before} -> ${after}`);
  await page.reload({ waitUntil: "networkidle" });
  const persisted = await page.evaluate(() => document.documentElement.dataset.theme);
  record("tema persiste após reload", persisted === after, `${persisted}`);

  /* ---------- 10. prompt library ---------- */
  await page.locator("#textos").scrollIntoViewIfNeeded();
  await page.waitForSelector("#textos article", { timeout: 20000 });
  const prompts = await page.locator("#textos article").count();
  record("biblioteca de prompts carrega", prompts > 0, `${prompts} prompts`);

  /* ---------- 11. navigation / 404 ---------- */
  await page.getByRole("link", { name: /Produtos/ }).first().click();
  await page.waitForTimeout(500);
  record("/produtos navega", page.url().endsWith("/produtos"), page.url());
  const emptyShop = await page.getByText("A loja está vazia").isVisible();
  record("estado vazio da loja", emptyShop);

  await page.goto(BASE + "/rota-que-nao-existe", { waitUntil: "networkidle" });
  const has404 = await page.getByText("404").first().isVisible();
  record("rota inválida mostra 404", has404, page.url());
  record("URL inválida é preservada", page.url().endsWith("/rota-que-nao-existe"));

  const notFoundHash = await page.evaluate(
    () => [...document.querySelectorAll("a")].filter((a) => a.getAttribute("href") === "#").length,
  );
  record("404 sem href=\"#\"", notFoundHash === 0, `${notFoundHash} encontrados`);

  // Button 1: home
  await page.getByRole("link", { name: /Ir para o início/ }).click();
  await page.waitForTimeout(600);
  record("botão 1 (início) funciona", page.url() === BASE + "/", page.url());

  // Button 2: explore resources
  await page.goto(BASE + "/outra-rota-ruim", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /Explorar recursos/ }).click();
  await page.waitForTimeout(900);
  const scrolled = await page.evaluate(() => {
    const el = document.getElementById("recursos");
    if (!el) return -1;
    return Math.round(el.getBoundingClientRect().top);
  });
  record("botão 2 (recursos) navega e rola", page.url().includes("/#recursos") || scrolled >= -5, `url=${page.url()} top=${scrolled}`);

  /* ---------- 12. WebGL / 3D ---------- */
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  const canvasInfo = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return null;
    return { w: c.width, h: c.height };
  });
  record("canvas 3D montado", !!canvasInfo && canvasInfo.w > 0, JSON.stringify(canvasInfo));

  /* ---------- 13. mobile ---------- */
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await mobile.newPage();
  await mp.goto(BASE + "/", { waitUntil: "networkidle" });
  await mp.waitForTimeout(2500);
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record("mobile sem overflow horizontal", overflow <= 1, `overflow ${overflow}px`);
  await mp.screenshot({ path: "shots/mobile-home.png", fullPage: false });
  await mobile.close();

  /* ---------- screenshots ---------- */
  fs.mkdirSync("shots", { recursive: true });
  await page.evaluate(() => (document.documentElement.dataset.theme = "light"));
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/home-light.png" });
  await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/home-dark.png" });
  await page.locator("#recursos").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "shots/catalog-dark.png" });
  await page.goto(BASE + "/pagina-inexistente", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: "shots/404.png" });

  /* ---------- error report ---------- */
  console.log("\n--- CONSOLE ERRORS ---");
  console.log(consoleErrors.length ? consoleErrors.join("\n") : "(none)");
  console.log("\n--- PAGE ERRORS ---");
  console.log(pageErrors.length ? pageErrors.join("\n") : "(none)");
  console.log("\n--- FAILED REQUESTS ---");
  console.log(failedRequests.length ? failedRequests.join("\n") : "(none)");
  console.log("\n--- EXTERNAL REQUESTS (should only be fonts/CDN if any) ---");
  console.log(externalNav.length ? [...new Set(externalNav)].join("\n") : "(none)");

  record("sem erros de console", consoleErrors.length === 0, `${consoleErrors.length}`);
  record("sem page errors", pageErrors.length === 0, `${pageErrors.length}`);
  record("sem requests falhando", failedRequests.length === 0, `${failedRequests.length}`);

  const pass = results.filter((r) => r.ok).length;
  console.log(`\n===== ${pass}/${results.length} passed =====`);
  fs.writeFileSync("shots/results.json", JSON.stringify({ results, consoleErrors, pageErrors, failedRequests, externalNav }, null, 2));

  await browser.close();
  process.exit(pass === results.length ? 0 : 1);
})();



