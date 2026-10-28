/* Destaque: Jailbreaks.

   A biblioteca de prompts é a parte mais procurada do projeto, mas
   estava escondida atrás de um único link no menu. Esta página a
   apresenta como um acervo navegável: os 16 arquivos originais,
   agrupados por modelo-alvo, com busca local e leitura inline.

   Nada aqui reescreve prompt. O texto é o mesmo de src/data/prompts.js
   — o que muda é a organização e a entrada.

   Aviso obrigatório: prompt que "funciona" hoje pode ser recusado
   amanhã. Nenhuma promessa de resultado é feita. */

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Copy, Download, Search, ShieldAlert, X } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import { SocialLinks } from "@/components/SocialLinks";
import { Botao } from "@/components/ui/base";
import { copiar, plural } from "@/lib/recursos";
import { TEXTS, sizeOf, type PromptItem } from "@/data/library";
import { cn } from "@/lib/cn";

/** Agrupa os modelos-alvo em famílias, para não listar 10 chips soltos. */
const FAMILIAS: { id: string; rotulo: string; casa: RegExp }[] = [
  { id: "chatgpt", rotulo: "ChatGPT", casa: /ChatGPT/i },
  { id: "claude", rotulo: "Claude", casa: /Claude/i },
  { id: "gemini", rotulo: "Gemini", casa: /Gemini/i },
  { id: "deepseek", rotulo: "DeepSeek", casa: /DeepSeek/i },
  { id: "opencode", rotulo: "OpenCode", casa: /OpenCode/i },
  { id: "persona", rotulo: "Persona", casa: /Persona/i },
  { id: "multi", rotulo: "Multimodelo", casa: /Multimodelo/i },
];

