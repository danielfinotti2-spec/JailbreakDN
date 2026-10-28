/* Detalhe de um recurso — /recurso/:id.

   Uma linha do diretório não cabe tudo: URL completa, avisos, se a
   página foi conferida, preço registrado e o que está por perto. Esta
   página existe para isso, e para dar a cada item uma URL própria. */

import { useState } from "react";
import { ArrowLeft, Check, Copy, ExternalLink, Heart } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import { Botao } from "@/components/ui/base";
import { NotFoundInline } from "@/components/NotFound";
import { SocialLinks } from "@/components/SocialLinks";
import { useLibrary } from "@/hooks/useLibrary";
import { ROTAS } from "@/lib/router";
import { copiar, dominio, formatarData, plural } from "@/lib/recursos";
import { recursoPorId, TIPO_LABEL, recursosDaSubcategoria } from "@/data/links";
import { subcategoriaPorId, grupoDaSubcategoria } from "@/data/categorias";
import { disponibilidadeInfo } from "@/data/disponibilidade";
import { cn } from "@/lib/cn";

function Item({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-hairline py-2 last:border-b-0">
      <dt className="w-32 shrink-0 text-[11px] text-ink-4">{rotulo}</dt>
      <dd className="min-w-0 text-[12px] text-ink-2">{children}</dd>
    </div>
  );
}

