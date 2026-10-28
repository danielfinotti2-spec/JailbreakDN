/* Cena 3D — painel ambiental monocromático.

    O site não tem hero nem decoração solta; este painel é a exceção
    consciente, embutida no "Como funciona" como um respiro técnico:
    um torus knot em wireframe (o "nó do cofre") dentro de uma casca
    de partículas, tudo em --ink sobre fundo transparente.

    Regras da casa respeitadas:
    - monocromático: a cor vem do token --ink do tema vigente e é
      re-lida quando o tema troca (dark/light), nunca cor de acento;
    - movimento estrutural: rotação lenta constante + tilt que segue
      o ponteiro com amortecimento exponencial;
    - entrada por escala via GSAP, mesma gramática de lib/animacoes;
    - sem WebGL ou prefers-reduced-motion: renderiza NADA (o painel
      some em vez de virar quadro parado);
    - frameloop pausa quando o painel sai da tela ou a aba fica oculta;
    - chunk separado: o import em ComoFunciona é React.lazy, então o
      three só baixa quando a home monta a seção. */

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

/** O nó: wireframe girando devagar, sem brilho, sem cor própria. */
function No({ cor }: { cor: string }) {
  const malha = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    malha.current.rotation.y += delta * 0.16;
    malha.current.rotation.z += delta * 0.033;
  });

  return (
    <mesh ref={malha}>
      <torusKnotGeometry args={[1.35, 0.38, 220, 28]} />
      <meshBasicMaterial color={cor} wireframe transparent opacity={0.28} />
    </mesh>
  );
}

/** Casca de ~900 pontos num invólucro esférico irregular, giro inverso. */
function Particulas({ cor }: { cor: string }) {
  const pontos = useRef<THREE.Points>(null!);

  const posicoes = useMemo(() => {
    const N = 900;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const p = Math.acos(1 - (2 * (i + 0.5)) / N);
      const jitter = Math.sin(i * 12.9898) * 0.09; // determinístico, sem Math.random
      const r = 2.55 + jitter;
      arr[i * 3] = r * Math.sin(p) * Math.cos(t * 2.7);
      arr[i * 3 + 1] = r * Math.cos(p);
      arr[i * 3 + 2] = r * Math.sin(p) * Math.sin(t * 2.7);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    pontos.current.rotation.y -= delta * 0.05;
    pontos.current.rotation.x += delta * 0.011;
  });

  return (
    <points ref={pontos}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posicoes, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={cor} transparent opacity={0.5} sizeAttenuation />
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
    // Amortecimento independente de frame rate (k→1 suaviza, não acelera).
    const k = 1 - Math.pow(0.001, delta);
    const alvoX = state.pointer.y * -0.22;
    const alvoY = state.pointer.x * 0.32;
    g.rotation.x += (alvoX - g.rotation.x) * k;
    g.rotation.y += (alvoY - g.rotation.y) * k;
  });

  return (
    <group ref={grupo}>
      <No cor={cor} />
      <Particulas cor={cor} />
    </group>
  );
}

export default function Cena3D() {
  const cor = useCorTema();
  const envolope = useRef<HTMLDivElement>(null);
  const [naTela, setNaTela] = useState(true);
  const [abaVisivel, setAbaVisivel] = useState(true);

  // Guard de WebGL: estado inicial já com o veredito, sem efeito.
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

  // As saídas silenciosas da casa: movimento reduzido ou GPU ausente
  // não viram placeholder — o painel simplesmente não existe.
  if (semMovimento() || !webgl) return null;

  return (
    <div
      ref={envolope}
      aria-hidden="true"
      className="relative mt-4 h-[240px] overflow-hidden rounded-[var(--radius-sm)] border border-hairline bg-surface"
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
        o cofre, emaranhado — cena ambiental
      </p>
      <p className="pointer-events-none absolute bottom-2 right-3 mono text-[10px] text-ink-4">
        three + r3f
      </p>
    </div>
  );
}
