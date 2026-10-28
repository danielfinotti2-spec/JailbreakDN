const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ channel: "chrome" });
  const out = [];
  const rec = (n, ok, d = "") => { out.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`); };

  // Desktop layout metrics
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:5180/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);

  const hero = await p.evaluate(() => {
    const h1 = document.querySelector("h1");
    const r = h1.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(h1).fontSize);
    const cv = document.querySelector("canvas");
    const cr = cv ? cv.getBoundingClientRect() : null;
    return { h1Size: Math.round(fs), h1Top: Math.round(r.top), h1W: Math.round(r.width), canvas: cr ? { w: Math.round(cr.width), h: Math.round(cr.height) } : null };
  });
  rec("h1 com escala display (>=48px)", hero.h1Size >= 48, `${hero.h1Size}px`);
  rec("hero visível no topo", hero.h1Top < 300, `top=${hero.h1Top}`);
  rec("canvas 3D com tamanho real", hero.canvas && hero.canvas.w > 300 && hero.canvas.h > 300, JSON.stringify(hero.canvas));

  const player = await p.evaluate(() => {
    const el = document.querySelector("#apresentacao > div");
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ratio: +(r.width / r.height).toFixed(2) };
  });
  rec("player 16:9", Math.abs(player.ratio - 1.78) < 0.05, JSON.stringify(player));

  const nav = await p.evaluate(() => {
    const n = document.querySelector('nav[aria-label="Navegação principal"] > div');
    const r = n.getBoundingClientRect();
    const cs = getComputedStyle(n);
    return { pos: cs.position, bottom: Math.round(window.innerHeight - r.bottom), radius: cs.borderRadius, blur: cs.backdropFilter };
  });
  rec("nav flutuante posicionada", nav.pos === "static" && nav.bottom < 40 && nav.bottom >= 0, JSON.stringify(nav));
  rec("nav com cantos arredondados", parseFloat(nav.radius) > 20, nav.radius);
  rec("nav com fundo translúcido", /blur/.test(nav.blur), nav.blur);

  // theme colors actually differ (wait out the 220ms colour transition)
  await p.evaluate(() => { document.documentElement.dataset.theme = "light"; });
  await p.waitForTimeout(600);
  const light = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await p.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  await p.waitForTimeout(600);
  const dark = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  rec("temas têm cores distintas", light !== dark, `${light} vs ${dark}`);
  await p.evaluate(() => { document.documentElement.dataset.theme = "light"; });
  await p.waitForTimeout(400);

  // Mobile: nav visible, cards stack
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto("http://localhost:5180/", { waitUntil: "networkidle" });
  await m.waitForTimeout(2500);
  const mob = await m.evaluate(() => {
    const n = document.querySelector('nav[aria-label="Navegação principal"]');
    const r = n ? n.getBoundingClientRect() : null;
    const cards = [...document.querySelectorAll("#recursos article")].slice(0, 2).map((c) => Math.round(c.getBoundingClientRect().width));
    return { navVisible: r ? r.width > 0 && r.bottom <= window.innerHeight + 1 : false, cardWidths: cards, cols: document.documentElement.scrollWidth };
  });
  rec("nav visível no mobile", mob.navVisible);
  rec("cards empilhados no mobile", mob.cardWidths.length === 2 && Math.abs(mob.cardWidths[0] - mob.cardWidths[1]) < 2, JSON.stringify(mob.cardWidths));
  rec("sem scroll horizontal no mobile", mob.cols <= 391, `${mob.cols}px`);

  const pass = out.filter(Boolean).length;
  console.log(`\n===== ${pass}/${out.length} passed =====`);
  await b.close();
  process.exit(pass === out.length ? 0 : 1);
})();

