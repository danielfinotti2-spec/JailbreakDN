import { useEffect, useMemo, useState } from "react";
import Icon from "./components/Icon";
import Filters from "./components/Filters";
import Reactions from "./components/Reactions";
import Profile from "./components/Profile";
import Faq from "./components/Faq";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { DUCK, TEXTS, SORTS } from "./data";
import { sizeOf } from "./lib/utils";

const ORDER = {
  "Mais recentes": (p, q) => q.at - p.at,
  "Mais antigos": (p, q) => p.at - q.at,
  "A–Z": (p, q) => p.title.localeCompare(q.title),
  "Mais curtidos": (p, q) => q.likes - p.likes,
};

export default function App() {
  const [items, setItems] = useState(TEXTS);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState({});
  const [sort, setSort] = useState(SORTS[0]);
  const [view, setView] = useState("list");
  const [fo, setFo] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 1800); return () => clearTimeout(t); }, [toast]);

  const upd = (id, f) => setItems((a) => a.map((x) => (x.id === id ? { ...x, ...f(x) } : x)));

  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    const a = items.filter((x) =>
      (!k || `${x.title} ${x.text} ${x.cat}`.toLowerCase().includes(k)) &&
      (!(sel.Categoria || []).length || sel.Categoria.includes(x.cat)) &&
      (!(sel.Tamanho || []).length || sel.Tamanho.includes(sizeOf(x.text))));
    return a.sort(ORDER[sort]);
  }, [items, q, sel, sort]);

  const nf = Object.values(sel).reduce((s, a) => s + a.length, 0);

  const copy = (it) => {
    const done = () => { upd(it.id, (x) => ({ uses: x.uses + 1 })); setToast("Copiado!"); };
    try { navigator.clipboard.writeText(it.text).then(done, () => setToast("Não deu pra copiar")); } catch { setToast("Não deu pra copiar"); }
  };
  const dl = (it) => {
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([it.text], { type: "text/plain" }));
      a.download = it.filename || (it.title.replace(/[^\w\- ]/g, "") + ".txt");
      a.click();
      setToast("Baixando .txt");
    } catch { setToast("Download indisponível aqui"); }
  };
  const open = (it) => { upd(it.id, (x) => ({ views: x.views + 1 })); setModal({ view: it.id }); };
  const cur = modal?.view && items.find((x) => x.id === modal.view);

  return (
    <>
      <div className="wrap container">
        <Hero />

        <div className="head" id="textos"><div><h2>Biblioteca de prompts</h2><p>{items.length} arquivos · filtre por modelo, pesquise e baixe um por vez.</p></div></div>

        <div className="bar">
          <div className="search">
            <Icon n="search" s={16} />
            <input placeholder="Buscar textos…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
            {q && <button onClick={() => setQ("")} aria-label="Limpar"><Icon n="x" s={16} /></button>}
          </div>
          <button className="pill" onClick={() => setFo(!fo)}><Icon n="filter" s={15} />Filtros{nf ? <em>{nf}</em> : null}</button>
          <label className="pill">
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">{SORTS.map((s) => <option key={s}>{s}</option>)}</select>
            <Icon n="chev" s={14} />
          </label>
          <div className="tog">{["list", "grid"].map((v) => <button key={v} className={view === v ? "on" : ""} onClick={() => setView(v)} aria-label={v}><Icon n={v} s={16} /></button>)}</div>
          {fo && <Filters sel={sel} setSel={setSel} close={() => setFo(false)} />}
        </div>

        <div className={`list ${view}`}>
          {shown.map((it, i) => (
            <article className="item" key={it.id} style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}>
              <button className={`corner${it.liked ? " liked" : ""}`} onClick={() => upd(it.id, (x) => ({ liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }))} aria-label="Curtir" aria-pressed={it.liked}><Icon n="heart" s={15} />{it.likes}</button>
              <h3 onClick={() => open(it)}>{it.title}</h3>
              <div className="meta"><span className="tag">{it.cat}</span>{sizeOf(it.text)} · {new Date(it.at).toLocaleDateString("pt-BR")}</div>
              <pre>{it.text.length > 520 ? `${it.text.slice(0, 520)}\n\n… conteúdo completo disponível ao abrir o arquivo` : it.text}</pre>
              <Reactions it={it} onOpen={() => open(it)} onUse={() => copy(it)} onSend={() => dl(it)} />
            </article>
          ))}
        </div>
        {!shown.length && <div className="empty"><img src={DUCK} alt="" /><p>Nada encontrado{q ? ` para “${q}”` : ""}.</p></div>}

        <Profile />
        <Faq />
        <Footer />

        {cur && (
          <div className="vmodal" onClick={() => setModal(null)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="meta"><span className="tag">{cur.cat}</span></div>
              <h3 className="m-0">{cur.title}</h3>
              <pre className="mono">{cur.text}</pre>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-vault" onClick={() => copy(cur)}>Copiar</button>
                <button className="btn btn-vault ghost" onClick={() => dl(cur)}>Baixar .txt</button>
                <button className="btn btn-vault ghost" onClick={() => setModal(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div className="toast-v" role="status">{toast}</div>}
      </div>
    </>
  );
}
