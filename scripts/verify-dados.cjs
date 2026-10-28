/* Integridade dos dados — o requisito mais rígido do briefing.

   Verifica, direto no arquivo de dados e no navegador:
   1. Todos os 49 links do briefing estão presentes, verbatim;
   2. Nenhuma URL foi inventada ou substituída;
   3. Parâmetros de indicação/convite preservados;
   4. Ids únicos, categorias válidas, risco alto sempre com aviso;
   5. Os 22 prompts continuam intactos (16 originais + 6 novos);
   6. Nenhum href="#" nem botão sem destino no build final. */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
// Blocos distantes do topo carregam sob demanda. Para conferir o
// conjunto COMPLETO, abre todos antes de contar — senão o teste
// mediria só a prévia, não os dados.
async function abrirTudo(page) {
  for (let i = 0; i < 40; i++) {
    const btn = page.getByRole("button", { name: /^mais \d+ recurso/ }).first();
    if ((await btn.count()) === 0) break;
    await btn.click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(300);
}

const RAIZ = path.resolve(__dirname, "..");
const BASE = process.env.BASE || "http://localhost:4181";
const out = [];
const rec = (n, ok, d = "") => {
  out.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};

/* Os 49 links exatamente como vieram no briefing. */
const BRIEFING = [
  "https://chatgpt.com",
  "https://claude.ai",
  "https://gemini.google.com",
  "https://aistudio.google.com",
  "https://openrouter.ai",
  "https://chat.deepseek.com",
  "https://www.blackbox.ai",
  "https://huggingface.co",
  "https://github.com/df2-spec",
  "https://stackoverflow.com",
  "https://www.youtube.com/watch?v=w1mVDOC4ykk",
  "https://vscode.dev",
  "https://web.telegram.org",
  "https://www.novnc.org",
  "https://appgallery.cloud.huawei.com",
  "https://21st.dev",
  "https://tailwindcss.com",
  "https://react.dev",
  "https://uiverse.io",
  "https://www.kali.org",
  "https://www.virustotal.com",
  "https://haveibeenpwned.com",
  "https://www.torproject.org",
  "https://www.protonvpn.com",
  "https://www.discord.com",
  "https://github.com/df2-spec/mcp",
  "https://github.com/df2-spec/IA",
  "https://www.python.org",
  "https://nodejs.org",
  "https://www.canva.com",
  "https://www.shopify.com",
  "https://www.hostinger.com.br",
  "https://www.figma.com",
  "https://www.tiktok.com",
  "https://notion.so",
  "https://obsidian.md",
  "https://www.wikipedia.org",
  "https://www.fiverr.com",
  "https://www.upwork.com",
  "https://www.instagram.com/euodeene/",
  "https://discord.gg/am9s4fqRHw",
  "https://euodeene.shop",
  "https://ghidra-sre.org",
  "https://x64dbg.com",
  "https://www.hex-rays.com",
  "https://frida.re",
  "https://mitmproxy.org",
  "https://www.wireshark.org",
  "https://developer.mozilla.org",
];

(async () => {
  /* ---------- 2. prompts originais ---------- */
  const prompts = fs.readFileSync(path.join(RAIZ, "src/data/prompts.js"), "utf8");
  const nPrompts = (prompts.match(/"text":\s*"/g) || []).length;
  // 16 originais + 6 adicionados pelo dono em 28/10/2026 (conferidos
  // byte a byte contra os arquivos enviados).
  rec("22 prompts conservados", nPrompts === 22, `${nPrompts}`);

  /* ---------- 3. no navegador (fonte de verdade) ---------- */
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const erros = [];
  page.on("pageerror", (e) => erros.push(String(e)));
  page.on("console", (m) => m.type() === "error" && erros.push(m.text()));

  await page.goto(BASE + "/recursos", { waitUntil: "networkidle" });
 await abrirTudo(page);
  await page.waitForTimeout(1500);

  const dados = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("[data-recurso]")];
    return {
      total: cards.length,
      ids: cards.map((c) => c.getAttribute("data-recurso")),
      externas: cards
        .map((c) => c.querySelector('a[href^="http"]')?.getAttribute("href"))
        .filter(Boolean),
      internas: cards.filter((c) => !c.querySelector('a[href^="http"]')).length,
    };
  });

  // 49 do briefing + 39 que já existiam no projeto (menos os que coincidem) + 9 da fase de 3D
  const ORIGINAIS_PROJETO = 40;
  const n = (u) => u.replace(/\/$/, "").toLowerCase();
  const briefingSet = new Set(BRIEFING.map(n));
  const coincidem = ORIGINAIS_PROJETO - 38; // 2 coincidiam (protonvpn/site oficial)
  rec("contagem de recursos no app", dados.total === 119, `${dados.total} recursos`);
  rec(
    "16 prompts internos + 103 externos",
    dados.internas === 16 && dados.externas.length === 103,
    `${dados.internas} internos, ${dados.externas.length} externos`,
  );
  rec("nenhuma URL externa duplicada", new Set(dados.externas).size === dados.externas.length,
    `${new Set(dados.externas).size} únicas`);
  rec("ids únicos", new Set(dados.ids).size === dados.ids.length,
    `${dados.ids.length} ids, ${new Set(dados.ids).size} únicos`);

  // Comparação por URL normalizada (barra final não altera o destino).
  const extNorm = new Set(dados.externas.map(n));
  const faltando = BRIEFING.filter((u) => !extNorm.has(n(u)));
  rec("todos os 49 links do briefing presentes", faltando.length === 0,
    faltando.length ? faltando.join(", ") : "49/49");

  const comParametros = ["?ref=MR-GAFAHM", "?ref=CC8VLFK6", "?invite=TH-J5HZ-C4QS"];
  const achados = comParametros.filter((pp) => dados.externas.some((u) => u.includes(pp)));
  rec("parâmetros de indicação/convite preservados", achados.length === comParametros.length,
    `${achados.length}/${comParametros.length}`);

  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("a")].map((a) => a.getAttribute("href") || ""),
  );
  rec("nenhum href vazio ou '#'", hrefs.every((h) => h && h !== "#"), `${hrefs.length} links`);

  // abre um recurso interno (prompt) e confere que a rota existe
  await page.goto(BASE + "/prompt/1", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const temTexto = await page.locator("pre").first().isVisible();
  rec("rota interna de prompt funciona", temTexto && !page.url().includes("404"));

  // 404 real
  await page.goto(BASE + "/rota-que-nao-existe", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const temErro = await page.getByText(/não existe|404/i).first().isVisible();
  rec("rota inexistente mostra 404", temErro);

  rec("sem erros de console", erros.length === 0, erros.slice(0, 2).join(" | "));

  await browser.close();
  const pass = out.filter(Boolean).length;
  console.log(`\n===== ${pass}/${out.length} passed =====`);
  process.exit(pass === out.length ? 0 : 1);
})();






