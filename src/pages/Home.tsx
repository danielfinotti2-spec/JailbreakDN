import { Suspense, lazy } from "react";
import Hero from "@/components/Hero";
import Player from "@/components/Player";

/* Everything below the fold is deferred: the prompt corpus is ~400 KB of
   text and the catalog pulls a large icon set. The hero paints first. */
const Catalog = lazy(() => import("@/components/Catalog"));
const PromptLibrary = lazy(() => import("@/components/PromptLibrary"));
const Footer = lazy(() => import("@/components/Footer"));

function SectionSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20" aria-busy="true" aria-live="polite">
      <div className="h-8 w-56 animate-pulse rounded bg-surface-2" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-[var(--radius-md)] bg-surface-2" />
        ))}
      </div>
      <span className="sr-only">Carregando seção</span>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <section id="apresentacao" className="mx-auto w-full max-w-6xl px-5 pb-20">
        <Player />
      </section>
      <Suspense fallback={<SectionSkeleton />}>
        <Catalog />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <PromptLibrary />
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </main>
  );
}
