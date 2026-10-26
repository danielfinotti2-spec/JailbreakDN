import { useState } from "react";
import Icon from "./Icon";
import { DUCK, ME } from "@/data";
import { PRODUCTS } from "@/products";
import { navigate, onNav } from "@/lib/nav";

const brl = (n) => (n > 0 ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Grátis");

function Stars({ v }) {
  return (
    <span className="stars" aria-label={`Nota ${v}`}>
      {[1, 2, 3, 4, 5].map((i) => <i key={i} className={v >= i - 0.5 ? "on" : ""}>★</i>)}
      <b>{v.toFixed(1)}</b>
    </span>
  );
}

function Topbar() {
  return (
    <div className="foot-top shop-top">
      <a className="foot-logo" href="/" onClick={(e) => onNav(e, "/")}>{ME.name}</a>
      <nav className="foot-nav" aria-label="Principal">
        <a href="/" onClick={(e) => onNav(e, "#textos")}>Textos</a>
        <a href="/produtos" onClick={(e) => onNav(e, "/produtos")}>Produtos</a>
      </nav>
    </div>
  );
}

function List() {
  return (
    <>
      <div className="head"><div><h2>Produtos</h2><p>Prompts premium. Clique para ver os detalhes.</p></div></div>
      <div className="plist">
        {PRODUCTS.map((p) => (
          <a key={p.slug} className="pl-card" href={`/produtos/${p.slug}`} target="_blank" rel="noreferrer">
            <span className="pl-img"><img src={DUCK} alt="" /></span>
            <b>{p.title}</b>
            <span className="pl-price">{brl(p.price)}</span>
          </a>
        ))}
      </div>
    </>
  );
}

function Detail({ p, toast }) {
  const [fav, setFav] = useState(false);
  const [more, setMore] = useState(false);
  const others = PRODUCTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const share = () => {
    try { navigator.clipboard.writeText(location.href).then(() => toast("Link copiado!"), () => toast("Não deu pra copiar")); } catch { toast("Não deu pra copiar"); }
  };
  return (
    <section className="shop">
      <nav className="crumbs" aria-label="Caminho">
        <a href="/produtos" onClick={(e) => onNav(e, "/produtos")}>Produtos</a><Icon n="r" s={12} /><b>{p.title}</b>
      </nav>

      <div className="pgrid">
        <div className="pcol">
          <div className="pphoto"><img src={DUCK} alt={p.title} /></div>
        </div>

        <div className="pinfo">
          <div className="pact">
            <button className={fav ? "on" : ""} onClick={() => setFav(!fav)} aria-label="Favoritar"><Icon n="heart" s={20} /></button>
            <button onClick={share} aria-label="Compartilhar"><Icon n="send" s={20} /></button>
          </div>
          <h2>{p.title}</h2>
          <div className="pprice"><strong>{brl(p.price)}</strong><span>Arquivo digital · entrega por download</span></div>
          <div className="pbtns">
            <a className="pbtn dark" href={p.buy} target="_blank" rel="noreferrer">Comprar agora</a>
            <a className="pbtn line" href={ME.links[2][1]} target="_blank" rel="noreferrer">Falar com o vendedor</a>
          </div>
          {!!p.tags?.length && <div className="ptags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>}
          <p className={`pdesc${more ? " all" : ""}`}>{p.desc}</p>
          {!more && p.desc?.length > 160 && <button className="plink" onClick={() => setMore(true)}>Ler mais</button>}
          {p.preview && <pre className="ppre">{p.preview}</pre>}
          <div className="pseller">
            <span className="av"><img src={DUCK} alt="" /></span>
            <div><b>{ME.name}</b>{p.rating ? <Stars v={p.rating} /> : null}</div>
            <a href="/produtos" onClick={(e) => onNav(e, "/produtos")}>Todos os produtos →</a>
          </div>
        </div>
      </div>

      {!!others.length && (
        <>
          <h3 className="palso">Você também pode gostar</h3>
          <div className="pcards">
            {others.map((x) => (
              <a key={x.slug} className="pcard-s" href={`/produtos/${x.slug}`} onClick={(e) => onNav(e, `/produtos/${x.slug}`)}>
                <span className="pcimg"><img src={DUCK} alt="" /></span>
                <b>{x.title}</b>
                <span>{brl(x.price)}</span>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default function Shop({ path }) {
  const [toast, setToast] = useState("");
  const slug = path.split("/")[2];
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (slug && !p) setTimeout(() => navigate("/produtos"), 0);
  return (
    <div className="wrap container">
      <Topbar />
      {p ? <Detail key={p.slug} p={p} toast={(m) => { setToast(m); setTimeout(() => setToast(""), 1800); }} /> : <List />}
      {toast && <div className="toast-v" role="status">{toast}</div>}
    </div>
  );
}
