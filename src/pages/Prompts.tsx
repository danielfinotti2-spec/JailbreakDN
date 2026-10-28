/* Biblioteca de prompts — os 16 arquivos originais preservados.

   O texto vem de src/data/prompts.js e não foi alterado. Ler, copiar
   e baixar funcionam sem rede: o .txt é gerado no próprio navegador.

   A apresentação segue a de diretório: títulos em lista compacta, com
   o leitor só quando pedido. */

import { useEffect, useRef, useState } from "react";
import { Download, Copy, Search, X, ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import { NotFoundInline } from "@/components/NotFound";
import { SocialLinks } from "@/components/SocialLinks";
import { Botao } from "@/components/ui/base";
import { ROTAS } from "@/lib/router";
import { copiar, plural } from "@/lib/recursos";
import { TEXTS, sizeOf, type PromptItem } from "@/data/library";

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function PromptsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [aberto, setAberto] = useState<PromptItem | null>(null);
  const [toast, setToast] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(null);
    };
    window.addEventListener("keydown", aoTeclar);
    dialogRef.current?.focus();
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [aberto]);

  const mostrados = TEXTS.filter((x) => {
    const k = normalizar(q.trim());
    if (k && !normalizar(`${x.title} ${x.text} ${x.cat}`).includes(k)) return false;
    if (cat && x.cat !== cat) return false;
    return true;
  });

  const categorias = [...new Set(TEXTS.map((x) => x.cat))];

  const aoCopiar = async (it: PromptItem) => {
    const ok = await copiar(it.text);
    setToast(ok ? "Prompt copiado" : "Não foi possível copiar");
  };

  const baixar = (it: PromptItem) => {
    try {
      const url = URL.createObjectURL(new Blob([it.text], { type: "text/plain;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = it.filename ?? `${it.title.replace(/[^\w\- ]/g, "")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setToast("Download iniciado");
    } catch {
      setToast("Download indisponível neste navegador");
    }
  };

  return (
    <div className="container-page">
      <header className="border-b border-hairline pb-4 pt-5">
        <Link
          href="/grupo/prompts"
          className="inline-flex items-center gap-1 text-[11.5px] text-ink-3 hover:text-ink"
        >
          <ArrowLeft className="size-3" aria-hidden="true" />
          Prompts e jailbreaks
        </Link>
        <h1 className="mt-2 text-[19px] font-semibold leading-tight tracking-tight text-ink">
          Arquivos originais
        </h1>
        <p className="mt-1 max-w-[70ch] text-[12.5px] text-ink-2">
          {plural(TEXTS.length, "arquivo preservado", "arquivos preservados")}, com o nome de
          arquivo mantido. Material experimental: nenhum prompt garante que um serviço ignore as
          próprias regras, e o resultado varia por modelo e versão.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 py-3">
        <div className="relative min-w-[180px] flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-4"
            aria-hidden="true"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nos prompts"
            aria-label="Buscar prompts"
            className="h-8 w-full rounded-[var(--radius-sm)] border border-hairline bg-surface pl-8 pr-8 text-[12.5px] text-ink placeholder:text-ink-4 focus:border-hairline-2 focus:outline-none"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Limpar busca"
              className="absolute right-1.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-ink-4 hover:text-ink"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          )}
        </div>

        {categorias.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(cat === c ? null : c)}
            aria-pressed={cat === c}
            className={
              "rounded-[var(--radius-xs)] border px-2 py-0.5 text-[11.5px] transition-colors " +
              (cat === c
                ? "border-ink bg-ink text-canvas"
                : "border-hairline text-ink-2 hover:border-hairline-2 hover:text-ink")
            }
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mono mb-1 text-[10.5px] text-ink-4" aria-live="polite">
        {plural(mostrados.length, "arquivo", "arquivos")}
      </p>

      {mostrados.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-ink-2">Nenhum prompt encontrado.</p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat(null);
            }}
            className="mt-3 inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-hairline px-3 text-[12px] text-ink-2 hover:text-ink"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <ul>
          {mostrados.map((it) => (
            <li key={it.id} className="group flex items-start gap-3 border-b border-hairline py-2.5">
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setAberto(it)}
                  className="text-left text-[13.5px] font-medium leading-snug text-ink hover:underline hover:decoration-hairline-2 hover:underline-offset-[3px]"
                >
                  {it.title}
                </button>
                <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[10.5px] text-ink-4">
                  <span>{it.cat}</span>
                  <span aria-hidden="true">·</span>
                  <span className="mono">{sizeOf(it.text)}</span>
                  {it.filename && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="mono truncate">{it.filename}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="resource-row-actions flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => aoCopiar(it)}
                  aria-label={`Copiar ${it.title}`}
                  title="Copiar"
                  className="grid size-7 place-items-center rounded-[var(--radius-xs)] text-ink-3 hover:bg-surface-2 hover:text-ink"
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => baixar(it)}
                  aria-label={`Baixar ${it.title}`}
                  title="Baixar .txt"
                  className="grid size-7 place-items-center rounded-[var(--radius-xs)] text-ink-3 hover:bg-surface-2 hover:text-ink"
                >
                  <Download className="size-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setAberto(it)}
                  className="mono inline-flex items-center gap-0.5 rounded-[var(--radius-xs)] px-1.5 py-1 text-[11px] text-ink-3 hover:bg-surface-2 hover:text-ink"
                >
                  Ler <ArrowUpRight className="size-3" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <SocialLinks variante="chips" />
      </div>

      {aberto && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prompt-title"
          onClick={() => setAberto(null)}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="fade-in max-h-[85vh] w-full max-w-2xl overflow-auto rounded-[var(--radius-md)] border border-hairline-2 bg-surface p-4 outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 id="prompt-title" className="text-[14px] font-semibold text-ink">
                  {aberto.title}
                </h2>
                <p className="mt-0.5 flex items-center gap-2 text-[10.5px] text-ink-4">
                  <span>{aberto.cat}</span>
                  {aberto.filename && <span className="mono">{aberto.filename}</span>}
                </p>
              </div>
              <Botao variante="fantasma" tamanho="icone-sm" onClick={() => setAberto(null)} aria-label="Fechar leitor">
                <X aria-hidden="true" />
              </Botao>
            </div>
            <pre className="mono max-h-[52vh] overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-xs)] border border-hairline bg-canvas p-3 text-[11.5px] leading-relaxed text-ink">
              {aberto.text}
            </pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <Botao tamanho="sm" variante="accent" onClick={() => aoCopiar(aberto)}>
                <Copy aria-hidden="true" />
                Copiar
              </Botao>
              <Botao tamanho="sm" variante="contorno" onClick={() => baixar(aberto)}>
                <Download aria-hidden="true" />
                Baixar .txt
              </Botao>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fade-in fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-[var(--radius-sm)] border border-hairline-2 bg-surface px-3 py-1.5 text-[11.5px] text-ink"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/** Leitor de um prompt específico, em /prompt/:id (rota interna). */
export function PromptPage({ id }: { id: string }) {
  const it = TEXTS.find((x) => String(x.id) === id);
  const [copiado, setCopiado] = useState(false);

  if (!it) {
    return (
      <NotFoundInline
        titulo="Prompt não encontrado"
        texto={`Não existe prompt com o identificador “${id}” na biblioteca.`}
        acao={{ label: "Ver todos os prompts", href: "/prompts" }}
      />
    );
  }

  const aoCopiar = async () => {
    const ok = await copiar(it.text);
    setCopiado(ok);
    window.setTimeout(() => setCopiado(false), 1600);
  };

  const baixar = () => {
    try {
      const url = URL.createObjectURL(new Blob([it.text], { type: "text/plain;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = it.filename ?? `${it.title.replace(/[^\w\- ]/g, "")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* navegador sem Blob/download */
    }
  };

  return (
    <div className="container-page">
      <div className="border-b border-hairline pb-4 pt-5">
        <Link
          href="/prompts"
          className="inline-flex items-center gap-1 text-[11.5px] text-ink-3 hover:text-ink"
        >
          <ArrowLeft className="size-3" aria-hidden="true" />
          Voltar para os prompts
        </Link>
        <h1 className="mt-2 text-[19px] font-semibold leading-tight tracking-tight text-ink">
          {it.title}
        </h1>
        <p className="mt-1 flex flex-wrap items-baseline gap-2 text-[11px] text-ink-3">
          <span>{it.cat}</span>
          <span aria-hidden="true">·</span>
          <span className="mono">{sizeOf(it.text)}</span>
          {it.filename && (
            <>
              <span aria-hidden="true">·</span>
              <span className="mono">{it.filename}</span>
            </>
          )}
        </p>
      </div>

      <p className="max-w-[72ch] py-3 text-[11.5px] leading-relaxed text-ink-3">
        Prompt experimental enviado pela comunidade. Nenhum prompt garante que um serviço ignore as
        próprias regras, e o resultado varia por modelo e versão.
      </p>

      <div className="flex flex-wrap gap-2 pb-3">
        <Botao variante="accent" onClick={aoCopiar}>
          <Copy aria-hidden="true" />
          {copiado ? "Copiado" : "Copiar prompt"}
        </Botao>
        <Botao variante="contorno" onClick={baixar}>
          <Download aria-hidden="true" />
          Baixar .txt
        </Botao>
        <Botao asChild variante="fantasma">
          <Link href={ROTAS.recursos}>Ver na biblioteca</Link>
        </Botao>
      </div>

      <pre className="mono max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-sm)] border border-hairline bg-surface p-3 text-[11.5px] leading-relaxed text-ink">
        {it.text}
      </pre>

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <SocialLinks variante="chips" />
      </div>
    </div>
  );
}

