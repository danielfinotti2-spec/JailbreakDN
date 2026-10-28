/* Cabeçalho fixo — marca, busca, categorias e tema.

   O campo de busca escreve direto no estado compartilhado
   (useLibrary). Ele NUNCA é limpo ao trocar de seção: o valor vive no
   provider, acima das rotas.

   Desktop: marca, busca elástica e navegação em uma linha.
   Mobile: marca + busca visível (é o controle mais usado) e um botão
   que abre a navegação em painel. */

import { useEffect, useRef, useState } from "react";
import { Menu, Search, Sun, Moon, X, Heart } from "lucide-react";
import { Link } from "@/components/ui/linkInterno";
import { useLibrary } from "@/hooks/useLibrary";
import { useTheme } from "@/hooks/useTheme";
import { navigate, ROTAS, usePath } from "@/lib/router";
import { GRUPOS } from "@/data/categorias";
import { RESOURCES } from "@/data/links";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Início", href: ROTAS.inicio },
  { label: "Destaques", href: "/destaques" },
  { label: "IA grátis", href: "/categoria/ia-gratis" },
  { label: "APIs", href: "/grupo/apis" },
  { label: "Ghidra / RE", href: "/categoria/ghidra" },
  { label: "Prompts", href: "/prompts" },
];

export default function Header() {
  const { busca, setBusca, favoritos } = useLibrary();
  const { mode: tema, toggle: alternarTema } = useTheme();
  const path = usePath();
  const [menuAberto, setMenuAberto] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fecha o painel ao navegar.
  useEffect(() => setMenuAberto(false), [path]);

  // Esc fecha; com o painel aberto, o fundo não rola.
  useEffect(() => {
    if (!menuAberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [menuAberto]);

  // Atalho "/" foca a busca, sem roubar o atalho de quem está digitando.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      const digitando =
        alvo && (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA" || alvo.isContentEditable);
      if (e.key === "/" && !digitando && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  const aoEnviarBusca = (e: React.FormEvent) => {
    e.preventDefault();
    // A busca só navega; o texto permanece intacto no estado.
    if (path !== "/recursos") navigate("/recursos");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <div className="container-page">
        <div className="flex h-14 items-center gap-3">
          {/* Marca */}
          <Link
            href={ROTAS.inicio}
            className="flex shrink-0 items-center gap-2"
            aria-label="JailbreakDN — início"
          >
            <img
              src="/duck.webp"
              alt=""
              width={22}
              height={22}
              className="size-[22px] object-contain grayscale"
            />
            <span className="mono text-[13.5px] font-semibold tracking-tight text-ink">
              JailbreakDN
            </span>
          </Link>

          {/* Busca */}
          <form
            role="search"
            onSubmit={aoEnviarBusca}
            className="relative ml-1 min-w-0 flex-1 md:max-w-md"
          >
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-4"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") aoEnviarBusca(e);
              }}
              placeholder="Buscar recursos…"
              aria-label="Buscar recursos"
              className="h-8 w-full rounded-[var(--radius-sm)] border border-hairline bg-surface pl-8 pr-7 text-[12.5px] text-ink placeholder:text-ink-4 focus:border-hairline-2 focus:bg-surface-2 focus:outline-none"
            />
            {busca && (
              <button
                type="button"
                onClick={() => {
                  setBusca("");
                  inputRef.current?.focus();
                }}
                aria-label="Limpar busca"
                className="absolute right-1.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-ink-4 hover:text-ink"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            )}
          </form>

          {/* Navegação desktop */}
          <nav aria-label="Categorias" className="ml-auto hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => {
              const ativo = path === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-[var(--radius-xs)] px-2 py-1.5 text-[12px] transition-colors",
                    ativo ? "text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                  )}
                  aria-current={ativo ? "page" : undefined}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* Favoritos + tema */}
          <div className="ml-auto flex items-center gap-0.5 lg:ml-1">
            <Link
              href={ROTAS.favoritos}
              className="relative grid size-8 place-items-center rounded-[var(--radius-xs)] text-ink-2 hover:bg-surface-2 hover:text-ink"
              aria-label={`Favoritos${favoritos.length ? ` (${favoritos.length})` : ""}`}
              title="Favoritos"
            >
              <Heart className="size-4" aria-hidden="true" />
              {favoritos.length > 0 && (
                <span className="mono absolute -right-0.5 -top-0.5 grid min-w-[14px] place-items-center rounded-full bg-ink px-1 text-[9px] font-semibold leading-[14px] text-canvas">
                  {favoritos.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={alternarTema}
              aria-label={tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              title={tema === "dark" ? "Tema claro" : "Tema escuro"}
              className="grid size-8 place-items-center rounded-[var(--radius-xs)] text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              {tema === "dark" ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuAberto}
              aria-controls="menu-mobile"
              className="grid size-8 place-items-center rounded-[var(--radius-xs)] text-ink-2 hover:bg-surface-2 hover:text-ink lg:hidden"
            >
              {menuAberto ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Painel de navegação mobile */}
      {menuAberto && (
        <div
          id="menu-mobile"
          className="fade-in absolute inset-x-0 top-full max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-hairline bg-canvas lg:hidden"
        >
          <div className="container-page py-4">
            <p className="label-caps">Navegar</p>
            <ul className="mt-2">
              {[{ label: "Início", href: ROTAS.inicio }, { label: "Destaques", href: "/destaques" }, { label: "Todos os recursos", href: "/recursos" },
                { label: "Favoritos", href: ROTAS.favoritos }, { label: "Prompts", href: "/prompts" }].map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="block border-b border-hairline py-2.5 text-[13px] text-ink"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="label-caps mt-5">Categorias</p>
            <ul className="mt-2">
              {GRUPOS.map((g) => {
                const qtd = RESOURCES.filter((r) =>
                  g.subcategorias.some((s) => s.id === r.subcategoriaId),
                ).length;
                return (
                  <li key={g.id}>
                    <Link
                      href={`/grupo/${g.id}`}
                      className="flex items-baseline justify-between border-b border-hairline py-2.5 text-[13px] text-ink"
                    >
                      <span>{g.nome}</span>
                      <span className="mono text-[11px] text-ink-4">{qtd}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="label-caps mt-5">Mais acessados</p>
            <ul className="mt-2">
              <li>
                <Link href="/categoria/ia-gratis" className="block border-b border-hairline py-2.5 text-[13px] text-ink">
                  IA grátis
                </Link>
              </li>
              <li>
                <Link href="/categoria/apis-gratis" className="block border-b border-hairline py-2.5 text-[13px] text-ink">
                  APIs gratuitas
                </Link>
              </li>
              <li>
                <Link href="/categoria/ghidra" className="block border-b border-hairline py-2.5 text-[13px] text-ink">
                  Ghidra e Ghidra MCP
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}




