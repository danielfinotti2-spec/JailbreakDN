/* Destaques — uma seleção editorial, não um ranking.

   Não existe "mais acessado" nem "mais popular" no projeto: não há
   contador de cliques, e inventar um seria mentira. O que esta página
   faz é diferente e honesto: reúne os recursos que têm a descrição
   mais completa no catálogo, agrupados por motivo de interesse, para
   quem chega sem saber onde começar.

   Cada cartão diz POR QUE está ali. É a diferença entre uma curadoria
   e uma lista arbitrária. */

import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import { SocialLinks } from "@/components/SocialLinks";
import { ResourceList } from "@/components/ResourceRow";
import { recursoPorId, recursosDaSubcategoria, type Resource } from "@/data/links";
import { subcategoriaPorId, grupoDaSubcategoria } from "@/data/categorias";
import { plural } from "@/lib/recursos";

/* ------------------------------------------------------------------
   A seleção. Cada id existe no catálogo — se um deles for renomeado,
   o cartão some em vez de quebrar (ver filtro abaixo).
   ------------------------------------------------------------------ */

const DESTAQUES: { id: string; porque: string }[] = [
  {
    id: "huggingface",
    porque: "Maior acervo aberto de modelos, datasets e demos rodáveis no navegador.",
  },
  {
    id: "protonvpn",
    porque: "Plano gratuito real, com auditoria pública e sem exigir cartão.",
  },
  {
    id: "tails",
    porque: "Sistema que roda de um pendrive e não deixa rastro na máquina.",
  },
  {
    id: "ghidra",
    porque: "Engenharia reversa completo e gratuito — o padrão da área.",
  },
  {
    id: "shodan",
    porque: "Mostra o que está exposto na internet, do ponto de vista de quem procura.",
  },
  {
    id: "rea",
    porque: "Agentes de IA aplicados à análise de binários e comportamento de apps.",
  },
  {
    id: "r3f",
    porque: "Cenas 3D declarativas em React, com a comunidade mais ativa do gênero.",
  },
  {
    id: "claude-startups",
    porque: "Créditos promocionais documentados para quem está começando um projeto.",
  },
];

/** Aba "Destaque" — a rota /destaques. */
export default function Destaques() {
  // Recursos que realmente existem; o mapa descarta ids inválidos.
  const itens = DESTAQUES.map((d) => {
    const r = recursoPorId(d.id);
    return r ? { r, porque: d.porque } : null;
  }).filter((x): x is { r: Resource; porque: string } => x !== null);

  return (
    <div className="container-page">
      <header className="border-b border-hairline pb-4 pt-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-ink-3" aria-hidden="true" />
          <h1 className="text-[19px] font-semibold leading-tight tracking-tight text-ink">
            Destaques
          </h1>
        </div>
        <p className="mt-1 max-w-[70ch] text-[12.5px] leading-relaxed text-ink-2">
          {plural(itens.length, "recurso escolhido", "recursos escolhidos")} à mão, cada um com o
          motivo da escolha. Não é ranking de popularidade — o site não mede acessos, e inventar
          essa ordem seria mentira.
        </p>
      </header>

      {/* Cartões de destaque */}
      <div className="grid gap-3 py-5 md:grid-cols-2">
        {itens.map(({ r, porque }) => {
          const sub = subcategoriaPorId(r.subcategoriaId);
          const grupo = grupoDaSubcategoria(r.subcategoriaId);
          return (
            <article
              key={r.id}
              className="group relative flex flex-col rounded-[var(--radius-sm)] border border-hairline bg-surface p-3.5 transition-colors hover:border-hairline-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={`/recurso/${r.id}`}
                  className="text-[14px] font-medium leading-snug text-ink after:absolute after:inset-0 after:content-[''] hover:underline hover:decoration-hairline-2 hover:underline-offset-[3px]"
                >
                  {r.nome}
                </Link>
                <span className="mono shrink-0 text-[10px] text-ink-4">{grupo?.nome}</span>
              </div>

              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">
                <span className="text-ink-2">Por que está aqui: </span>
                {porque}
              </p>

              <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-ink-4">
                {r.descricao}
              </p>

              <div className="relative z-10 mt-2.5 flex items-center gap-3">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11.5px] text-ink-2 hover:text-ink"
                >
                  Abrir
                  <ArrowRight className="size-3" aria-hidden="true" />
                </a>
                <Link
                  href={`/categoria/${r.subcategoriaId}`}
                  className="text-[11px] text-ink-4 hover:text-ink-2"
                >
                  {sub?.nome}
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Destaque temático: a biblioteca de prompts. */}
      <Link
        href="/jailbreaks"
        className="group flex items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-hairline bg-surface px-3.5 py-3 transition-colors hover:border-hairline-2"
      >
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink">Jailbreaks</p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-3">
            16 prompts originais, agrupados pelo modelo-alvo — com leitura, cópia e download.
          </p>
        </div>
        <ArrowRight
          className="size-4 shrink-0 text-ink-4 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-2"
          aria-hidden="true"
        />
      </Link>

      <section className="border-t border-hairline pt-5">
        <h2 className="text-[14px] font-semibold text-ink">Uma porta de entrada por categoria</h2>
        <p className="mt-0.5 text-[11.5px] text-ink-3">
          O primeiro recurso de cada grupo — bom ponto de partida se você não sabe onde procurar.
        </p>

        <div className="mt-3 space-y-4">
          {[
            "ia-gratis",
            "apis-gratis",
            "bibliotecas",
            "rea",
            "vpns",
            "prompts-ia",
            "youtube",
            "sites",
          ].map((subId) => {
            const lista = recursosDaSubcategoria(subId).slice(0, 3);
            const sub = subcategoriaPorId(subId);
            if (lista.length === 0 || !sub) return null;
            const grupo = grupoDaSubcategoria(subId);
            return (
              <div key={subId}>
                <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-hairline pb-1">
                  <h3 className="label-caps">{sub.nome}</h3>
                  <Link
                    href={`/categoria/${subId}`}
                    className="shrink-0 text-[10.5px] text-ink-4 hover:text-ink-2"
                  >
                    {grupo?.nome} →
                  </Link>
                </div>
                <ResourceList itens={lista} />
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <SocialLinks variante="chips" />
      </div>
    </div>
  );
}

