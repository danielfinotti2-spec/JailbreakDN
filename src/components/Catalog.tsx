import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Link2, Search, ShieldAlert, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/cn";
import { useFavourites } from "@/hooks/useFavourites";
import {
  CATEGORIAS,
  RESOURCES,
  RISCO_LABEL,
  TIPO_LABEL,
  totalVerificados,
  type CategoriaId,
  type Resource,
  type RiskLevel,
} from "@/data/links";

const RISK_TONE = { none: "neutral", caution: "warn", high: "danger" } as const;
const RISK_ICON = { none: ShieldCheck, caution: TriangleAlert, high: ShieldAlert } as const;

type Ordem = "relevancia" | "az" | "risco";
const RISK_ORDER: Record<RiskLevel, number> = { high: 0, caution: 1, none: 2 };

function ResourceCard({
  r,
  onOpen,
  fav,
  onFav,
}: {
  r: Resource;
  onOpen: (r: Resource) => void;
  fav: boolean;
  onFav: () => void;
}) {
  const RiscoIcon = RISK_ICON[r.risco];
  return (
    <article className="group relative flex min-w-0 flex-col gap-3 rounded-[var(--radius-md)] border border-hairline bg-surface p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-ink">{r.nome}</h3>
          <p className="mt-0.5 truncate text-xs text-ink-3">{r.origem}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onFav}
            aria-pressed={fav}
            aria-label={fav ? `Remover ${r.nome} dos favoritos` : `Adicionar ${r.nome} aos favoritos`}
            className={cn(
              "grid size-7 place-items-center rounded-full border border-hairline transition-colors",
              fav ? "border-transparent bg-danger/10 text-danger" : "text-ink-3 hover:text-ink",
            )}
          >
            <Heart className={cn("size-3.5", fav && "fill-current")} aria-hidden="true" />
          </button>
          <Badge tone={RISK_TONE[r.risco]}>
            <RiscoIcon className="size-3" aria-hidden="true" />
            {RISCO_LABEL[r.risco]}
          </Badge>
        </div>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-ink-2">{r.descricao}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge>{TIPO_LABEL[r.tipo]}</Badge>
        <Badge>{r.subcategoria}</Badge>
        {!r.verificado && <Badge tone="warn">Descrição não verificada</Badge>}
        {r.conta === true && <Badge>Exige conta</Badge>}
      </div>

      {!!r.avisos?.length && (
        <details className="group/av rounded-[var(--radius-xs)] bg-surface-2 px-3 py-2">
          <summary className="cursor-pointer list-none text-xs font-medium text-ink-2 marker:content-none">
            <span className="inline-flex items-center gap-1.5">
              <TriangleAlert className="size-3.5" aria-hidden="true" />
              {r.avisos.length} aviso{r.avisos.length > 1 ? "s" : ""}
            </span>
          </summary>
          <ul className="mt-2 space-y-1.5 border-t border-hairline pt-2">
            {r.avisos.map((a) => (
              <li key={a} className="text-xs leading-relaxed text-ink-2">
                {a}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <a href={r.url} target="_blank" rel="noopener noreferrer">
            <Link2 aria-hidden="true" />
            Abrir fonte
          </a>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onOpen(r)} aria-label={`Detalhes de ${r.nome}`}>
          Detalhes
        </Button>
      </div>
      <span className="pointer-events-none absolute right-4 top-0 -translate-y-full pt-1 text-[10px] font-medium text-ink-3 opacity-0 transition-opacity group-hover:opacity-100">
        fonte externa
      </span>
    </article>
  );
}

function Detail({ r, onClose }: { r: Resource; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);

  // Escape closes; focus moves into the panel and back to the page after.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rd-title"
      onClick={onClose}
    >
      <div
        ref={panel}
        tabIndex={-1}
        className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 shadow-[var(--shadow-lift)] outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="rd-title" className="text-lg font-semibold text-ink">
            {r.nome}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar">
            <X />
          </Button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-ink-3">Origem</dt>
          <dd className="text-ink">{r.origem}</dd>
          <dt className="text-ink-3">Categoria</dt>
          <dd className="text-ink">
            {CATEGORIAS.find((c) => c.id === r.categoria)?.nome} · {r.subcategoria}
          </dd>
          <dt className="text-ink-3">Verificação</dt>
          <dd className="text-ink">{r.verificado ? "Página consultada" : "Não verificada"}</dd>
          {r.preco && (
            <>
              <dt className="text-ink-3">Preço</dt>
              <dd className="text-ink">{r.preco}</dd>
            </>
          )}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-ink-2">{r.descricao}</p>
        <p className="mt-4 break-all rounded-[var(--radius-xs)] bg-surface-2 p-2 font-mono text-[11px] text-ink-3">
          {r.url}
        </p>
        <div className="mt-5 flex justify-end">
          <Button asChild>
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              <Link2 aria-hidden="true" />
              Abrir fonte externa
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoriaId | "todos">("todos");
  const [sub, setSub] = useState<string | "todas">("todas");
  const [ordem, setOrdem] = useState<Ordem>("relevancia");
  const [detalhe, setDetalhe] = useState<Resource | null>(null);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const { has, toggle, count } = useFavourites();

  const subs = useMemo(() => {
    const pool = cat === "todos" ? RESOURCES : RESOURCES.filter((r) => r.categoria === cat);
    return [...new Set(pool.map((r) => r.subcategoria))];
  }, [cat]);

  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    let list = RESOURCES.filter((r) => {
      if (cat !== "todos" && r.categoria !== cat) return false;
      if (sub !== "todas" && r.subcategoria !== sub) return false;
      if (onlyFavs && !has(r.id)) return false;
      if (!k) return true;
      return `${r.nome} ${r.descricao} ${r.origem} ${r.subcategoria}`.toLowerCase().includes(k);
    });
    if (ordem === "az") list = [...list].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (ordem === "risco") list = [...list].sort((a, b) => RISK_ORDER[a.risco] - RISK_ORDER[b.risco]);
    return list;
  }, [q, cat, sub, ordem, onlyFavs, has]);

  const ativos = (cat !== "todos" ? 1 : 0) + (sub !== "todas" ? 1 : 0) + (q ? 1 : 0);

  return (
    <section id="recursos" className="mx-auto w-full max-w-6xl min-w-0 scroll-mt-24 overflow-x-clip px-5 pb-24 pt-16">
      <header className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Recursos externos
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          {RESOURCES.length} links organizados em cinco categorias. {totalVerificados} páginas foram
          consultadas para escrever a descrição; nas demais, o texto diz que não foi verificado.
          Todos os links levam à fonte original.
        </p>
      </header>

      <div className="sticky top-16 z-20 -mx-5 mt-8 bg-canvas/85 px-5 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
              aria-hidden="true"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, descrição ou origem"
              aria-label="Buscar recursos"
              className="pl-9 pr-9"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-3 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <label className="sr-only" htmlFor="ordem">
            Ordenar
          </label>
          <select
            id="ordem"
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as Ordem)}
            className="h-11 rounded-[var(--radius-sm)] border border-hairline bg-surface px-3 text-sm text-ink"
          >
            <option value="relevancia">Ordem original</option>
            <option value="az">Nome A–Z</option>
            <option value="risco">Risco primeiro</option>
          </select>

          <Button
            variant={onlyFavs ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyFavs((v) => !v)}
            aria-pressed={onlyFavs}
          >
            <Heart className={cn(onlyFavs && "fill-current")} aria-hidden="true" />
            Favoritos{count > 0 ? ` (${count})` : ""}
          </Button>

          {ativos > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ("");
                setCat("todos");
                setSub("todas");
                setOnlyFavs(false);
              }}
            >
              Limpar filtros ({ativos})
            </Button>
          )}
        </div>

        <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Categorias">
          {[{ id: "todos" as const, nome: "Todas" }, ...CATEGORIAS].map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setCat(c.id as CategoriaId | "todos");
                  setSub("todas");
                }}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "border-ink bg-ink text-canvas"
                    : "border-hairline bg-surface text-ink-2 hover:border-ink/25 hover:text-ink",
                )}
              >
                {c.nome}
              </button>
            );
          })}
        </div>

        {subs.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSub("todas")}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                sub === "todas" ? "bg-accent/15 text-accent" : "text-ink-3 hover:text-ink",
              )}
            >
              todas
            </button>
            {subs.map((s) => (
              <button
                key={s}
                onClick={() => setSub(s)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  sub === s ? "bg-accent/15 text-accent" : "text-ink-3 hover:text-ink",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-ink-3" aria-live="polite">
        {shown.length === 1 ? "1 recurso" : `${shown.length} recursos`}
        {q && ` para “${q}”`}
      </p>

      {shown.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-md)] border border-dashed border-hairline p-12 text-center">
          <p className="text-sm text-ink-2">
            {onlyFavs && count === 0
              ? "Você ainda não marcou favoritos. Toque no coração de um recurso para guardá-lo aqui."
              : "Nenhum recurso corresponde a esses filtros. Limpe a busca ou escolha outra categoria."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setQ("");
              setCat("todos");
              setSub("todas");
              setOnlyFavs(false);
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <ResourceCard
              key={r.id}
              r={r}
              onOpen={setDetalhe}
              fav={has(r.id)}
              onFav={() => toggle(r.id)}
            />
          ))}
        </div>
      )}

      {detalhe && <Detail r={detalhe} onClose={() => setDetalhe(null)} />}
    </section>
  );
}


