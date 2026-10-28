/* Cena 3D — o pato mascote em nuvem de pontos.

    O centro da cena é a PRÓPRIA logo: os pixels de pato-mascote.png
    são amostrados num canvas offscreen e viram pontos 3D com
    profundidade. Cada ponto nasce disperso numa casca esférica e
    converge para o lugar da silhueta — a logo se "monta" no ar e
    fica girando em profundidade real em volta do eixo Y.

    Regras da casa respeitadas:
    - monocromático: cor vem do token --ink (re-lida na troca de tema);
    - sem WebGL ou prefers-reduced-motion: o painel não existe;
    - frameloop pausa fora da tela ou com a aba oculta;
    - lazy chunk via React.lazy no "Como funciona";
    - jitter determinístico (sem Math.random): mesma cena a cada visita. */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { semMovimento } from "@/lib/animacoes";

/** Cor do tema em tempo real: relê --ink quando html muda de tema. */
function useCorTema(): string {
  const [cor, setCor] = useState("#f5f5f5");

  useEffect(() => {
    const ler = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--ink")
        .trim();
      if (v) setCor(v);
    };
    ler();
    const obs = new MutationObserver(ler);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    return () => obs.disconnect();
  }, []);

  return cor;
}

/* ---------------------------------------------------------------
   Amostragem da logo
   --------------------------------------------------------------- */

interface PontosPato {
  alvo: Float32Array; // silhueta da logo, extrudada em z
  origem: Float32Array; // dispersão esférica inicial
}

function amostrarImagem(src: string): Promise<PontosPato | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ALTURA = 110;
      const razao = img.width / img.height || 1;
      const w = Math.max(8, Math.round(ALTURA * razao));
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = ALTURA;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, w, ALTURA);
      const { data } = ctx.getImageData(0, 0, w, ALTURA);

      const opacos: number[] = [];
      for (let y = 0; y < ALTURA; y++) {
        for (let x = 0; x < w; x++) {
          if (data[(y * w + x) * 4 + 3] > 128) opacos.push(x, y);
        }
      }
      const N = opacos.length / 2;
      if (!N) return resolve(null);

      const alvo = new Float32Array(N * 3);
      const origem = new Float32Array(N * 3);
      const escala = 4.6 / w; // largura total ~4.6 unidades de cena

      for (let i = 0; i < N; i++) {
        // Silhueta: canvas tem y pra baixo, three pra cima — inverte.
        alvo[i * 3] = (opacos[i * 2] - w / 2) * escala;
        alvo[i * 3 + 1] = (ALTURA / 2 - opacos[i * 2 + 1]) * escala;
        alvo[i * 3 + 2] = Math.sin(i * 7.13) * 0.22; // extrusão determinística

        // Origem: casca esférica, o ponto "vem de longe" até a logo.
        const t = (i / N) * Math.PI * 2;
        const p = Math.acos(1 - (2 * (i + 0.5)) / N);
        const r = 3.4;
        origem[i * 3] = r * Math.sin(p) * Math.cos(t * 3.1);
        origem[i * 3 + 1] = r * Math.cos(p);
        origem[i * 3 + 2] = r * Math.sin(p) * Math.sin(t * 3.1);
      }
      resolve({ alvo, origem });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function usePontosPato(): PontosPato | null {
  const [pontos, setPontos] = useState<PontosPato | null>(null);

  useEffect(() => {
    let vivo = true;
    // Mascote primeiro; se faltar por qualquer motivo, cai pro duck.webp.
    amostrarImagem("/pato-mascote.png").then((p) => {
      if (p) {
        if (vivo) setPontos(p);
      } else {
        amostrarImagem("/duck.webp").then((q) => vivo && q && setPontos(q));
      }
    });
    return () => {
      vivo = false;
    };
  }, []);

  return pontos;
}

/* ---------------------------------------------------------------
   O pato: converge da esfera para a silhueta e gira devagar
   --------------------------------------------------------------- */

