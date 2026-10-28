/* "Como funciona" — a seção que orienta quem chega perdido.

   O site é um diretório, e diretório sem instrução parece só uma
   lista longa. Aqui ficam três passos concretos com ilustração, no
   estilo de uma página de ajuda: o que fazer, em que ordem.

   Vem depois do índice na home (não antes), porque quem já sabe usar
   não deve rolar uma explicação para chegar ao conteúdo. */

import { lazy, Suspense } from "react";
import { ArrowRight, CornerDownLeft } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import {
  IlustracaoBuscar,
  IlustracaoCategorias,
  IlustracaoSalvar,
} from "@/components/Ilustracoes";

// Painel 3D ambiental: chunk separado, baixa depois do primeiro paint.
// O fallback é o próprio contorno do painel, mesmo tamanho, sem pulo.
const Cena3D = lazy(() => import("@/components/Cena3D"));

const PASSOS = [
  {
    n: "01",
    titulo: "Busque pelo que você precisa",
    texto:
      "O campo no topo procura em nome, descrição, categoria e tags ao mesmo tempo. O texto continua lá quando você muda de seção.",
    dica: "Atalho: / em qualquer página",
    Ilustracao: IlustracaoBuscar,
    href: "/recursos",
    acao: "Abrir a busca",
  },
  {
    n: "02",
    titulo: "Ou navegue pela categoria",
    texto:
      "São 8 grupos e 40 subcategorias. Cada recurso fica na subcategoria que descreve o que ele é — sem etiqueta repetida no título da seção.",
    dica: "Ex.: IA grátis → chatbots gratuitos",
    Ilustracao: IlustracaoCategorias,
    href: "/categorias",
    acao: "Ver as categorias",
  },
  {
    n: "03",
    titulo: "Guarde o que serve",
    texto:
      "O coração em cada linha salva o recurso. Fica neste navegador, sem conta e sem sincronizar — ninguém mais vê sua lista.",
    dica: "Copia a URL com o ícone ao lado",
    Ilustracao: IlustracaoSalvar,
    href: "/favoritos",
    acao: "Meus favoritos",
  },
];

export function ComoFunciona() {
  return (
    <section aria-labelledby="como-funciona" className="border-b border-hairline py-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="como-funciona" className="text-[15px] font-semibold text-ink">
          Como funciona
        </h2>
        <p className="text-[11.5px] text-ink-4">três passos</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {PASSOS.map(({ n, titulo, texto, dica, Ilustracao, href, acao }) => (
          <article
            key={n}
            className="flex flex-col rounded-[var(--radius-sm)] border border-hairline bg-surface p-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="mono text-[10px] text-ink-4">{n}</span>
              <span className="text-[10px] text-ink-4">{dica}</span>
            </div>

            <Ilustracao className="mt-2 h-[76px] w-full text-ink" />

            <h3 className="mt-2 text-[12.5px] font-medium leading-snug text-ink">{titulo}</h3>
            <p className="mt-1 flex-1 text-[11.5px] leading-relaxed text-ink-3">{texto}</p>

            <Link
              href={href}
              className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] text-ink-2 hover:text-ink"
            >
              {acao}
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="mt-4 h-[240px] rounded-[var(--radius-sm)] border border-hairline bg-surface"
          />
        }
      >
        <Cena3D />
      </Suspense>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-4">
        <CornerDownLeft className="size-3" aria-hidden="true" />
        Dentro da busca: Enter filtra na hora, Esc limpa o campo.
      </p>
    </section>
  );
}
