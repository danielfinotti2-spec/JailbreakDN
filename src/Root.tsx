import { useEffect } from "react";
import { usePath } from "@/lib/router";
import { useTheme } from "@/hooks/useTheme";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import NotFound from "@/components/NotFound";
import FloatingNav from "@/components/FloatingNav";

/* ---------------------------------------------------------------
   Route table. Every path the app actually serves is listed here.

   `/produtos` and `/produtos/:slug` resolve; anything else renders the
   404 page with the URL intact. This replaces the old behaviour where
   an unmatched route was silently rewritten to "/" without notifying
   the router, which left the rendered page disagreeing with the URL.
   --------------------------------------------------------------- */

const ROUTES = ["/", "/produtos"] as const;

export default function Root() {
  const path = usePath();
  // Theme is owned here so the document attribute is applied app-wide.
  useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      path === "/" ? "Cofre de TXT · @euodeene" : path.startsWith("/produtos") ? "Produtos · Cofre de TXT" : "Página não encontrada · Cofre de TXT";
  }, [path]);

  const isProducts = path === "/produtos" || path.startsWith("/produtos/");
  const isHome = path === "/";

  if (isHome) return <><Home /><FloatingNav path={path} /></>;
  if (isProducts)
    return (
      <>
        <Products path={path} />
        <FloatingNav path={path} />
      </>
    );

  // Known-but-unhandled paths fall through to 404, same as unknown ones.
  void ROUTES;
  return <NotFound path={path} />;
}
