import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Download, Heart, Search, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/cn";
import { SORT_OPTIONS, TEXTS, sizeOf, type PromptItem, type SortOption } from "@/data/library";

const ORDER: Record<SortOption, (a: PromptItem, b: PromptItem) => number> = {
  "Mais recentes": (a, b) => b.at - a.at,
  "Mais antigos": (a, b) => a.at - b.at,
  "A–Z": (a, b) => a.title.localeCompare(b.title),
  "Mais curtidos": (a, b) => b.likes - a.likes,
};

export default function PromptLibrary() {
  const [items, setItems] = useState<PromptItem[]>(TEXTS);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [toast, setToast] = useState("");
  const [open, setOpen] = useState<PromptItem | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Escape closes the reader; focus returns to the page.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const update = (id: number, fn: (x: PromptItem) => Partial<PromptItem>) =>
    setItems((all) => all.map((x) => (x.id === id ? { ...x, ...fn(x) } : x)));

  const shown = items
    .filter((x) => {
      const k = q.trim().toLowerCase();
      if (k && !`${x.title} ${x.text} ${x.cat}`.toLowerCase().includes(k)) return false;
      if (cat && x.cat !== cat) return false;
      return true;
    })
    .sort(ORDER[sort]);

  const copy = (it: PromptItem) => {
    const done = () => {
      update(it.id, (x) => ({ uses: x.uses + 1 }));
      setToast("Copiado");
    };
    navigator.clipboard.writeText(it.text).then(done, () => setToast("Não foi possível copiar"));
  };

  const download = (it: PromptItem) => {
    try {
      const url = URL.createObjectURL(new Blob([it.text], { type: "text/plain" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = it.filename ?? `${it.title.replace(/[^\w\- ]/g, "")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setToast("Download iniciado");
    } catch {
      setToast("Download indisponível");
    }
  };

  return (
    <section id="textos" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 pb-20">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Biblioteca de prompts
          </h2>
          <p className="mt-2 text-sm text-ink-2">
            {items.length} arquivos. Prompts experimentais enviados pela comunidade — resultados
            variam por modelo e versão.
          </p>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar textos"
            aria-label="Buscar prompts"
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
        <label className="sr-only" htmlFor="prompt-sort">
          Ordenar
        </label>
        <select
          id="prompt-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="h-11 rounded-[var(--radius-sm)] border border-hairline bg-surface px-3 text-sm text-ink"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex min-w-0 flex-wrap gap-1.5">
        {[...new Set(items.map((x) => x.cat))].map((c) => (
          <button
            key={c}
            onClick={() => setCat(cat === c ? null : c)}
            aria-pressed={cat === c}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
              cat === c
                ? "border-ink bg-ink text-canvas"
                : "border-hairline text-ink-2 hover:border-ink/25 hover:text-ink",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 rounded-[var(--radius-md)] border border-dashed border-hairline p-10 text-center text-sm text-ink-2">
          Nada encontrado{q ? ` para “${q}”` : ""}.
        </p>
      ) : (
        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((it, i) => (
            <article
              key={it.id}
              style={{ "--d": `${Math.min(i, 8) * 45}ms` } as CSSProperties}
              className="reveal-in relative flex min-w-0 flex-col gap-2 rounded-[var(--radius-md)] border border-hairline bg-surface p-5 transition-[border-color,box-shadow] hover:border-ink/20 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => setOpen(it)}
                  className="text-left text-[15px] font-semibold text-ink hover:underline"
                >
                  {it.title}
                </button>
                <button
                  onClick={() =>
                    update(it.id, (x) => ({ liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }))
                  }
                  aria-pressed={it.liked}
                  aria-label={it.liked ? "Remover curtida" : "Curtir"}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-full border border-hairline px-2 py-0.5 text-xs",
                    it.liked ? "border-transparent bg-danger/10 text-danger" : "text-ink-3 hover:text-ink",
                  )}
                >
                  <Heart className={cn("size-3", it.liked && "fill-current")} aria-hidden="true" />
                  {it.likes}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-3">
                <Badge>{it.cat}</Badge>
                <span>
                  {sizeOf(it.text)} · {new Date(it.at).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <p className="line-clamp-4 min-w-0 flex-1 overflow-hidden whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-ink-2">
                {it.text.length > 520 ? `${it.text.slice(0, 520)}…` : it.text}
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <Button size="sm" variant="outline" onClick={() => setOpen(it)} className="flex-1">
                  Ler
                </Button>
                <Button size="sm" variant="ghost" onClick={() => copy(it)} aria-label={`Copiar ${it.title}`}>
                  Copiar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => download(it)} aria-label={`Baixar ${it.title}`}>
                  <Download aria-hidden="true" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prompt-title"
          onClick={() => setOpen(null)}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 shadow-[var(--shadow-lift)] outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 id="prompt-title" className="text-lg font-semibold text-ink">
                {open.title}
              </h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(null)} aria-label="Fechar leitor">
                <X />
              </Button>
            </div>
            <Badge className="mb-3">{open.cat}</Badge>
            <pre className="whitespace-pre-wrap break-words rounded-[var(--radius-sm)] bg-surface-2 p-4 font-mono text-[12px] leading-relaxed text-ink">
              {open.text}
            </pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => copy(open)}>
                Copiar
              </Button>
              <Button size="sm" variant="outline" onClick={() => download(open)}>
                Baixar .txt
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-canvas shadow-[var(--shadow-lift)]"
        >
          {toast}
        </div>
      )}
    </section>
  );
}


