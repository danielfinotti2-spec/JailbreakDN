/* Redes sociais — ícones reais, sem cor de marca.

   O briefing original pedia monocromia; por isso os ícones herdam
   `currentColor` em vez de vir com o roxo do Discord ou o degradê do
   Instagram. O ícone é reconhecível, o tom continua o do site.

   "Site" não tem marca (é o próprio domínio), então usa um glifo
   neutro de globo — o único caso em que faz sentido. */

import { Globe } from "lucide-react";
import { IconeMarca, temMarca } from "@/components/IconeMarca";
import { SOCIAIS } from "@/data/perfil";
import { cn } from "@/lib/cn";

export function SocialLinks({
  variante = "chips",
  className,
  tamanho = "sm",
}: {
  variante?: "chips" | "lista" | "icones";
  className?: string;
  tamanho?: "sm" | "md";
}) {
  const caixa = tamanho === "md" ? "size-9" : "size-8";
  const glifo = tamanho === "md" ? "size-4" : "size-3.5";

  /** Ícone real quando existe; globo para o próprio site. */
  const Glifo = ({ icone, className: c }: { icone: string; className?: string }) =>
    temMarca(icone) ? (
      <IconeMarca nome={icone} className={cn(glifo, c)} />
    ) : (
      <Globe className={cn(glifo, c)} aria-hidden="true" />
    );

  if (variante === "icones") {
    return (
      <ul className={cn("flex items-center gap-1", className)}>
        {SOCIAIS.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.nome}
              title={s.nome}
              className={cn(
                caixa,
                "grid place-items-center rounded-[var(--radius-xs)] border border-hairline text-ink-3 transition-colors hover:border-hairline-2 hover:text-ink",
              )}
            >
              <Glifo icone={s.icone} />
            </a>
          </li>
        ))}
      </ul>
    );
  }

  if (variante === "lista") {
    return (
      <ul className={cn("space-y-1.5", className)}>
        {SOCIAIS.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-baseline gap-2 text-[11.5px] text-ink-3 hover:text-ink"
            >
              <Glifo icone={s.icone} className="translate-y-0.5" />
              <span>{s.nome}</span>
              {s.handle && (
                <span className="mono text-[10.5px] text-ink-4 group-hover:text-ink-3">
                  {s.handle}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {SOCIAIS.map((s) => (
        <li key={s.id}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-[11.5px] text-ink-3 hover:text-ink"
          >
            <Glifo icone={s.icone} />
            <span className="group-hover:underline group-hover:decoration-hairline-2 group-hover:underline-offset-[3px]">
              {s.nome}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
