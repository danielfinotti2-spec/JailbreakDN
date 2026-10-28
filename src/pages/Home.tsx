/* Página inicial — o diretório aberto por padrão.

   Sem hero, sem slogan, sem estatística. A primeira coisa útil é o
   índice: cada grupo com suas subcategorias e os recursos listados em
   linhas compactas. Quem quer filtrar vai para /recursos; quem só
   quer achar um link usa a busca do cabeçalho, que fica fixa.

   Com a busca ativa, a home deixa de ser um índice e passa a mostrar
   o resultado — assim o campo do cabeçalho funciona em qualquer rota. */

import { lazy, Suspense, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Search, X } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import { ResourceList } from "@/components/ResourceRow";
import { useLibrary } from "@/hooks/useLibrary";
import { GRUPOS, grupoDaSubcategoria } from "@/data/categorias";
import { RESOURCES, recursosDaSubcategoria } from "@/data/links";
import { SocialLinks } from "@/components/SocialLinks";
import { plural } from "@/lib/recursos";
import { cn } from "@/lib/cn";
import { useContador, semMovimento } from "@/lib/animacoes";
import { ComoFunciona } from "@/components/ComoFunciona";
// Pato 3D do topo: mora em chunk separado (three); enquanto baixa,
// o mascote estático segura o lugar sem pulo de layout.
const PatoVigia3D = lazy(() => import("@/components/Pato3D"));
import gsap from "gsap";

