import { ME, FOOTER } from "@/data";
import { PRODUCTS } from "@/products";
import { onNav, hrefOf } from "@/lib/nav";

export default function Hero() {
  const words = FOOTER.title.split(" ");
  const mid = Math.ceil(words.length / 2);
  return (
    <header className="top">
      <div className="foot-top rise" style={{ "--d": "0ms" }}>
        <a className="foot-logo" href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{ME.name}</a>
        <nav className="foot-nav" aria-label="Principal">
          {FOOTER.nav.filter(([, h]) => h !== "/produtos" || PRODUCTS.length).map(([l, h]) => <a key={l} href={hrefOf(h)} onClick={(e) => onNav(e, h)}>{l}</a>)}
        </nav>
      </div>
      <h1 className="foot-big rise" style={{ "--d": "80ms" }}>
        <span>{words.slice(0, mid).join(" ")}</span>
        <span>{words.slice(mid).join(" ")}</span>
      </h1>
      <p className="foot-txt rise" style={{ "--d": "160ms" }}>{FOOTER.text}</p>
      <div className="foot-cta rise" style={{ "--d": "240ms" }}>
        <a className="fbtn solid" href="/" onClick={(e) => onNav(e, "#textos")}>Ver textos</a>
        <a className="fbtn line" href="/" onClick={(e) => onNav(e, "#sobre")}>Sobre o criador</a>
      </div>
    </header>
  );
}
