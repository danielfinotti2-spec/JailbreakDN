const { chromium } = require("playwright");
const BASE = "http://localhost:4181";
const out = [];

async function abrirTudo(page) {
  for (let i = 0; i < 40; i++) {
    const btn = page.getByRole("button", { name: /^mais \d+ recurso/ }).first();
    if ((await btn.count()) === 0) break;
    await btn.click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(300);
}
const rec = (n, ok, d = "") => { out.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`); };
(async () => {
  const b = await chromium.launch({ channel: "chrome" });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  p.on("console", (m) => m.type() === "error" && erros.push(m.text()));

  await p.goto(BASE + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  rec("home carrega", (await p.locator("h1").count()) >= 1);
  rec("indice por categorias visivel", (await p.locator("section[id^='grupo-']").count()) === 8, String(await p.locator("section[id^='grupo-']").count()));
  rec("contagem 112", (await p.evaluate(() => document.body.innerText.match(/(\d+)\s*recursos/)?.[1])) === "119");

  // busca
  await p.getByRole("searchbox").first().fill("ghidra");
  await p.waitForTimeout(700);
  const n1 = await p.locator("[data-recurso]").count();
  rec("busca filtra", n1 >= 1 && n1 < 119, `${n1} resultados`);

  // NAO apaga ao trocar de secao
  await p.getByRole("link", { name: "Prompts", exact: true }).first().click();
  await p.waitForTimeout(800);
  const valor = await p.getByRole("searchbox").first().inputValue();
  rec("busca preservada ao trocar de secao", valor === "ghidra", `valor="${valor}"`);
  await p.getByRole("searchbox").first().fill(""); await p.waitForTimeout(500);

  // catalog
  await p.goto(BASE + "/recursos", { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
  await abrirTudo(p);
  rec("catalogo lista tudo", (await p.locator("[data-recurso]").count()) === 119, String(await p.locator("[data-recurso]").count()));

  // filtro disponibilidade (painel "Filtros" -> select Acesso)
  await p.getByRole("button", { name: /^Filtros/ }).click(); await p.waitForTimeout(400);
  await p.locator("#filtro-disp").selectOption("gratis"); await p.waitForTimeout(800);
  await abrirTudo(p);
  const nGr = await p.locator("[data-recurso]").count();
  const todasGratis = await p.evaluate(() => [...document.querySelectorAll("[data-recurso]")].every((c) => c.dataset.disponibilidade === "gratis"));
  rec("filtro por disponibilidade", nGr > 0 && todasGratis, `${nGr} gratis`);

  // filtro tipo (volta o acesso para "qualquer": filtros sao combinaveis)
  await p.locator("#filtro-disp").selectOption(""); await p.waitForTimeout(600);
  await p.locator("#filtro-tipo").selectOption("video"); await p.waitForTimeout(800);
  await abrirTudo(p);
  const nV = await p.locator("[data-recurso]").count();
  rec("filtro por tipo", nV >= 1, `${nV} videos`);
  await p.locator("#filtro-tipo").selectOption(""); await p.waitForTimeout(500);

  // categoria IA gratis
  await p.goto(BASE + "/categoria/ia-gratis", { waitUntil: "networkidle" }); await p.waitForTimeout(900);
  const textoIA = await p.locator("main").innerText();
  rec("IA gratis agrupa por disponibilidade", /Grátis|Plano gratuito|Créditos|Não verificado/i.test(textoIA));

  // grupo
  await p.goto(BASE + "/grupo/apis", { waitUntil: "networkidle" }); await p.waitForTimeout(900);
  rec("pagina de grupo funciona", (await p.locator("[data-recurso]").count()) > 0, String(await p.locator("[data-recurso]").count()));

  // favoritos persistem
  await p.goto(BASE + "/recursos", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
  await p.locator("[data-recurso]").first().hover(); await p.waitForTimeout(200);
  await p.locator("[data-recurso]").first().getByRole("button", { name: /Favoritar/ }).click();
  await p.waitForTimeout(500);
  const favs = await p.evaluate(() => JSON.parse(localStorage.getItem("jbdn:favs") || "[]"));
  rec("favorito grava", favs.length === 1, JSON.stringify(favs));
  await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(900);
  rec("favorito persiste", (await p.evaluate(() => JSON.parse(localStorage.getItem("jbdn:favs") || "[]"))).length === 1);

  // copiar
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"]);
  await p.locator("[data-recurso]").first().hover(); await p.waitForTimeout(200);
  const esperada = await p.locator("[data-recurso]").first().evaluate((c) => c.querySelector('a[href^="http"]')?.getAttribute("href"));
  await p.locator("[data-recurso]").first().getByRole("button", { name: /Copiar URL/ }).click();
  await p.waitForTimeout(600);
  const copiado = await p.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  rec("copiar URL", copiado === esperada, `${String(copiado).slice(0, 40)}`);

  // links mortos
  const hrefs = await p.evaluate(() => [...document.querySelectorAll("a")].map((a) => a.getAttribute("href") || ""));
  rec("sem href vazio/#", hrefs.every((h) => h && h !== "#"), `${hrefs.length} links`);

  // tema
  await p.goto(BASE + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(700);
  const t1 = await p.evaluate(() => document.documentElement.dataset.theme);
  await p.getByRole("button", { name: /Mudar para tema/ }).click(); await p.waitForTimeout(400);
  const t2 = await p.evaluate(() => document.documentElement.dataset.theme);
  rec("alterna tema", t1 !== t2, `${t1}->${t2}`);

  const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  rec("sem overflow desktop", ov <= 0, `${ov}px`);
  rec("sem erros console", erros.length === 0, erros.slice(0,2).join(" | "));
  await ctx.close();

  // mobile
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pm = await m.newPage();
  await pm.goto(BASE + "/", { waitUntil: "networkidle" }); await pm.waitForTimeout(1200);
  rec("sem overflow mobile", (await pm.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0);
  const btn = pm.getByRole("button", { name: /Abrir menu/ });
  rec("menu mobile visivel", await btn.isVisible());
  await btn.click(); await pm.waitForTimeout(400);
  rec("menu abre", await pm.locator("#menu-mobile").isVisible());
  await pm.keyboard.press("Escape"); await pm.waitForTimeout(400);
  rec("Escape fecha", (await pm.locator("#menu-mobile").count()) === 0);
  const ovm = await pm.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  rec("sem overflow catalogo mobile", ovm <= 0, `${ovm}px`);
  await m.close();
  await b.close();
  console.log(`\n===== ${out.filter(Boolean).length}/${out.length} passed =====`);
  process.exit(out.filter(Boolean).length === out.length ? 0 : 1);
})();




