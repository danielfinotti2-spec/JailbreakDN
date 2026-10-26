import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { CATS, SIZES } from "@/data";

const GROUPS = [["Categoria", CATS], ["Tamanho", SIZES]];

export default function Filters({ sel, setSel, close }) {
  const [open, setOpen] = useState({ Categoria: true, Tamanho: false });
  const [cur, setCur] = useState(0);
  const ref = useRef();
  const flat = GROUPS.flatMap(([g, o]) => (open[g] ? o.map((v) => [g, v]) : []));
  const tog = (g, v) => setSel((s) => { const a = s[g] || []; return { ...s, [g]: a.includes(v) ? a.filter((x) => x !== v) : [...a, v] }; });
  const chips = GROUPS.flatMap(([g]) => (sel[g] || []).map((v) => [g, v]));
  useEffect(() => ref.current?.focus(), []);

  const key = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCur((c) => (c + 1) % flat.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCur((c) => (c - 1 + flat.length) % flat.length); }
    else if (e.key === "Enter" && flat[cur]) { e.preventDefault(); tog(...flat[cur]); }
    else if (e.key === "Escape") close();
  };

  return (
    <div className="pop" tabIndex={-1} ref={ref} onKeyDown={key}>
      <div className="in">
        <h4>Filtros <button onClick={() => setSel({})}>Limpar tudo</button></h4>
        <div className="chips">
          {chips.map(([g, v]) => (
            <span className="chip" key={g + v}>{v}
              <button aria-label={`Remover ${v}`} onClick={() => tog(g, v)}><Icon n="x" s={12} /></button>
            </span>
          ))}
        </div>
        {GROUPS.map(([g, o]) => (
          <div className={`grp${open[g] ? " o" : ""}`} key={g}>
            <button onClick={() => setOpen((s) => ({ ...s, [g]: !s[g] }))}>
              <Icon n="chev" s={14} />{g}<small>{(sel[g] || []).length} filtro{(sel[g] || []).length === 1 ? "" : "s"}</small>
            </button>
            {open[g] && o.map((v) => {
              const on = (sel[g] || []).includes(v);
              const c = flat.findIndex((f) => f[0] === g && f[1] === v) === cur;
              return (
                <div key={v} className={`opt${on ? " on" : ""}${c ? " cur" : ""}`} onClick={() => tog(g, v)}>
                  <span className="cb"><Icon n="ok" s={14} /></span>{v}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="keys"><span><kbd>↓</kbd><kbd>↑</kbd>navegar</span><span><kbd>↵</kbd>selecionar</span></div>
    </div>
  );
}
