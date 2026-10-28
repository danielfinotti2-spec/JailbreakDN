import { useState, type MouseEvent } from "react";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { PRODUCTS, type Product } from "@/data/products";
import { useNavHandler } from "@/lib/router";

/* Contact channel for buyers. Left unset on purpose: no number is invented. */
const CONTACT_URL = "";

const brl = (n: number) =>
  n > 0 ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Grátis";

function Rows() {
  return (
    <>
      <header className="border-b border-hairline pb-4">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">Produtos</h2>
        <p className="mt-2 text-sm text-ink-2">
          {PRODUCTS.length} itens publicados. Nenhum pagamento é processado neste site.
        </p>
      </header>

      {PRODUCTS.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-md)] border border-dashed border-hairline p-12 text-center">
          <ShoppingBag className="mx-auto size-8 text-ink-3" aria-hidden="true" />
          <p className="mt-4 text-sm font-medium text-ink">A loja está vazia</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">
            Nada foi publicado ainda. Enquanto isso, a biblioteca de prompts segue disponível de
            graça.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <a href="/#textos">Ver prompts</a>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <a
              key={p.slug}
              href={`/produtos/${p.slug}`}
              className="group flex flex-col gap-2 rounded-[var(--radius-md)] border border-hairline bg-surface p-4 transition-[border-color,box-shadow] hover:border-ink/20 hover:shadow-[var(--shadow-soft)]"
            >
              <span className="grid aspect-square place-items-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--warm-soft)]">
                <img src="/duck.webp" alt="" className="w-3/5" />
              </span>
              <b className="text-sm font-semibold text-ink">{p.title}</b>
              <span className="text-xs text-ink-3">{brl(p.price)}</span>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function Detail({ p }: { p: Product }) {
  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div className="grid aspect-[4/5] place-items-center overflow-hidden rounded-[var(--radius-lg)] bg-[var(--warm-soft)]">
        <img src="/duck.webp" alt={p.title} className="w-3/4" />
      </div>
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">{p.title}</h2>
        <p className="mt-3 text-2xl font-semibold text-ink">{brl(p.price)}</p>
        <p className="mt-1 text-xs text-ink-3">Arquivo digital, entrega por download</p>

        {!!p.tags?.length && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <span key={t} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-ink-2">
                {t}
              </span>
            ))}
          </div>
        )}

        <p className="mt-5 text-sm leading-relaxed text-ink-2">{p.desc}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild size="lg">
            {/* External checkout — the site never handles payment data. */}
            <a href={p.buy} target="_blank" rel="noopener noreferrer">
              Comprar agora
            </a>
          </Button>
          {/* Rendered only when a real contact channel is configured, so the
              button can never point at an empty or placeholder destination. */}
          {CONTACT_URL && (
            <Button asChild size="lg" variant="outline">
              <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                Falar com o vendedor
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Shop({ path }: { path: string }) {
  const onNav = useNavHandler();
  const [toast] = useState("");
  const slug = path.split("/")[2];
  const product = slug ? PRODUCTS.find((x) => x.slug === slug) : undefined;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-28 pt-20">
      <nav aria-label="Caminho" className="mb-6 flex items-center gap-2 text-sm text-ink-3">
        <a
          href="/produtos"
          onClick={(e: MouseEvent<HTMLAnchorElement>) => onNav(e, "/produtos")}
          className="hover:text-ink"
        >
          Produtos
        </a>
        {product && (
          <>
            <span aria-hidden="true">/</span>
            <span className="text-ink">{product.title}</span>
          </>
        )}
      </nav>

      {product ? <Detail p={product} /> : <Rows />}
      {toast && <div role="status">{toast}</div>}
    </section>
  );
}


