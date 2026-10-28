const { chromium } = require("playwright");
(async () => {
  const out = [];
  const rec = (n, ok, d = "") => { out.push({ n, ok, d }); console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`); };

  /* ---- 1. WebGL disabled -> static image fallback ---- */
  {
    const b = await chromium.launch({ channel: "chrome", args: ["--disable-3d-apis", "--disable-webgl"] });
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
    await p.waitForTimeout(2500);
    const canvas = await p.evaluate(() => document.querySelectorAll("canvas").length);
    const img = await p.evaluate(() => {
      const el = document.querySelector('[role="img"][aria-label="Pato mascote"]');
      return el ? { found: true, hasImg: !!el.querySelector("img") } : { found: false };
    });
    const contentOk = await p.evaluate(() => document.body.innerText.includes("Recursos externos"));
    rec("WebGL off -> canvas ausente", canvas === 0, `canvas=${canvas}`);
    rec("WebGL off -> fallback de imagem", img.found && img.hasImg, JSON.stringify(img));
    rec("WebGL off -> resto da página funciona", contentOk);
    rec("WebGL off -> sem erros", errs.length === 0, errs.slice(0, 2).join(" | "));
    await b.close();
  }

  /* ---- 2. prefers-reduced-motion ---- */
  {
    const b = await chromium.launch({ channel: "chrome" });
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
    await p.waitForTimeout(2000);
    const scrollBehavior = await p.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    rec("reduced-motion desliga scroll suave", scrollBehavior === "auto", scrollBehavior);
    const anim = await p.evaluate(() => {
      const el = document.querySelector(".reveal-in");
      return el ? getComputedStyle(el).animationDuration : "n/a";
    });
    rec("reduced-motion encurta animações", anim === "n/a" || parseFloat(anim) < 0.001, anim);
    await b.close();
  }

  /* ---- 3. keyboard focus visibility on home ---- */
  {
    const b = await chromium.launch({ channel: "chrome" });
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    await p.goto("http://localhost:5199/", { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    await p.keyboard.press("Tab");
    const focused = await p.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      return { tag: el.tagName, text: (el.innerText || el.getAttribute("aria-label") || "").slice(0, 40), outline: cs.outlineWidth };
    });
    rec("Tab move o foco", focused.tag !== "BODY", JSON.stringify(focused));
    rec("foco tem contorno visível", focused.outline !== "0px", focused.outline);
    await b.close();
  }

  /* ---- 4. direct load of deep 404 route (SSR-less refresh) ---- */
  {
    const b = await chromium.launch({ channel: "chrome" });
    const p = await b.newPage();
    const r = await p.goto("http://localhost:5199/qualquer/coisa/aqui", { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    const shows404 = await p.evaluate(() => document.body.innerText.includes("404"));
    rec("refresh em rota profunda -> 404", shows404 && r.status() === 200, `http ${r.status()}`);
    await b.close();
  }

  const pass = out.filter((r) => r.ok).length;
  console.log(`\n===== ${pass}/${out.length} passed =====`);
  process.exit(pass === out.length ? 0 : 1);
})();

