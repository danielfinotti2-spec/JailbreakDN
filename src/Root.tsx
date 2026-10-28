import { useEffect } from "react";
import { usePath } from "@/lib/router";
import { useTheme } from "@/hooks/useTheme";
import { LibraryProvider } from "@/hooks/useLibrary";
import { useTransicaoPagina } from "@/lib/animacoes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AberturaNoVeu } from "@/components/Abertura";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import Destaques from "@/pages/Destaques";
import Jailbreaks from "@/pages/Jailbreaks";
import PromptsPage, { PromptPage } from "@/pages/Prompts";
import Categorias, { CategoriaPage, GrupoPage } from "@/pages/Categorias";
import { ResourceDetailRoute } from "@/pages/ResourceDetail";
import NotFound from "@/components/NotFound";
import type { GrupoId } from "@/data/categorias";
import { recursoPorId } from "@/data/links";

/* ---------------------------------------------------------------
   Tabela de rotas.

   Toda rota servida está listada aqui; qualquer outra cai no 404 com
   a URL preservada. O <title> acompanha a rota para que abas e
   histórico não fiquem todos iguais.
   --------------------------------------------------------------- */

const TITULOS: Record<string, string> = {
  "/": "JailbreakDN — diretório de recursos",
  "/recursos": "Todos os recursos · JailbreakDN",
  "/favoritos": "Favoritos · JailbreakDN",
  "/categorias": "Categorias · JailbreakDN",
  "/destaques": "Destaques · JailbreakDN",
  "/jailbreaks": "Jailbreaks · JailbreakDN",
  "/prompts": "Prompts · JailbreakDN",
};

function Pagina({ path }: { path: string }) {
  if (path === "/") return <Home />;
  if (path === "/recursos" || path === "/favoritos") return <Catalog />;
  if (path === "/categorias") return <Categorias />;
  if (path === "/destaques") return <Destaques />;
  if (path === "/jailbreaks") return <Jailbreaks />;
  if (path === "/prompts") return <PromptsPage />;

  const detalhe = path.match(/^\/recurso\/([\w-]+)\/?$/);
  if (detalhe) return <ResourceDetailRoute id={detalhe[1]} />;

  const prompt = path.match(/^\/prompt\/(\d+)\/?$/);
  if (prompt) return <PromptPage id={prompt[1]} />;

  const grupo = path.match(/^\/grupo\/([\w-]+)\/?$/);
  if (grupo) return <GrupoPage id={grupo[1] as GrupoId} />;

  // /categoria/ia cai no grupo; /categoria/<sub> na subcategoria.
  const cat = path.match(/^\/categoria\/([\w-]+)\/?$/);
  if (cat) return <CategoriaPage id={cat[1]} />;

  return <NotFound path={path} />;
}

export default function Root() {
  const path = usePath();
  useTheme();
  const mainRef = useTransicaoPagina<HTMLElement>(path);

  useEffect(() => {
    window.scrollTo(0, 0);
    const detalhe = path.match(/^\/recurso\/([\w-]+)\/?$/);
    const nome = detalhe ? recursoPorId(detalhe[1])?.nome : undefined;
    const ehPrompt = /^\/prompt\/\d+\/?$/.test(path);
    document.title = detalhe
      ? `${nome ?? "Recurso"} · JailbreakDN`
      : ehPrompt
        ? "Prompt · JailbreakDN"
        : (TITULOS[path] ?? "Página não encontrada · JailbreakDN");
  }, [path]);

  return (
    <LibraryProvider>
      <AberturaNoVeu />
      <div className="flex min-h-dvh flex-col">
        <a
          href="#conteudo"
          className="fixed left-3 top-3 z-[100] -translate-y-[200%] rounded-[var(--radius-sm)] bg-ink px-3 py-1.5 text-[12px] font-medium text-canvas focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>

        <Header />

        <main id="conteudo" ref={mainRef} className="flex-1">
          <Pagina path={path} />
        </main>

        <Footer />
      </div>
    </LibraryProvider>
  );
}





