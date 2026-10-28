/* Catálogo — a página de trabalho do diretório.

   O problema anterior era densidade: 25 botões de filtro visíveis de
   uma vez, quatro blocos de controle e 17815 caracteres na tela.

   Agora a barra mostra só o essencial — busca, filtro de grupo e o
   que estiver ativo. Tipo, disponibilidade e ordenação ficam atrás de
   "Filtros", que abre quando a pessoa quer. Nada foi removido: tudo
   continua a um clique, só deixa de estar exposto o tempo todo.

   A busca NÃO é relida da URL a cada montagem: o texto vive no
   provider e só é sobrescrito quando a URL traz um ?q= explícito. */

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { ResourceList } from "@/components/ResourceRow";
import { SocialLinks } from "@/components/SocialLinks";
import { useLibrary, ORDENS } from "@/hooks/useLibrary";
import { usePath, navigate } from "@/lib/router";
import { GRUPOS, subcategoriaPorId } from "@/data/categorias";
import { TIPO_IDS, TIPO_LABEL, type RiskLevel, type TipoId } from "@/data/links";
import { DISPONIBILIDADES, type Disponibilidade } from "@/data/disponibilidade";
import { plural } from "@/lib/recursos";
import { cn } from "@/lib/cn";

function useFiltrosDaUrl() {
  const path = usePath();
  const {
    alternarGrupo,
    alternarSubcategoria,
    setDisponibilidade,
    setRisco,
    setApenasFavoritos,
    setBusca,
    filtros,
  } = useLibrary();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat && subcategoriaPorId(cat) && !filtros.subcategorias.includes(cat)) {
      alternarSubcategoria(cat);
    }
    const grupo = params.get("grupo");
    if (grupo && GRUPOS.some((g) => g.id === grupo) && !filtros.grupos.includes(grupo)) {
      alternarGrupo(grupo);
    }
    const disp = params.get("disp");
    if (disp && DISPONIBILIDADES.some((d) => d.id === disp)) setDisponibilidade(disp as Disponibilidade);
    const risco = params.get("risco");
    if (risco === "alto" || risco === "atencao") {
      setRisco((risco === "alto" ? "high" : "caution") as RiskLevel);
    }
    const q = params.get("q");
    if (q !== null) setBusca(q);

    setApenasFavoritos(path === "/favoritos");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
}

/** Só a pílula de um filtro ativo, para mostrar o que está ligado. */
function Ativo({ children, aoRemover }: { children: React.ReactNode; aoRemover: () => void }) {
  return (
    <button
      type="button"
      onClick={aoRemover}
      className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] border border-hairline-2 px-1.5 py-0.5 text-[11px] text-ink-2 hover:text-ink"
    >
      {children}
      <X className="size-2.5" aria-hidden="true" />
    </button>
  );
}

