/* Pato vigia — o mascote do topo, vivo.

    Substitui o <img> parado da abertura da home por um pato que
    ACOMPANHA o visitante: uma camada de olhos translada na direção
    do cursor (limitada a poucos pixels pra não sair da órbita), a
    cabeça inclina sutilmente junto, e as pupilas piscam em intervalos
    irregulares. Clique: balão de fala com uma frase do vigia.

    Os olhos ficam posicionados por porcentagem sobre a arte — as
    coordenadas saíram de análise de pixel do pato-mascote.png
    (varredura de luminância da região da cabeça), então se a arte
    trocar é só re-medir e ajustar OLHOS.

    Regras da casa: monocromático (a pupila é sempre #0d0d0d sobre a
    arte clara, visível nos dois temas), GSAP com quickTo igual ao
    resto do site, prefers-reduced-motion devolve o mascote estático. */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { semMovimento } from "@/lib/animacoes";

/** Olhos em % da largura/altura da imagem (medidos na mascote 1254²). */
const OLHOS = [
  { x: 42, y: 24 },
  { x: 52, y: 25 },
];

const FRASES = [
  "tô de olho no cursor.",
  "cata o que precisa aí, o cofre eu vigio.",
  "119 recursos contados e recontados.",
  "aperta / que a busca abre.",
  "sou o vigia oficial daqui.",
  "dormindo? eu? jamais.",
];

export function PatoVigia() {
  const raiz = useRef<HTMLDivElement>(null);
  const olhos = useRef<HTMLDivElement>(null);
  const cabeca = useRef<HTMLDivElement>(null);
  const [fala, setFala] = useState<string | null>(null);
  const [ultima, setUltima] = useState(-1);
  const tempor = useRef<number | null>(null);

  const parado = semMovimento();

  /* Olhos + cabeça seguindo o ponteiro, com quickTo (zero alocação
     por evento) — a mesma disciplina do resto das animações do site. */
  useEffect(() => {
    if (parado) return;
    const alvoOlhos = olhos.current;
    const alvoCabeca = cabeca.current;
    const raizEl = raiz.current;
    if (!alvoOlhos || !alvoCabeca || !raizEl) return;

    const ox = gsap.quickTo(alvoOlhos, "x", { duration: 0.35, ease: "power3" });
    const oy = gsap.quickTo(alvoOlhos, "y", { duration: 0.35, ease: "power3" });
    const cr = gsap.quickTo(alvoCabeca, "rotation", { duration: 0.5, ease: "power2" });
    const cx = gsap.quickTo(alvoCabeca, "x", { duration: 0.5, ease: "power2" });

    const aoMover = (e: PointerEvent) => {
      const r = raizEl.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const nx = Math.max(-1, Math.min(1, dx));
      const ny = Math.max(-1, Math.min(1, dy));
      ox(nx * 5); // órbita das pupilas
      oy(ny * 4);
      cr(nx * 3.5); // cabeça acompanha, sutil
      cx(nx * 2);
    };

    window.addEventListener("pointermove", aoMover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", aoMover);
      gsap.set([alvoOlhos, alvoCabeca], { clearProps: "all" });
    };
  }, [parado]);

  /* Piscadas em intervalo irregular — piscar metronômico parece robô. */
  useEffect(() => {
    if (parado) return;
    let morto = false;
    let timer = 0;

    const piscar = () => {
      if (morto) return;
      const els = raiz.current?.querySelectorAll("[data-pupila]");
      if (els?.length) {
        gsap.to(els, {
          scaleY: 0.1,
          duration: 0.07,
          yoyo: true,
          repeat: 1,
          transformOrigin: "center center",
        });
      }
      timer = window.setTimeout(piscar, 2400 + Math.random() * 3200);
    };
    timer = window.setTimeout(piscar, 1800);
    return () => {
      morto = true;
      window.clearTimeout(timer);
    };
  }, [parado]);

  /* Fala: nunca repete a frase anterior; some sozinha depois de 4s. */
  const falar = () => {
    let i = Math.floor(Math.random() * FRASES.length);
    if (FRASES.length > 1 && i === ultima) i = (i + 1) % FRASES.length;
    setUltima(i);
    setFala(FRASES[i]);
    if (tempor.current) window.clearTimeout(tempor.current);
    tempor.current = window.setTimeout(() => setFala(null), 4000);
  };

  useEffect(
    () => () => {
      if (tempor.current) window.clearTimeout(tempor.current);
    },
    [],
  );

  useEffect(() => {
    if (fala) {
      const b = raiz.current?.querySelector("[data-balao]");
      if (b) gsap.fromTo(b, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2)" });
    }
  }, [fala]);

  if (parado) {
    return (
      <img
        src="/pato-mascote.png"
        alt=""
        width={48}
        height={48}
        className="size-12 shrink-0 object-contain grayscale"
      />
    );
  }

  return (
    <div
      ref={raiz}
      role="button"
      tabIndex={0}
      aria-label="Pato vigia — segue o mouse com os olhos; clique para ouvir uma frase"
      onClick={falar}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && falar()}
      className="relative size-14 shrink-0 cursor-pointer select-none"
    >
      {/* Balão de fala acima do pato */}
      {fala && (
        <div
          data-balao
          aria-live="polite"
          className="absolute -top-11 left-1/2 z-10 w-max max-w-[190px] -translate-x-1/2 rounded-[var(--radius-sm)] border border-hairline bg-ink px-3 py-1.5 text-[11px] leading-snug text-canvas"
        >
          {fala}
          <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-b border-r border-hairline bg-ink" />
        </div>
      )}

      {/* Cabeça inclina junto com o cursor */}
      <div ref={cabeca} className="relative size-full will-change-transform">
        <img
          src="/pato-mascote.png"
          alt=""
          width={56}
          height={56}
          className="size-full object-contain grayscale"
          draggable={false}
        />

        {/* Camada dos olhos: translada na direção do cursor */}
        <div ref={olhos} className="absolute inset-0 will-change-transform">
          {OLHOS.map((o, i) => (
            <span
              key={i}
              data-pupila
              className="absolute block rounded-full bg-[#0d0d0d]"
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: "9%",
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
