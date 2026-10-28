/* 404 — página e variante embutida.

   A página completa é usada para rotas desconhecidas; a variante
   inline serve para identificadores que não existem dentro do layout. */

import { ArrowLeft, Home } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import { Botao } from "@/components/ui/base";
import { ROTAS } from "@/lib/router";

export function NotFoundInline({
  titulo,
  texto,
  acao,
}: {
  titulo: string;
  texto: string;
  acao: { label: string; href: string };
}) {
  return (
    <div className="container-page flex min-h-[45vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-[17px] font-semibold text-ink">{titulo}</h1>
      <p className="mt-1.5 max-w-[52ch] text-[12.5px] leading-relaxed text-ink-2">{texto}</p>
      <Botao asChild variante="accent" className="mt-5">
        <Link href={acao.href}>
          <Home aria-hidden="true" />
          {acao.label}
        </Link>
      </Botao>
    </div>
  );
}

export default function NotFound({ path }: { path: string }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="mono text-[10.5px] uppercase tracking-[0.16em] text-ink-4">404</p>
      <h1 className="mt-2 text-[20px] font-semibold tracking-tight text-ink">
        Esse endereço não existe
      </h1>
      <p className="mt-2 max-w-[52ch] text-[12.5px] leading-relaxed text-ink-2">
        Nenhuma rota responde por{" "}
        <code className="mono break-all rounded-[var(--radius-xs)] border border-hairline bg-surface px-1 py-0.5 text-[11.5px] text-ink-2">
          {path}
        </code>
        . Pode ser um link antigo ou um endereço digitado errado.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Botao asChild variante="accent">
          <Link href={ROTAS.inicio}>
            <Home aria-hidden="true" />
            Ir para o índice
          </Link>
        </Botao>
        <Botao asChild variante="contorno">
          <Link href={ROTAS.recursos}>
            <ArrowLeft aria-hidden="true" />
            Ver os recursos
          </Link>
        </Botao>
      </div>
    </div>
  );
}