/** Índice: grupos → subcategorias → recursos, como lista compacta. */
function Indice() {
  // Abre por padrão o primeiro grupo com conteúdo, para a página já
  // nascer útil em vez de só mostrar títulos.
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set(["ia"]));

  const aoAlternar = (id: string) =>
    setAbertos((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });

  return (
    <div>
      {GRUPOS.map((g) => {
        const itens = g.subcategorias.flatMap((s) => recursosDaSubcategoria(s.id));
        if (itens.length === 0) {
          // Grupo vazio: mostra o título e a ausência, sem inventar link.
          return (
            <section key={g.id} id={`grupo-${g.id}`} className="border-b border-hairline py-5">
              <h2 className="text-[15px] font-semibold text-ink">{g.nome}</h2>
              <p className="mt-1 text-[12px] text-ink-3">
                Nenhum recurso cadastrado neste grupo ainda.
              </p>
            </section>
          );
        }

        const aberto = abertos.has(g.id);

        return (
          <section key={g.id} id={`grupo-${g.id}`} className="border-b border-hairline">
            <div className="flex items-baseline justify-between gap-4 py-3">
              <button
                type="button"
                onClick={() => aoAlternar(g.id)}
                aria-expanded={aberto}
                aria-controls={`conteudo-${g.id}`}
                className="group flex items-center gap-2 text-left"
              >
                <ChevronDown
                  className={cn(
                    "size-3.5 text-ink-4 transition-transform duration-150",
                    !aberto && "-rotate-90",
                  )}
                  aria-hidden="true"
                />
                <span className="text-[15px] font-semibold text-ink group-hover:underline group-hover:decoration-hairline-2 group-hover:underline-offset-4">
                  {g.nome}
                </span>
                <span className="mono text-[11px] text-ink-4">{itens.length}</span>
              </button>
              <Link
                href={`/grupo/${g.id}`}
                className="shrink-0 text-[11.5px] text-ink-3 hover:text-ink"
              >
                ver grupo
              </Link>
            </div>

            {aberto && (
              <div
                id={`conteudo-${g.id}`}
                className="pb-4"
                /* Entrada do grupo: as subcategorias sobem em sequência.
                   Sem animação de altura — o conteúdo já existe no DOM e
                   o GSAP só revela, o que evita reflow no meio do gesto. */
                ref={(el) => {
                  if (!el || semMovimento()) return;
                  if (el.dataset.animado === "1") return;
                  el.dataset.animado = "1";
                  gsap.from(el.querySelectorAll(":scope > div"), {
                    opacity: 0,
                    y: 8,
                    duration: 0.34,
                    ease: "power2.out",
                    stagger: 0.04,
                    clearProps: "transform",
                  });
                }}
              >
                {g.subcategorias.map((s) => {
                  const lista = recursosDaSubcategoria(s.id);
                  if (lista.length === 0) return null;
                  return (
                    <div key={s.id} className="mt-4 first:mt-0">
                      <div className="mb-1 flex items-baseline justify-between gap-3">
                        <h3 className="label-caps">{s.nome}</h3>
                        <Link
                          href={`/categoria/${s.id}`}
                          className="shrink-0 text-[10.5px] text-ink-4 hover:text-ink-2"
                        >
                          {lista.length} →
                        </Link>
                      </div>
                      <ResourceList itens={lista} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Resultado da busca, agrupado por subcategoria — mesma linguagem visual. */
function ResultadoDaBusca() {
  const { busca, setBusca, resultados } = useLibrary();

  const porSub = useMemo(() => {
    const m = new Map<string, typeof resultados>();
    for (const r of resultados) {
      const l = m.get(r.subcategoriaId);
      if (l) l.push(r);
      else m.set(r.subcategoriaId, [r]);
    }
    return m;
  }, [resultados]);

  return (
    <div className="py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-3">
        <p className="text-[13px] text-ink-2">
          <span className="mono text-ink">{resultados.length}</span>{" "}
          {resultados.length === 1 ? "resultado" : "resultados"} para{" "}
          <span className="text-ink">“{busca}”</span>
        </p>
        <div className="flex items-center gap-3">
          <Link href="/recursos" className="text-[11.5px] text-ink-3 hover:text-ink">
            abrir com filtros
          </Link>
          <button
            type="button"
            onClick={() => setBusca("")}
            className="inline-flex items-center gap-1 text-[11.5px] text-ink-3 hover:text-ink"
          >
            <X className="size-3" aria-hidden="true" />
            limpar busca
          </button>
        </div>
      </div>

      {resultados.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-ink-2">Nada encontrado para “{busca}”.</p>
          <p className="mt-1 text-[12px] text-ink-3">
            Tente outro termo, ou navegue pelas categorias abaixo.
          </p>
        </div>
      ) : (
        [...porSub.entries()].map(([subId, lista]) => {
          const grupo = grupoDaSubcategoria(subId);
          const sub = grupo?.subcategorias.find((s) => s.id === subId);
          return (
            <div key={subId} className="mt-5">
              <div className="mb-1 flex items-baseline gap-2">
                <h3 className="label-caps">{sub?.nome ?? subId}</h3>
                <span className="text-[10.5px] text-ink-4">{grupo?.nome}</span>
              </div>
              <ResourceList itens={lista} />
            </div>
          );
        })
      )}
    </div>
  );
}

export default function Home() {
  const { busca, resultados } = useLibrary();
  const buscando = busca.trim().length > 0;
  const contadorRef = useContador<HTMLSpanElement>(RESOURCES.length);

  return (
    <div className="container-page">
      {/* Faixa de abertura: pequena, informativa, sem slogan. */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline py-5">
        <div className="flex items-center gap-3">
          <Suspense
            fallback={
              <img
                src="/pato-mascote.png"
                alt="Pato, mascote do JailbreakDN"
                width={40}
                height={40}
                className="size-10 shrink-0 object-contain grayscale"
              />
            }
          >
            <PatoVigia3D />
          </Suspense>
          <div>
            <h1 className="text-[17px] font-semibold leading-tight tracking-tight text-ink">
              JailbreakDN
            </h1>
            <p className="text-[12px] text-ink-3">
              Diretório de links por categoria —{" "}
              <span ref={contadorRef} className="mono tabular-nums">
                {RESOURCES.length}
              </span>{" "}
              recursos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recursos"
            className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-hairline px-3 text-[12px] text-ink-2 hover:border-hairline-2 hover:text-ink"
          >
            <Search className="size-3.5" aria-hidden="true" />
            Buscar e filtrar
          </Link>
          <Link
            href="/categoria/ia-gratis"
            className="hidden h-8 items-center rounded-[var(--radius-sm)] bg-ink px-3 text-[12px] font-medium text-canvas hover:opacity-90 sm:inline-flex"
          >
            IA grátis
          </Link>
        </div>
      </div>

      {buscando ? <ResultadoDaBusca /> : <Indice />}

      {/* Explicação depois do índice: quem já sabe usar não precisa
          rolar orientação para chegar ao conteúdo. */}
      {!buscando && <ComoFunciona />}

      {/* Rodapé de conteúdo: redes, discretas. */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div className="flex items-center gap-3">
          <SocialLinks variante="chips" />
        </div>
        <p className="text-[11px] text-ink-4">
          {plural(resultados.length, "recurso visível", "recursos visíveis")} nesta página
        </p>
      </div>

      <div className="pb-4">
        <Link
          href="/categorias"
          className="inline-flex items-center gap-1 text-[12px] text-ink-3 hover:text-ink"
        >
          Ver todas as categorias
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}





