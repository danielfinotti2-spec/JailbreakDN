/* Cena 3D — o pato em profundidade real, no "Como funciona".

    O centro é o MESMO BustoPato do topo (components/Pato3D): um
    modelo só, dois contextos. Aqui ele cresce e fica dentro de uma
    casca de pontos orbitando ao contrário, com a entrada por escala
    e o tilt amortecido do grupo seguindo o ponteiro.

    Regras da casa respeitadas:
    - monocromático: pato em cinzas neutras fixas (a mesma identidade
      grayscale da logo), casca na cor --ink do tema;
    - sem WebGL ou prefers-reduced-motion: o painel não existe;
    - frameloop pausa fora da tela ou com a aba oculta;
    - lazy chunk via React.lazy no "Como funciona". */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { semMovimento } from "@/lib/animacoes";
import { BustoPato } from "@/components/Pato3D";

/** Cor do tema em tempo real (casca de pontos): relê --ink. */
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

/** Casca ao redor do pato: pontos em invólucro esférico, giro inverso. */
function Particulas({ cor }: { cor: string }) {
  const pontos = useRef<THREE.Points>(null!);

  const posicoes = useMemo(() => {
    const N = 700;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const p = Math.acos(1 - (2 * (i + 0.5)) / N);
      const r = 2.7 + Math.sin(i * 12.9898) * 0.12;
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
      <BustoPato escala={1.05} />
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
        camera={{ position: [0, 0.4, 6.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={naTela && abaVisivel ? "always" : "never"}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2.5, 4, 4]} intensity={1.25} />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        <GrupoCena cor={cor} />
      </Canvas>
      <p className="pointer-events-none absolute bottom-2 left-3 mono text-[10px] text-ink-4">
        o pato, em 3D — cena ambiental
      </p>
      <p className="pointer-events-none absolute bottom-2 right-3 mono text-[10px] text-ink-4">
        three + r3f
      </p>
    </div>
  );
}
