/* Rodapé — organizado em colunas em vez de uma faixa achatada.

   Antes tudo disputava a mesma linha de texto: marca, 119 recursos,
   cinco links, quatro redes e um parágrafo legal inteiro. Sem
   hierarquia, lê-se como um bloco só.

   Agora:
     coluna 1  marca, contagem e as redes (identidade)
     coluna 2  navegação curta
     coluna 3  estado do acervo, com os números reais do catálogo
     faixa     o aviso legal, em duas frases curtas

   Nada de cota, preço ou estatística inventada: os números vêm do
   próprio dataset. */

import { Link } from "@/components/ui/linkInterno";
import { SocialLinks } from "@/components/SocialLinks";
import { ROTAS } from "@/lib/router";
import { MARCA } from "@/data/perfil";
import { RESOURCES } from "@/data/links";
import { GRUPOS, TOTAL_SUBCATEGORIAS } from "@/data/categorias";
import { useVisitas } from "@/hooks/useVisitas";
import { useContador } from "@/lib/animacoes";

const NAV = [
  { label: "Índice", href: ROTAS.inicio },
  { label: "Todos os recursos", href: ROTAS.recursos },
  { label: "Categorias", href: "/categorias" },
  { label: "Favoritos", href: ROTAS.favoritos },
  { label: "Prompts", href: "/prompts" },
];

export default function Footer() {
  const externos = RESOURCES.filter((r) => !r.interno).length;
  // Contagem pública de visitas (useVisitas) subindo do zero com a
  // mesma animação do contador da marca (useContador).
  const visitas = useVisitas();
  const visitasRef = useContador<HTMLElement>(visitas ?? 0);

  return (
    <footer className="mt-12 border-t border-hairline">
      <div className="container-page">
        <div className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* Identidade */}
          <div>
            <Link
              href={ROTAS.inicio}
              className="inline-flex items-center gap-2"
              aria-label={`${MARCA.nome} — início`}
            >
              <img
                src="/duck.webp"
                alt=""
                width={20}
                height={20}
                className="size-5 object-contain grayscale"
              />
              <span className="mono text-[12.5px] font-medium text-ink">{MARCA.nome}</span>
            </Link>
            <p className="mt-1.5 max-w-[34ch] text-[11.5px] leading-relaxed text-ink-3">
              Diretório de links organizado por categoria — IA, APIs, desenvolvimento,
              engenharia reversa, segurança e prompts.
            </p>
            <div className="mt-4">
              <SocialLinks variante="chips" />
            </div>
          </div>

          {/* Navegação */}
          <nav aria-label="Rodapé">
            <p className="label-caps">Navegar</p>
            <ul className="mt-2 space-y-1.5">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[12px] text-ink-3 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Acervo: números reais, nada estimado */}
          <div>
            <p className="label-caps">O acervo</p>
            <dl className="mt-2 space-y-1.5 text-[12px]">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-3">Recursos</dt>
                <dd className="mono text-ink-2">{RESOURCES.length}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-3">Links externos</dt>
                <dd className="mono text-ink-2">{externos}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-3">Categorias</dt>
                <dd className="mono text-ink-2">
                  {GRUPOS.length}/{TOTAL_SUBCATEGORIAS}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-3">Subcategorias</dt>
                <dd className="mono text-ink-2">{TOTAL_SUBCATEGORIAS}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-3">Visitantes</dt>
                <dd ref={visitasRef} aria-live="polite" className="mono text-ink-2">
                  —
                </dd>
              </div>
            </dl>
            <Link
              href="/categorias"
              className="mt-3 inline-block text-[11.5px] text-ink-4 hover:text-ink-2"
            >
              ver a estrutura completa →
            </Link>
          </div>
        </div>

        {/* Aviso legal: duas frases, não um parágrafo */}
        <div className="border-t border-hairline py-4">
          <p className="max-w-[76ch] text-[10.5px] leading-relaxed text-ink-4">
            Os recursos abrem sites de terceiros, com regras próprias — nada é hospedado aqui.
            Preços, cotas e limites mudam sem aviso: confirme no site de origem antes de contar
            com eles.
          </p>
        </div>
      </div>
    </footer>
  );
}


