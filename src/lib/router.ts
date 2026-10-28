import { useCallback, useEffect, useState } from "react";

/* ---------------------------------------------------------------
   Router mínimo sobre a History API.

   Rotas servidas:
     /                 início
     /recursos         catálogo completo com filtros
     /recurso/:id      detalhe de um recurso (URL compartilhável)
     /favoritos        atalho para o catálogo filtrado
     /categoria/:id    atalho para o catálogo por categoria

   Toda navegação passa por `navigate`, que sempre dispara o evento —
   assim o que está renderizado nunca discorda da barra de endereços.
   --------------------------------------------------------------- */

const PATH_EVENT = "app:pathchange";

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (to === window.location.pathname + window.location.search) return;
  if (opts.replace) window.history.replaceState({}, "", to);
  else window.history.pushState({}, "", to);
  window.dispatchEvent(new Event(PATH_EVENT));
}

export function usePath(): string {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener("popstate", sync);
    window.addEventListener(PATH_EVENT, sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(PATH_EVENT, sync);
    };
  }, []);
  return path;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/**
 * Handler para links internos. Respeita cliques com modificador para
 * que ctrl+clique / abrir em nova aba continuem funcionando.
 */
export function useNavHandler() {
  return useCallback((e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (to.startsWith("#")) {
      const id = to.slice(1);
      if (window.location.pathname !== "/") {
        navigate("/");
        requestAnimationFrame(() => setTimeout(() => scrollToId(id), 60));
      } else {
        scrollToId(id);
        window.history.replaceState({}, "", `/${to}`);
      }
      return;
    }
    navigate(to);
    window.scrollTo({ top: 0 });
  }, []);
}

/** href real de um destino interno, para o link ser copiável. */
export const hrefOf = (to: string) => (to.startsWith("#") ? `/${to}` : to);

export const ROTAS = {
  inicio: "/",
  recursos: "/recursos",
  favoritos: "/favoritos",
  recurso: (id: string) => `/recurso/${id}`,
  categoria: (id: string) => `/categoria/${id}`,
} as const;
