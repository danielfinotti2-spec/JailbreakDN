/* Páginas de categoria.

   Duas rotas caem aqui:
   - /categoria/:id  → uma subcategoria do diretório;
   - /grupo/:id      → um grupo inteiro, com suas subcategorias em
                       sequência, na ordem canônica.

   A subcategoria "IA grátis" mostra além da lista um recorte por
   disponibilidade real (grátis, plano gratuito, créditos, local,
   pago, não verificado), que é o que o briefing pede com destaque. */

import { useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import { ResourceList } from "@/components/ResourceRow";
import { NotFoundInline } from "@/components/NotFound";
import { SocialLinks } from "@/components/SocialLinks";
import { GRUPOS, GRUPO_POR_ID, subcategoriaPorId, type GrupoId } from "@/data/categorias";
import { recursosDaSubcategoria, type Resource } from "@/data/links";
import { DISPONIBILIDADES } from "@/data/disponibilidade";
import { plural } from "@/lib/recursos";
import { cn } from "@/lib/cn";

function Cabecalho({
  titulo,
  descricao,
  voltar,
  voltarRotulo,
}: {
  titulo: string;
  descricao: string;
  voltar: string;
  voltarRotulo: string;
}) {
  return (
    <header className="border-b border-hairline pb-4 pt-5">
      <Link
        href={voltar}
        className="inline-flex items-center gap-1 text-[11.5px] text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        {voltarRotulo}
      </Link>
      <h1 className="mt-2 text-[19px] font-semibold leading-tight tracking-tight text-ink">
        {titulo}
      </h1>
      <p className="mt-1 max-w-[70ch] text-[12.5px] text-ink-2">{descricao}</p>
    </header>
  );
}

/** Recorte por disponibilidade — a parte que o briefing destaca. */
function PorDisponibilidade({ itens }: { itens: Resource[] }) {
  const grupos = useMemo(() => {
    const m = new Map<string, Resource[]>();
    for (const r of itens) {
      const l = m.get(r.disponibilidade);
      if (l) l.push(r);
      else m.set(r.disponibilidade, [r]);
    }
    return DISPONIBILIDADES.map((d) => ({ info: d, lista: m.get(d.id) ?? [] }));
  }, [itens]);

  const comConteudo = grupos.filter((g) => g.lista.length > 0);

  return (
    <div className="mt-5">
      <p className="label-caps">Por disponibilidade</p>
      <p className="mt-1 max-w-[70ch] text-[11.5px] leading-relaxed text-ink-3">
        Cada recurso aparece uma vez, no grupo que corresponde ao que foi confirmado sobre o
        acesso. Quando não há confirmação, ele fica no fim da lista — nenhum preço ou cota é estimado.
      </p>

      {comConteudo.map(({ info, lista }) => (
        <section key={info.id} className="mt-5">
          <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-hairline pb-1">
            <h2 className="text-[12.5px] font-medium text-ink">{info.rotulo}</h2>
            <span className="mono text-[10.5px] text-ink-4">{lista.length}</span>
          </div>
          <ResourceList itens={lista} />
        </section>
      ))}

      {/* Disponibilidades vazias: mensagem discreta, sem inventar link. */}
      {grupos.some((g) => g.lista.length === 0) && (
        <ul className="mt-6 space-y-1 border-t border-hairline pt-3">
          {grupos
            .filter((g) => g.lista.length === 0)
            .map((g) => (
              <li key={g.info.id} className="flex items-baseline justify-between gap-3 py-1">
                <span className="text-[11.5px] text-ink-4">{g.info.rotulo}</span>
                <span className="text-[10.5px] text-ink-4">nenhum recurso</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export function CategoriaPage({ id }: { id: string }) {
  const sub = subcategoriaPorId(id);

  if (!sub) {
    // Pode ser um id de grupo — /categoria/ia continua funcionando.
    const g = GRUPO_POR_ID.get(id as GrupoId);
    if (g) return <GrupoPage id={g.id} />;
    return (
      <NotFoundInline
        titulo="Categoria não encontrada"
        texto={`Não existe categoria com o identificador “${id}”.`}
        acao={{ label: "Ver todas as categorias", href: "/categorias" }}
      />
    );
  }

  const grupo = GRUPO_POR_ID.get(sub.grupoId);
  const itens = recursosDaSubcategoria(sub.id);
  const ehIA = sub.id === "ia-gratis";

  return (
    <div className="container-page">
      <Cabecalho
        titulo={sub.nome}
        descricao={
          itens.length === 0
            ? "Nenhum recurso cadastrado nesta subcategoria ainda."
            : `${plural(itens.length, "recurso", "recursos")} em ${grupo?.nome ?? "Outros"}.`
        }
        voltar={`/grupo/${sub.grupoId}`}
        voltarRotulo={`Voltar para ${grupo?.nome ?? "o índice"}`}
      />

      {itens.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-ink-2">Esta subcategoria está vazia.</p>
          <p className="mx-auto mt-1 max-w-[52ch] text-[12px] text-ink-3">
            Ela existe na estrutura do diretório para receber recursos depois. Nada foi adicionado
            aqui só para preencher espaço.
          </p>
          <Link
            href={`/grupo/${sub.grupoId}`}
            className="mt-4 inline-flex items-center gap-1 text-[12px] text-ink-2 hover:text-ink"
          >
            Ver o grupo {grupo?.nome}
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      ) : ehIA ? (
        <PorDisponibilidade itens={itens} />
      ) : (
        <div className="py-2">
          <ResourceList itens={itens} />
        </div>
      )}

      {grupo && (
        <div className="mt-8 border-t border-hairline pt-4">
          <p className="label-caps">Outras em {grupo.nome}</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {grupo.subcategorias
              .filter((s) => s.id !== sub.id)
              .map((s) => {
                const n = recursosDaSubcategoria(s.id).length;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/categoria/${s.id}`}
                      className={cn(
                        "inline-flex items-baseline gap-1 text-[12px] hover:text-ink",
                        n ? "text-ink-2" : "text-ink-4",
                      )}
                    >
                      {s.nome}
                      <span className="mono text-[10px] text-ink-4">{n}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <SocialLinks variante="chips" />
      </div>
    </div>
  );
}

export function GrupoPage({ id }: { id: GrupoId }) {
  const grupo = GRUPO_POR_ID.get(id);
  if (!grupo) {
    return (
      <NotFoundInline
        titulo="Grupo não encontrado"
        texto={`Não existe grupo com o identificador “${id}”.`}
        acao={{ label: "Ver todas as categorias", href: "/categorias" }}
      />
    );
  }

  const blocos = grupo.subcategorias.map((s) => ({ s, itens: recursosDaSubcategoria(s.id) }));
  const total = blocos.reduce((n, b) => n + b.itens.length, 0);

  return (
    <div className="container-page">
      <Cabecalho
        titulo={grupo.nome}
        descricao={`${grupo.resumo} ${plural(total, "recurso", "recursos")} em ${plural(grupo.subcategorias.length, "subcategoria", "subcategorias")}.`}
        voltar="/"
        voltarRotulo="Voltar ao índice"
      />

      {blocos.map(({ s, itens }) => (
        <section key={s.id} id={s.id} className="mt-6">
          <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-1.5">
            <h2 className="text-[13px] font-medium text-ink">{s.nome}</h2>
            <div className="flex items-baseline gap-3">
              <span className="mono text-[10.5px] text-ink-4">{itens.length}</span>
              <Link
                href={`/categoria/${s.id}`}
                className="text-[10.5px] text-ink-4 hover:text-ink-2"
              >
                abrir →
              </Link>
            </div>
          </div>

          {itens.length === 0 ? (
            <p className="py-3 text-[11.5px] text-ink-4">Nenhum recurso nesta subcategoria.</p>
          ) : (
            <ResourceList itens={itens} />
          )}
        </section>
      ))}

      <div className="mt-8 border-t border-hairline pt-4">
        <p className="label-caps">Outros grupos</p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {GRUPOS.filter((g) => g.id !== grupo.id).map((g) => (
            <li key={g.id}>
              <Link href={`/grupo/${g.id}`} className="text-[12px] text-ink-2 hover:text-ink">
                {g.nome}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <SocialLinks variante="chips" />
      </div>
    </div>
  );
}

/** /categorias — o mapa completo, em texto. */
export default function Categorias() {
  return (
    <div className="container-page">
      <header className="border-b border-hairline pb-4 pt-5">
        <h1 className="text-[19px] font-semibold leading-tight tracking-tight text-ink">
          Categorias
        </h1>
        <p className="mt-1 max-w-[70ch] text-[12.5px] text-ink-2">
          {GRUPOS.length} grupos e {GRUPOS.reduce((n, g) => n + g.subcategorias.length, 0)}{" "}
          subcategorias. Subcategorias sem recurso aparecem com zero — o espaço existe, só não tem
          link ainda.
        </p>
      </header>

      <div className="divide-y divide-hairline">
        {GRUPOS.map((g) => {
          const total = g.subcategorias.reduce(
            (n, s) => n + recursosDaSubcategoria(s.id).length,
            0,
          );
          return (
            <section key={g.id} className="py-4">
              <div className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/grupo/${g.id}`}
                  className="text-[14px] font-semibold text-ink hover:underline hover:decoration-hairline-2 hover:underline-offset-4"
                >
                  {g.nome}
                </Link>
                <span className="mono text-[11px] text-ink-4">{total}</span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-ink-3">{g.resumo}</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {g.subcategorias.map((s) => {
                  const n = recursosDaSubcategoria(s.id).length;
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/categoria/${s.id}`}
                        className={cn(
                          "inline-flex items-baseline gap-1 text-[12px] hover:text-ink",
                          n ? "text-ink-2" : "text-ink-4",
                        )}
                      >
                        {s.nome}
                        <span className="mono text-[10px] text-ink-4">{n}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <SocialLinks variante="chips" />
      </div>
    </div>
  );
}