export default function Catalog() {
  useFiltrosDaUrl();
  const [painelAberto, setPainelAberto] = useState(false);

  const {
    busca,
    setBusca,
    filtros,
    alternarGrupo,
    setTipo,
    setDisponibilidade,
    setRisco,
    setApenasFavoritos,
    ordem,
    setOrdem,
    limpar,
    ativos,
    resultados,
    favoritos,
  } = useLibrary();

  const ehFavoritos = usePath() === "/favoritos";

  const blocos = useMemo(() => {
    const m = new Map<string, typeof resultados>();
    for (const r of resultados) {
      const l = m.get(r.subcategoriaId);
      if (l) l.push(r);
      else m.set(r.subcategoriaId, [r]);
    }
    return [...m.entries()].map(([id, itens]) => ({
      id,
      nome: subcategoriaPorId(id)?.nome ?? id,
      itens,
    }));
  }, [resultados]);

  const grupoAtivo = filtros.grupos[0];
  const dispAtiva = DISPONIBILIDADES.find((d) => d.id === filtros.disponibilidade);

  return (
    <div className="container-page">
      <header className="border-b border-hairline pb-3 pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-[19px] font-semibold leading-tight tracking-tight text-ink">
            {ehFavoritos ? "Favoritos" : "Todos os recursos"}
          </h1>
          <p className="mono text-[11px] text-ink-4">
            {ehFavoritos ? "" : plural(resultados.length, "recurso", "recursos")}
          </p>
        </div>
        {ehFavoritos && favoritos.length === 0 && (
          <p className="mt-1 text-[12px] text-ink-3">
            Você ainda não marcou nada. O coração aparece ao passar o mouse em cada linha.
          </p>
        )}
      </header>

      {/* Barra de controles: apenas o essencial. */}
      <div className="sticky top-14 z-30 -mx-5 border-b border-hairline bg-canvas px-5 py-2.5 md:-mx-7 md:px-7">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-4"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar…"
              aria-label="Buscar recursos"
              className="h-8 w-full rounded-[var(--radius-sm)] border border-hairline bg-surface pl-8 pr-2.5 text-[12.5px] text-ink placeholder:text-ink-4 focus:border-hairline-2 focus:outline-none"
            />
          </div>

          {/* Grupo: um <select> em vez de oito pílulas. */}
          <div className="relative shrink-0">
            <label className="sr-only" htmlFor="filtro-grupo">
              Filtrar por categoria
            </label>
            <select
              id="filtro-grupo"
              value={grupoAtivo ?? ""}
              onChange={(e) => {
                filtros.grupos.forEach((g) => g !== e.target.value && alternarGrupo(g));
                if (e.target.value) {
                  if (!filtros.grupos.includes(e.target.value)) alternarGrupo(e.target.value);
                } else {
                  filtros.grupos.forEach((g) => alternarGrupo(g));
                }
              }}
              className="h-8 max-w-[170px] appearance-none rounded-[var(--radius-sm)] border border-hairline bg-surface pl-2.5 pr-7 text-[12px] text-ink-2 focus:border-hairline-2 focus:outline-none"
            >
              <option value="" className="bg-surface text-ink">
                Tudo
              </option>
              {GRUPOS.map((g) => (
                <option key={g.id} value={g.id} className="bg-surface text-ink">
                  {g.nome}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-ink-4"
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={() => setPainelAberto((v) => !v)}
            aria-expanded={painelAberto}
            aria-controls="painel-filtros"
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5 text-[12px]",
              painelAberto || ativos > 0
                ? "border-hairline-2 text-ink"
                : "border-hairline text-ink-2 hover:text-ink",
            )}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Filtros</span>
            {ativos > 0 && <span className="mono text-[10px] text-ink-3">{ativos}</span>}
          </button>

          <button
            type="button"
            onClick={() => setApenasFavoritos(!filtros.apenasFavoritos)}
            aria-pressed={filtros.apenasFavoritos}
            aria-label="Mostrar só os favoritos"
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border",
              filtros.apenasFavoritos
                ? "border-hairline-2 text-ink"
                : "border-hairline text-ink-3 hover:text-ink",
            )}
          >
            <Heart
              className={cn("size-3.5", filtros.apenasFavoritos && "fill-current")}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Filtros avançados: só quando pedidos. */}
        {painelAberto && (
          <div id="painel-filtros" className="fade-in mt-2.5 border-t border-hairline pt-2.5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5">
                <label htmlFor="filtro-disp" className="text-[11px] text-ink-4">
                  Acesso
                </label>
                <select
                  id="filtro-disp"
                  value={filtros.disponibilidade ?? ""}
                  onChange={(e) => setDisponibilidade((e.target.value || null) as Disponibilidade | null)}
                  className="h-7 rounded-[var(--radius-xs)] border border-hairline bg-surface px-1.5 text-[11.5px] text-ink-2 focus:outline-none"
                >
                  <option value="" className="bg-surface text-ink">
                    qualquer
                  </option>
                  {DISPONIBILIDADES.map((d) => (
                    <option key={d.id} value={d.id} className="bg-surface text-ink">
                      {d.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor="filtro-tipo" className="text-[11px] text-ink-4">
                  Tipo
                </label>
                <select
                  id="filtro-tipo"
                  value={filtros.tipo ?? ""}
                  onChange={(e) => setTipo((e.target.value || null) as TipoId | null)}
                  className="h-7 rounded-[var(--radius-xs)] border border-hairline bg-surface px-1.5 text-[11.5px] text-ink-2 focus:outline-none"
                >
                  <option value="" className="bg-surface text-ink">
                    qualquer
                  </option>
                  {TIPO_IDS.map((t) => (
                    <option key={t} value={t} className="bg-surface text-ink">
                      {TIPO_LABEL[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor="filtro-ordem" className="text-[11px] text-ink-4">
                  Ordem
                </label>
                <select
                  id="filtro-ordem"
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value as typeof ordem)}
                  className="h-7 rounded-[var(--radius-xs)] border border-hairline bg-surface px-1.5 text-[11.5px] text-ink-2 focus:outline-none"
                >
                  {ORDENS.map((o) => (
                    <option key={o.id} value={o.id} className="bg-surface text-ink">
                      {o.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              {ativos > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    limpar();
                    if (window.location.search) navigate("/recursos");
                  }}
                  className="text-[11.5px] text-ink-3 hover:text-ink"
                >
                  limpar tudo
                </button>
              )}
            </div>
          </div>
        )}

        {/* Resumo do que está ativo, sempre visível — sem abrir o painel. */}
        {(grupoAtivo || dispAtiva || filtros.tipo || busca) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {busca && (
              <Ativo aoRemover={() => setBusca("")}>
                <span className="mono text-[10.5px]">“{busca}”</span>
              </Ativo>
            )}
            {grupoAtivo && (
              <Ativo aoRemover={() => alternarGrupo(grupoAtivo)}>
                {GRUPOS.find((g) => g.id === grupoAtivo)?.nome}
              </Ativo>
            )}
            {dispAtiva && (
              <Ativo aoRemover={() => setDisponibilidade(null)}>{dispAtiva.rotulo}</Ativo>
            )}
            {filtros.tipo && (
              <Ativo aoRemover={() => setTipo(null)}>{TIPO_LABEL[filtros.tipo]}</Ativo>
            )}
            {filtros.risco && (
              <Ativo aoRemover={() => setRisco(null)}>
                {filtros.risco === "high" ? "risco alto" : "atenção"}
              </Ativo>
            )}
          </div>
        )}
      </div>

      {resultados.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[13px] text-ink-2">Nenhum recurso com esses filtros.</p>
          <p className="mt-1 text-[12px] text-ink-3">
            {busca ? `Nada corresponde a “${busca}”.` : "Tente remover algum filtro."}
          </p>
          <button
            type="button"
            onClick={() => {
              limpar();
              navigate("/recursos");
            }}
            className="mt-4 inline-flex h-8 items-center rounded-[var(--radius-sm)] bg-ink px-3.5 text-[12px] font-medium text-canvas hover:opacity-90"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="pb-4">
          {blocos.map((b, i) => (
            <section key={b.id} className="mt-5">
              <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-1">
                <h2 className="text-[12px] text-ink-2">{b.nome}</h2>
                <span className="mono text-[10.5px] text-ink-4">{b.itens.length}</span>
              </div>

              {/* Blocos distantes do topo só renderizam as primeiras
                  linhas até serem abertos. Sem isso, a página despeja
                  as 112 descrições de uma vez e assusta na chegada —
                  o conteúdo continua todo aqui, a um clique. */}
              <BlocoProgressivo
                itens={b.itens}
                abertoInicial={i < 2 || b.itens.length <= 4 || Boolean(busca)}
              />
            </section>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <SocialLinks variante="chips" />
      </div>
    </div>
  );
}

const PREVIA = 4;

function BlocoProgressivo({
  itens,
  abertoInicial,
}: {
  itens: Parameters<typeof ResourceList>[0]["itens"];
  abertoInicial: boolean;
}) {
  const [aberto, setAberto] = useState(abertoInicial);
  if (aberto || itens.length <= PREVIA) return <ResourceList itens={itens} />;

  return (
    <>
      <ResourceList itens={itens.slice(0, PREVIA)} />
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] text-ink-3 hover:text-ink"
      >
        mais {itens.length - PREVIA}{" "}
        {itens.length - PREVIA === 1 ? "recurso" : "recursos"}
        <ChevronDown className="size-3" aria-hidden="true" />
      </button>
    </>
  );
}



