import { useCallback, useEffect, useRef, useState } from "react";

/* ---------------------------------------------------------------
   Minimal History-API router.

   This replaces the original lib/nav.js. The old version could change
   the URL without notifying listeners (Root.jsx called
   history.replaceState directly), which left the rendered page out of
   sync with location.pathname. Every navigation now flows through one
   function that always dispatches.
   --------------------------------------------------------------- */

const PATH_EVENT = "app:pathchange";

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (to === window.location.pathname) return;
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

/** Scroll a section into view, matching the sticky header offset. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/**
 * Click handler for in-app links. Honours modifier clicks so
 * middle-click / ctrl-click / new-tab still work natively.
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
        // Wait for the home route to mount before scrolling.
        requestAnimationFrame(() => setTimeout(() => scrollToId(id), 60));
      } else {
        scrollToId(id);
        window.history.replaceState({}, "", `#${id}`);
      }
      return;
    }
    navigate(to);
    window.scrollTo({ top: 0 });
  }, []);
}

/** The href a section link should carry so it is copyable and openable. */
export const hrefOf = (to: string) => (to.startsWith("#") ? `/${to}` : to);

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