export function ResourceDetailRoute({ id }: { id: string }) {
  const r = recursoPorId(id);
  const { ehFavorito, alternarFavorito } = useLibrary();
  const [copiado, setCopiado] = useState(false);

  if (!r) {
    return (
      <NotFoundInline
        titulo="Recurso não encontrado"
        texto={`Não existe recurso com o identificador “${id}”. Ele pode ter sido renomeado.`}
        acao={{ label: "Ver todos os recursos", href: ROTAS.recursos }}
      />
    );
  }

  const fav = ehFavorito(r.id);
  const sub = subcategoriaPorId(r.subcategoriaId);
  const grupo = grupoDaSubcategoria(r.subcategoriaId);
  const disp = disponibilidadeInfo(r.disponibilidade);
  const irmaos = recursosDaSubcategoria(r.subcategoriaId).filter((x) => x.id !== r.id).slice(0, 5);

  const aoCopiar = async () => {
    const ok = await copiar(r.url);
    setCopiado(ok);
    window.setTimeout(() => setCopiado(false), 1600);
  };

  return (
    <div className="container-page">
      <div className="border-b border-hairline pb-4 pt-5">
        <Link
          href={`/categoria/${r.subcategoriaId}`}
          className="inline-flex items-center gap-1 text-[11.5px] text-ink-3 hover:text-ink"
        >
          <ArrowLeft className="size-3" aria-hidden="true" />
          {sub?.nome ?? "Categoria"}
        </Link>

        <h1 className="mt-2 text-[20px] font-semibold leading-tight tracking-tight text-ink">
          {r.nome}
        </h1>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[11.5px] text-ink-3">
          <span className="mono">{dominio(r.url)}</span>
          <span aria-hidden="true">·</span>
          <span>{r.origem}</span>
          <span aria-hidden="true">·</span>
          <span>{TIPO_LABEL[r.tipo]}</span>
        </p>
      </div>

      <div className="grid gap-8 py-5 lg:grid-cols-[1fr_300px]">
        <article className="min-w-0">
          <p className="max-w-[72ch] text-[13px] leading-relaxed text-ink-2">{r.descricao}</p>

          {r.avisos && r.avisos.length > 0 && (
            <div className="mt-4 border-l-2 border-hairline-2 pl-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-2">
                Aviso — {r.avisos.length}{" "}
                {r.avisos.length === 1 ? "aviso" : "avisos"}
              </p>
              <ul className="mt-1.5 space-y-1">
                {r.avisos.map((a) => (
                  <li key={a} className="max-w-[72ch] text-[12px] leading-relaxed text-ink-2">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5">
            <p className="label-caps">{r.interno ? "Endereço interno" : "Endereço original"}</p>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="mono min-w-0 flex-1 break-all rounded-[var(--radius-xs)] border border-hairline bg-surface px-2.5 py-1.5 text-[11.5px] text-ink-2">
                {r.url}
              </code>
              <Botao tamanho="sm" variante="contorno" onClick={aoCopiar} className="shrink-0 self-start">
                {copiado ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                {copiado ? "Copiado" : "Copiar URL"}
              </Botao>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-4">
              {r.interno
                ? "Servido por este site: o texto completo pode ser lido, copiado e baixado na página de prompts."
                : "Exibida exatamente como foi cadastrada, incluindo parâmetros de indicação e convite."}
            </p>
          </div>

          <dl className="mt-5">
            <Item rotulo="Categoria">
              {grupo && (
                <>
                  <Link href={`/grupo/${grupo.id}`} className="hover:text-ink hover:underline">
                    {grupo.nome}
                  </Link>
                  {" / "}
                </>
              )}
              <Link href={`/categoria/${r.subcategoriaId}`} className="hover:text-ink hover:underline">
                {sub?.nome}
              </Link>
            </Item>
            <Item rotulo="Disponibilidade">
              {disp.rotulo}
              <span className="block text-[11px] text-ink-4">{disp.descricao}</span>
            </Item>
            <Item rotulo="Conta">
              {r.conta === true ? "exige conta" : r.conta === false ? "não exige" : "não informado"}
            </Item>
            {r.preco && <Item rotulo="Preço">{r.preco}</Item>}
            <Item rotulo="No catálogo">{formatarData(r.adicionadoEm)}</Item>
            <Item rotulo="Tags">
              <span className="flex flex-wrap gap-x-2 gap-y-1">
                {r.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/recursos?q=${encodeURIComponent(t)}`}
                    className="mono text-[11px] text-ink-3 hover:text-ink"
                  >
                    #{t}
                  </Link>
                ))}
              </span>
            </Item>
          </dl>
        </article>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-col gap-1.5">
            {r.interno ? (
              <Botao asChild variante="accent" className="w-full">
                <Link href={r.url}>
                  <ExternalLink aria-hidden="true" />
                  Abrir recurso
                </Link>
              </Botao>
            ) : (
              <Botao asChild variante="accent" className="w-full">
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden="true" />
                  Abrir recurso
                </a>
              </Botao>
            )}
            <Botao
              variante="contorno"
              className="w-full"
              onClick={() => alternarFavorito(r.id)}
              aria-pressed={fav}
            >
              <Heart className={cn(fav && "fill-current")} aria-hidden="true" />
              {fav ? "Nos favoritos" : "Favoritar"}
            </Botao>
            <p className="mt-1 text-[10.5px] leading-relaxed text-ink-4">
              {r.interno
                ? "Abre a página interna deste recurso."
                : "Abre em nova aba, no site de origem. Nada é baixado automaticamente."}
            </p>
          </div>

          {irmaos.length > 0 && (
            <div className="mt-6">
              <p className="label-caps">Também em {sub?.nome}</p>
              <ul className="mt-1.5">
                {irmaos.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={ROTAS.recurso(o.id)}
                      className="flex items-baseline justify-between gap-2 border-b border-hairline py-1.5 text-[12px] text-ink-2 hover:text-ink"
                    >
                      <span className="truncate">{o.nome}</span>
                      <span className="mono shrink-0 text-[10px] text-ink-4">{dominio(o.url)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {recursosDaSubcategoria(r.subcategoriaId).length > 6 && (
                <Link
                  href={`/categoria/${r.subcategoriaId}`}
                  className="mt-2 inline-block text-[11px] text-ink-3 hover:text-ink"
                >
                  ver {plural(recursosDaSubcategoria(r.subcategoriaId).length, "os", "todos os")}{" "}
                  {recursosDaSubcategoria(r.subcategoriaId).length} →
                </Link>
              )}
            </div>
          )}

          <p className="mt-6 text-[10.5px] leading-relaxed text-ink-4">
            Recurso de terceiros. Regras, conteúdo e disponibilidade são do site de origem — este
            diretório guarda apenas o endereço.
          </p>

          <div className="mt-4">
            <SocialLinks variante="chips" />
          </div>
        </aside>
      </div>
    </div>
  );
}



