/* Animações — GSAP.

   O diretório precisa ser rápido de ler, então o movimento aqui é
   *estrutural*: mostra a ordem das coisas em vez de decorar. Seis
   gestos, e nada além disso:

   1. Entrada em cascata — as linhas sobem 10px e aparecem. As
      primeiras animam na carga; as demais via ScrollTrigger, quando
      entram na tela.
   2. Contador da marca — números sobem do zero uma vez.
   3. Realce deslizante na navegação de grupos.
   4. Hover da linha — deslocamento curto + halo que segue o cursor.
   5. Transição de página.
   6. Pressão no clique dos botões.

   Tudo respeita `prefers-reduced-motion`: nesse caso nenhuma animação
   é criada e o conteúdo nasce visível. */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const semMovimento = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------
   1. Entrada em cascata
   --------------------------------------------------------------- */

export function useEntradaEmCascata<T extends HTMLElement>(deps: unknown[] = []) {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const alvos = gsap.utils.toArray<HTMLElement>("[data-recurso]", scope.current);
      if (!alvos.length) return;

      if (semMovimento()) {
        gsap.set(alvos, { opacity: 1, y: 0 });
        return;
      }

      // O estado inicial vem do JS, não do CSS: sem script o conteúdo
      // aparece normalmente, em vez de ficar invisível.
      gsap.set(alvos, { opacity: 0, y: 10 });

      const primeiraLeva = alvos.slice(0, 12);

      gsap.to(primeiraLeva, {
        opacity: 1,
        y: 0,
        duration: 0.42,
        ease: "power2.out",
        stagger: 0.028,
        overwrite: true,
      });

      if (alvos.length > primeiraLeva.length) {
        ScrollTrigger.batch(alvos.slice(12), {
          start: "top 96%",
          once: true,
          onEnter: (lote) =>
            gsap.to(lote, {
              opacity: 1,
              y: 0,
              duration: 0.38,
              ease: "power2.out",
              stagger: 0.03,
              overwrite: true,
            }),
        });
      }
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  );

  return scope;
}

/* ---------------------------------------------------------------
   2. Contador
   --------------------------------------------------------------- */

export function useContador<T extends HTMLElement>(valor: number) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (semMovimento()) {
        el.textContent = String(valor);
        return;
      }
      const estado = { n: 0 };
      const tween = gsap.to(estado, {
        n: valor,
        duration: 1.1,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = String(Math.round(estado.n));
        },
      });
      return () => tween.kill();
    },
    { dependencies: [valor] },
  );

  return ref;
}

/* ---------------------------------------------------------------
   3. Realce deslizante
   --------------------------------------------------------------- */

export function useRealceDeslizante<T extends HTMLElement>(
  chave: unknown,
  obterAtivo: () => HTMLElement | null,
) {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const raiz = scope.current;
      const barra = raiz?.querySelector<HTMLElement>("[data-realce]");
      if (!raiz || !barra) return;

      const ativo = obterAtivo();
      if (!ativo) {
        gsap.to(barra, { opacity: 0, duration: 0.15 });
        return;
      }

      const pai = raiz.getBoundingClientRect();
      const r = ativo.getBoundingClientRect();
      const destino = {
        x: r.left - pai.left,
        y: r.top - pai.top,
        width: r.width,
        height: r.height,
      };

      if (semMovimento()) {
        gsap.set(barra, { opacity: 1, ...destino });
        return;
      }

      gsap.to(barra, { opacity: 1, ...destino, duration: 0.32, ease: "power3.out" });
    },
    { scope, dependencies: [chave] },
  );

  return scope;
}

/* ---------------------------------------------------------------
   4. Halo seguindo o cursor + deslocamento da linha
   --------------------------------------------------------------- */

export function useRealceSeguindoCursor<T extends HTMLElement>(ativo: boolean) {
  const scope = useRef<T>(null);

  useEffect(() => {
    const raiz = scope.current;
    if (!raiz || !ativo || semMovimento()) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let frame = 0;
    let alvo: HTMLElement | null = null;
    let x = 0;
    let y = 0;

    const pintar = () => {
      frame = 0;
      if (!alvo) return;
      const r = alvo.getBoundingClientRect();
      alvo.style.setProperty("--mx", `${x - r.left}px`);
      alvo.style.setProperty("--my", `${y - r.top}px`);
    };

    const sair = (linha: HTMLElement) => {
      gsap.to(linha, { x: 0, duration: 0.4, ease: "power3.out", overwrite: true });
      linha.classList.remove("realcando");
    };

    const aoMover = (e: PointerEvent) => {
      const linha = (e.target as HTMLElement).closest<HTMLElement>("[data-recurso]");

      if (linha !== alvo) {
        if (alvo) sair(alvo);
        alvo = linha;
        if (alvo) {
          alvo.classList.add("realcando");
          gsap.to(alvo, { x: 2, duration: 0.28, ease: "power2.out", overwrite: true });
        }
      }

      if (!alvo) return;
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(pintar);
    };

    const aoSair = () => {
      if (alvo) sair(alvo);
      alvo = null;
    };

    raiz.addEventListener("pointermove", aoMover, { passive: true });
    raiz.addEventListener("pointerleave", aoSair);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      raiz.removeEventListener("pointermove", aoMover);
      raiz.removeEventListener("pointerleave", aoSair);
      aoSair();
    };
  }, [ativo]);

  return scope;
}

/* ---------------------------------------------------------------
   5. Transição de página
   --------------------------------------------------------------- */

export function useTransicaoPagina<T extends HTMLElement>(chave: string) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || semMovimento()) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "transform" },
      );
    },
    { dependencies: [chave] },
  );

  return ref;
}
