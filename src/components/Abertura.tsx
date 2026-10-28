/* Abertura do site — a animação de entrada.

   O véu preto NÃO nasce aqui: ele já vem no index.html, montado antes
   do React, para cobrir a tela no primeiro paint. Montado daqui ele só
   aparecia ~250ms depois, e o efeito virava "conteúdo pisca, então
   tela preta" — o oposto de uma entrada.

   Este componente só:
     1. desenha o pato, o nome e a barra dentro do véu existente;
     2. anima a marca se montando;
     3. remove o véu ao final.

   Se o véu não existir (visita repetida, movimento reduzido, ou o
   script inline desistiu), nada é renderizado. */

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Abertura() {
  // Só anima se o véu do index.html estiver na página.
  const [ativo] = useState(
    () => typeof document !== "undefined" && !!document.getElementById("jbdn-veu"),
  );
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ativo || !scope.current) return;
      const veu = document.getElementById("jbdn-veu");
      if (!veu) return;

      try {
        sessionStorage.setItem("jbdn:abertura", "1");
      } catch {
        /* segue sem persistir */
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          veu.style.opacity = "0";
          veu.style.transition = "opacity .25s ease-out";
          window.setTimeout(() => veu.remove(), 280);
        },
      });

      // A barra roda EM PARALELO com as letras (não depois delas).
      // Antes ela entrava com "-=0.18" e somava 0.4s ao total, o que
      // segurava toda a saída e deixava um vão morto no meio.
      tl.from("[data-abertura-pato]", {
        opacity: 0,
        scale: 0.7,
        rotate: -8,
        duration: 0.38,
        ease: "back.out(2.2)",
      })
        .from(
          "[data-abertura-letra]",
          { opacity: 0, y: 14, duration: 0.3, stagger: 0.022 },
          "-=0.2",
        )
        .fromTo(
          "[data-abertura-barra]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.52, ease: "power2.inOut" },
          "<",
        )
        // O véu sobe assim que a última letra assenta; o conteúdo
        // desaparece junto, sobreposto.
        .to("[data-abertura-conteudo]", { opacity: 0, duration: 0.18, ease: "power2.in" }, ">-0.12")
        .to(veu, { yPercent: -100, duration: 0.46, ease: "power3.inOut" }, "<");

      return () => {
        tl.kill();
      };
    },
    { scope, dependencies: [ativo] },
  );

  if (!ativo) return null;

  return (
    <div ref={scope} className="flex flex-col items-center">
      <img
        data-abertura-pato
        src="/duck.webp"
        alt=""
        width={56}
        height={56}
        className="size-14 object-contain grayscale"
      />
      <div
        data-abertura-conteudo
        className="mt-4 flex items-baseline overflow-hidden will-change-transform"
      >
        {"JailbreakDN".split("").map((letra, i) => (
          <span
            key={i}
            data-abertura-letra
            className="mono text-[22px] font-semibold tracking-tight text-ink sm:text-[26px]"
          >
            {letra}
          </span>
        ))}
      </div>
      <div className="mt-5 h-px w-[132px] overflow-hidden bg-hairline">
        <div
          data-abertura-barra
          className="h-px w-full origin-left bg-ink"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}

/** Portal: monta o conteúdo da abertura DENTRO do véu do index.html. */
export function AberturaNoVeu() {
  const [alvo] = useState<HTMLElement | null>(
    () => (typeof document !== "undefined" ? document.getElementById("jbdn-veu") : null),
  );
  if (!alvo) return null;
  return createPortal(<Abertura />, alvo);
}