const familiaDe = (cat: string) =>
  FAMILIAS.find((f) => f.casa.test(cat))?.id ?? "outros";

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function Jailbreaks() {
  const [q, setQ] = useState("");
  const [fam, setFam] = useState<string | null>(null);
  const [aberto, setAberto] = useState<PromptItem | null>(null);
  const [marcado, setMarcado] = useState<number | null>(null);

  // Esc fecha o leitor e, enquanto aberto, o fundo não rola — o mesmo
  // comportamento da biblioteca de prompts em /prompts.
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(null);
    };
    window.addEventListener("keydown", aoTeclar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [aberto]);

  const mostrados = useMemo(() => {
    const k = normalizar(q.trim());
    return TEXTS.filter((t) => {
      if (fam && familiaDe(t.cat) !== fam) return false;
      if (k && !normalizar(`${t.title} ${t.cat} ${t.text}`).includes(k)) return false;
      return true;
    });
  }, [q, fam]);

  const contarFam = (id: string) => TEXTS.filter((t) => familiaDe(t.cat) === id).length;

  const aoCopiar = async (it: PromptItem) => {
    const ok = await copiar(it.text);
    setMarcado(ok ? it.id : null);
    window.setTimeout(() => setMarcado(null), 1500);
  };

  const baixar = (it: PromptItem) => {
    try {
      const url = URL.createObjectURL(new Blob([it.text], { type: "text/plain;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = it.filename ?? `${it.title.replace(/[^\w\- ]/g, "")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* navegador sem suporte a download por Blob */
    }
  };

  return (
    <div className="container-page">
      <header className="border-b border-hairline pb-4 pt-5">
        <Link
          href="/destaques"
          className="inline-flex items-center gap-1 text-[11.5px] text-ink-3 hover:text-ink"
        >
          <ArrowLeft className="size-3" aria-hidden="true" />
          Destaques
        </Link>

        <h1 className="mt-2 text-[19px] font-semibold leading-tight tracking-tight text-ink">
          Jailbreaks
        </h1>
        <p className="mt-1 max-w-[70ch] text-[12.5px] leading-relaxed text-ink-2">
          {plural(TEXTS.length, "arquivo original", "arquivos originais")} preservados, agrupados
          pelo modelo-alvo. O texto é exatamente o enviado — nada foi reescrito nem "melhorado".
        </p>
      </header>

      {/* Aviso: curto, sem alarmismo, mas presente */}
      <div className="mt-4 flex gap-2.5 border-l-2 border-hairline-2 pl-3">
        <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-ink-3" aria-hidden="true" />
        <p className="max-w-[76ch] text-[11.5px] leading-relaxed text-ink-3">
          Nenhum prompt garante que um serviço ignore as próprias regras. O resultado varia por
          modelo, versão e contexto, e costuma parar de funcionar sem aviso. Use em serviços que
          você tem o direito de usar e não trate o texto como garantia.
        </p>
      </div>

      {/* Controles */}
      <div className="sticky top-14 z-30 -mx-5 mt-4 border-b border-hairline bg-canvas px-5 py-2.5 md:-mx-7 md:px-7">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-4"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar no título, no alvo ou dentro do prompt…"
              aria-label="Buscar nos jailbreaks"
              className="h-8 w-full rounded-[var(--radius-sm)] border border-hairline bg-surface pl-8 pr-7 text-[12.5px] text-ink placeholder:text-ink-4 focus:border-hairline-2 focus:outline-none"
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
          <span className="mono shrink-0 text-[11px] text-ink-4">
            {mostrados.length}/{TEXTS.length}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setFam(null)}
            aria-pressed={fam === null}
            className={cn(
              "rounded-[var(--radius-xs)] border px-2 py-0.5 text-[11.5px]",
              fam === null
                ? "border-ink bg-ink text-canvas"
                : "border-hairline text-ink-2 hover:border-hairline-2 hover:text-ink",
            )}
          >
            todos
          </button>
          {FAMILIAS.map((f) => {
            const n = contarFam(f.id);
            if (n === 0) return null;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFam(fam === f.id ? null : f.id)}
                aria-pressed={fam === f.id}
                className={cn(
                  "inline-flex items-baseline gap-1 rounded-[var(--radius-xs)] border px-2 py-0.5 text-[11.5px]",
                  fam === f.id
                    ? "border-ink bg-ink text-canvas"
                    : "border-hairline text-ink-2 hover:border-hairline-2 hover:text-ink",
                )}
              >
                {f.rotulo}
                <span className={cn("mono text-[9.5px]", fam === f.id ? "opacity-70" : "text-ink-4")}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      {mostrados.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-[13px] text-ink-2">Nenhum prompt com esse filtro.</p>
          <p className="mt-1 text-[12px] text-ink-3">
            {q ? `Nada corresponde a “${q}”.` : "Tente outro modelo-alvo."}
          </p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setFam(null);
            }}
            className="mt-4 inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-hairline px-3 text-[12px] text-ink-2 hover:text-ink"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <ul className="pb-2" data-lista-jailbreaks>
          {mostrados.map((it) => (
            <li
              key={it.id}
              data-jailbreak={it.id}
              className="group relative flex items-baseline gap-3 border-b border-hairline py-2.5"
            >
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setAberto(it)}
                  className="text-left text-[13.5px] leading-snug text-ink hover:underline hover:decoration-hairline-2 hover:underline-offset-[3px]"
                >
                  {it.title}
                </button>
                <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[10.5px] text-ink-4">
                  <span>{it.cat}</span>
                  <span aria-hidden="true">·</span>
                  <span className="mono">{sizeOf(it.text)}</span>
                </p>
              </div>

              <div className="resource-row-actions flex shrink-0 items-center gap-0.5 self-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
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
                  Ler <ArrowRight className="size-3" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Saídas para o resto do acervo */}
      <div className="mt-6 border-t border-hairline pt-4">
        <p className="label-caps">Continuar</p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <li>
            <Link href="/categoria/prompts-ia" className="text-[12px] text-ink-2 hover:text-ink">
              Prompts para modelos de IA
            </Link>
          </li>
          <li>
            <Link href="/categoria/prompts-dev" className="text-[12px] text-ink-2 hover:text-ink">
              Prompts de programação
            </Link>
          </li>
          <li>
            <Link href="/categoria/prompts-agentes" className="text-[12px] text-ink-2 hover:text-ink">
              Prompts para agentes
            </Link>
          </li>
          <li>
            <Link href="/prompts" className="text-[12px] text-ink-2 hover:text-ink">
              Biblioteca completa
            </Link>
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <SocialLinks variante="chips" />
      </div>

      {/* Leitor */}
      {aberto && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jb-titulo"
          onClick={() => setAberto(null)}
        >
          <div
            className="fade-in max-h-[86vh] w-full max-w-2xl overflow-auto rounded-[var(--radius-md)] border border-hairline-2 bg-surface p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 id="jb-titulo" className="text-[14px] font-semibold text-ink">
                  {aberto.title}
                </h2>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[10.5px] text-ink-4">
                  <span>{aberto.cat}</span>
                  <span aria-hidden="true">·</span>
                  <span className="mono">{sizeOf(aberto.text)}</span>
                  {aberto.filename && <span className="mono">{aberto.filename}</span>}
                </p>
              </div>
              <Botao
                variante="fantasma"
                tamanho="icone-sm"
                onClick={() => setAberto(null)}
                aria-label="Fechar leitor"
              >
                <X aria-hidden="true" />
              </Botao>
            </div>

            <pre className="mono max-h-[52vh] overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-xs)] border border-hairline bg-canvas p-3 text-[11.5px] leading-relaxed text-ink">
              {aberto.text}
            </pre>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Botao tamanho="sm" variante="accent" onClick={() => aoCopiar(aberto)}>
                <Copy aria-hidden="true" />
                {marcado === aberto.id ? "Copiado" : "Copiar"}
              </Botao>
              <Botao tamanho="sm" variante="contorno" onClick={() => baixar(aberto)}>
                <Download aria-hidden="true" />
                Baixar .txt
              </Botao>
              <Link
                href={`/prompt/${aberto.id}`}
                className="ml-auto text-[11.5px] text-ink-3 hover:text-ink"
              >
                abrir página do prompt →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