function Pato({ cor }: { cor: string }) {
  const dados = usePontosPato();
  const ref = useRef<THREE.Points>(null!);
  const progresso = useRef(0);
  // Buffer exibido começa na dispersão; o frame mixer vai interpolando.
  const inicial = useMemo(
    () => (dados ? new Float32Array(dados.origem) : null),
    [dados],
  );

  useFrame((_, delta) => {
    if (!ref.current || !dados) return;
    ref.current.rotation.y += delta * 0.28;

    if (progresso.current >= 1) return;
    progresso.current = Math.min(1, progresso.current + delta / 1.6);
    const e = 1 - Math.pow(1 - progresso.current, 3); // easeOutCubic
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < arr.length; i++) {
      arr[i] = dados.origem[i] + (dados.alvo[i] - dados.origem[i]) * e;
    }
    attr.needsUpdate = true;
  });

  if (!dados || !inicial) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[inicial, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.038} color={cor} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

/** Casca de fundo: pontos orbitando ao contrário, mais fracos que o pato. */
function Particulas({ cor }: { cor: string }) {
  const pontos = useRef<THREE.Points>(null!);

  const posicoes = useMemo(() => {
    const N = 700;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const p = Math.acos(1 - (2 * (i + 0.5)) / N);
      const r = 2.8 + Math.sin(i * 12.9898) * 0.12;
      arr[i * 3] = r * Math.sin(p) * Math.cos(t * 2.7);
      arr[i * 3 + 1] = r * Math.cos(p);
      arr[i * 3 + 2] = r * Math.sin(p) * Math.sin(t * 2.7);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    pontos.current.rotation.y -= delta * 0.045;
    pontos.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={pontos}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posicoes, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color={cor} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

/** Grupo: entrada por escala + tilt amortecido seguindo o ponteiro. */
function GrupoCena({ cor }: { cor: string }) {
  const grupo = useRef<THREE.Group>(null!);

  useEffect(() => {
    const g = grupo.current;
    g.scale.setScalar(0.001);
    const tw = gsap.to(g.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.1,
      ease: "power3.out",
      delay: 0.15,
    });
    return () => {
      tw.kill();
    };
  }, []);

  useFrame((state, delta) => {
    const g = grupo.current;
    const k = 1 - Math.pow(0.001, delta);
    const alvoX = state.pointer.y * -0.2;
    const alvoY = state.pointer.x * 0.28;
    g.rotation.x += (alvoX - g.rotation.x) * k;
    g.rotation.y += (alvoY - g.rotation.y) * k;
  });

  return (
    <group ref={grupo}>
      <Pato cor={cor} />
      <Particulas cor={cor} />
    </group>
  );
}

export default function Cena3D() {
  const cor = useCorTema();
  const envolope = useRef<HTMLDivElement>(null);
  const [naTela, setNaTela] = useState(true);
  const [abaVisivel, setAbaVisivel] = useState(true);

  const [webgl] = useState(() => {
    try {
      if (typeof document === "undefined") return false;
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const el = envolope.current;
    const io = new IntersectionObserver(([e]) => setNaTela(e.isIntersecting), {
      threshold: 0.05,
    });
    if (el) io.observe(el);
    const aoMudarAba = () => setAbaVisivel(!document.hidden);
    document.addEventListener("visibilitychange", aoMudarAba);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", aoMudarAba);
    };
  }, []);

  if (semMovimento() || !webgl) return null;

  return (
    <div
      ref={envolope}
      aria-hidden="true"
      className="relative mt-4 h-[280px] overflow-hidden rounded-[var(--radius-sm)] border border-hairline bg-surface"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={naTela && abaVisivel ? "always" : "never"}
      >
        <GrupoCena cor={cor} />
      </Canvas>
      <p className="pointer-events-none absolute bottom-2 left-3 mono text-[10px] text-ink-4">
        o pato, em pontos — cena ambiental
      </p>
      <p className="pointer-events-none absolute bottom-2 right-3 mono text-[10px] text-ink-4">
        three + r3f
      </p>
    </div>
  );
}
