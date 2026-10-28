/* Componentes de base: botão, badge e estado vazio.

   Monocromáticos: a única "cor" de destaque é o branco invertido. Não
   existe variante colorida — a hierarquia vem de preenchimento,
   borda e peso do texto. */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

type Variante = "padrao" | "contorno" | "fantasma" | "accent";
type Tamanho = "sm" | "md" | "lg" | "icone" | "icone-sm";

const BASE =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium " +
  "transition-colors disabled:pointer-events-none disabled:opacity-40 " +
  "[&_svg]:size-3.5 [&_svg]:shrink-0";

const VARIANTES: Record<Variante, string> = {
  /* Destaque: fundo claro, texto escuro. */
  accent: "bg-ink text-canvas hover:opacity-90",
  /* Neutro: superfície com borda. */
  padrao: "border border-hairline bg-surface text-ink hover:border-hairline-2 hover:bg-surface-2",
  contorno: "border border-hairline text-ink hover:bg-surface-2",
  fantasma: "text-ink-2 hover:bg-surface-2 hover:text-ink",
};

const TAMANHOS: Record<Tamanho, string> = {
  sm: "h-7 rounded-[var(--radius-xs)] px-2.5 text-[11.5px]",
  md: "h-8 rounded-[var(--radius-sm)] px-3 text-[12px]",
  lg: "h-10 rounded-[var(--radius-sm)] px-4 text-[13px]",
  icone: "size-8 rounded-[var(--radius-xs)]",
  "icone-sm": "size-7 rounded-[var(--radius-xs)]",
};

export interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  asChild?: boolean;
}

export const Botao = React.forwardRef<HTMLButtonElement, BotaoProps>(
  ({ className, variante = "padrao", tamanho = "md", asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        // Dentro de <form>, um <button> sem type é submit. Todo botão do
        // projeto é "button" a menos que peça o contrário.
        type={asChild ? type : (type ?? "button")}
        className={cn(BASE, VARIANTES[variante], TAMANHOS[tamanho], className)}
        {...props}
      />
    );
  },
);
Botao.displayName = "Botao";

/** Etiqueta curta. Usada com parcimônia: nunca uma por linha de lista. */
export function Badge({
  children,
  className,
  tom = "neutro",
}: {
  children: React.ReactNode;
  className?: string;
  tom?: "neutro" | "forte";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-xs)] border px-1.5 py-0.5 text-[10.5px] leading-none",
        tom === "forte"
          ? "border-ink bg-ink text-canvas"
          : "border-hairline text-ink-3",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Estado vazio: título, uma linha de explicação e, às vezes, uma ação. */
export function Vazio({
  titulo,
  texto,
  acao,
}: {
  titulo: string;
  texto: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-hairline px-6 py-12 text-center">
      <p className="text-[13px] font-medium text-ink">{titulo}</p>
      <p className="mx-auto mt-1 max-w-[52ch] text-[12px] leading-relaxed text-ink-3">{texto}</p>
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
