/* Linha do diretório — o mínimo que identifica um recurso.

   Antes: nome, domínio, disponibilidade, "não verificado", aviso de
   risco e descrição — sete metadados em dezoito elementos por linha,
   somando ~17815 caracteres na tela do catálogo. Isso assustava quem
   só queria achar um link.

   Agora: nome, uma linha de descrição e "Abrir". Só. Domínio,
   disponibilidade, verificação, tags e avisos continuam existindo na
   página de detalhe, que é onde alguém vai procurar por eles.

   Os avisos de risco continuam na página de detalhe, onde há espaço
   para explicar o motivo — na linha eles eram ruído. */

import { memo, useState } from "react";
import { ArrowUpRight, Check, Copy, Heart } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import { useLibrary } from "@/hooks/useLibrary";
import { copiar } from "@/lib/recursos";
import { ROTAS } from "@/lib/router";
import { useEntradaEmCascata, useRealceSeguindoCursor } from "@/lib/animacoes";
import { cn } from "@/lib/cn";
import type { Resource } from "@/data/links";

export const ResourceRow = memo(function ResourceRow({
  r,
  indice = 0,
}: {
  r: Resource;
  indice?: number;
}) {
  const { ehFavorito, alternarFavorito } = useLibrary();
  const [copiado, setCopiado] = useState(false);
  const fav = ehFavorito(r.id);

  const aoCopiar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copiar(r.url);
    setCopiado(ok);
    window.setTimeout(() => setCopiado(false), 1600);
  };

  return (
    <li
      data-recurso={r.id}
      data-tipo={r.tipo}
      data-subcategoria={r.subcategoriaId}
      data-disponibilidade={r.disponibilidade}
      data-indice={indice}
      className="group relative flex items-baseline gap-3 border-b border-hairline py-2 last:border-b-0"
    >
      <div className="min-w-0 flex-1">
        <Link
          href={ROTAS.recurso(r.id)}
          className="text-[13.5px] text-ink after:absolute after:inset-0 after:content-[''] hover:underline hover:decoration-hairline-2 hover:underline-offset-[3px]"
        >
          {r.nome}
        </Link>


        <p className="mt-0.5 line-clamp-1 text-[12px] leading-relaxed text-ink-3">
          {r.descricao}
        </p>
      </div>

      {/* Ações: aparecem no hover/foco e no toque. Sempre no DOM, para
          teclado e leitor de tela. */}
      <div className="resource-row-actions relative z-10 flex shrink-0 items-center gap-0.5 self-center opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          onClick={aoCopiar}
          aria-label={copiado ? `URL de ${r.nome} copiada` : `Copiar URL de ${r.nome}`}
          title="Copiar URL"
          className="grid size-6 place-items-center rounded-[var(--radius-xs)] text-ink-4 hover:text-ink"
        >
          {copiado ? (
            <Check className="size-3" aria-hidden="true" />
          ) : (
            <Copy className="size-3" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alternarFavorito(r.id);
          }}
          aria-pressed={fav}
          aria-label={fav ? `Remover ${r.nome} dos favoritos` : `Favoritar ${r.nome}`}
          title={fav ? "Remover dos favoritos" : "Favoritar"}
          className={cn(
            "grid size-6 place-items-center rounded-[var(--radius-xs)] hover:text-ink",
            fav ? "text-ink" : "text-ink-4",
          )}
        >
          <Heart className={cn("size-3", fav && "fill-current")} aria-hidden="true" />
        </button>

        {r.interno ? (
          <Link
            href={r.url}
            className="inline-flex items-center gap-0.5 px-1 text-[11px] text-ink-3 hover:text-ink"
            aria-label={`Abrir ${r.nome}`}
          >
            Abrir <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
        ) : (
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 px-1 text-[11px] text-ink-3 hover:text-ink"
            aria-label={`Abrir ${r.nome} em nova aba`}
          >
            Abrir <ArrowUpRight className="size-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </li>
  );
});

export function ResourceList({ itens }: { itens: Resource[] }) {
  const refCursor = useRealceSeguindoCursor<HTMLDivElement>(true);
  const refEntrada = useEntradaEmCascata<HTMLDivElement>([itens]);

  return (
    <div ref={refCursor}>
      <div ref={refEntrada}>
        <ul>
          {itens.map((r, i) => (
            <ResourceRow key={r.id} r={r} indice={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}



