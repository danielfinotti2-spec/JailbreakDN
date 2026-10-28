/* Pato 3D — o mascote modelado em primitivas, zero imagem.

    Depois de duas tentativas com a arte 2D (pontos amostrados e
    pupilas sobrepostas, ambas reprovadas pelo dono), o mascote vira
    GEOMETRIA: corpo, cabeça, bico, olhos, tufo e rabo em primitivas
    three.js, tudo em tons neutros de cinza (a mesma identidade do
    pato grayscale do site), com dois tons fixos que funcionam nos
    dois temas — sem variável de cor, sem tema.

    Peças exportadas:
    - <BustoPato/>: o modelo (uso no vigia E na cena ambiental);
    - default <PatoVigia3D/>: canvas pequeno do topo que segue o
      cursor com a cabeça e pisca em intervalo irregular.

    Reduced-motion ou sem WebGL: cai pro mascote estático em <img>,
    como estava antes de qualquer vigia — nada some da página. */

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { semMovimento } from "@/lib/animacoes";

/* Paleta neutra fixa — independente de tema, como a arte grayscale. */
const CORPO = "#c9c9c9";
const BICO = "#8f8f8f";
const OLHO = "#0d0d0d";

/** Ponteiro normalizado (-1..1 na janela), sem re-render. */
function usePonteiro() {
  const alvo = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const f = (e: PointerEvent) => {
      alvo.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      alvo.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", f, { passive: true });
    return () => window.removeEventListener("pointermove", f);
  }, []);
  return alvo;
}

/** Cabeça: esfera + bico achatado + olhos que piscam + tufo. */
function Cabeca({
  rastreando,
}: {
  rastreando: React.RefObject<{ x: number; y: number }> | null;
}) {
  const cabeca = useRef<THREE.Group>(null!);
  const olhoEsq = useRef<THREE.Mesh>(null!);
  const olhoDir = useRef<THREE.Mesh>(null!);

  /* Piscadas irregulares — metrônomo parece robô. */
  useEffect(() => {
    let morto = false;
    let timer = 0;
    const piscar = () => {
      if (morto) return;
      const els = [olhoEsq.current, olhoDir.current].filter(Boolean);
      if (els.length) {
        gsap.to(els.map((m) => m.scale), {
          y: 0.12,
          duration: 0.08,
          yoyo: true,
          repeat: 1,
        });
      }
      timer = window.setTimeout(piscar, 2600 + Math.random() * 3400);
    };
    timer = window.setTimeout(piscar, 2200);
    return () => {
      morto = true;
      window.clearTimeout(timer);
    };
  }, []);

  useFrame((_, delta) => {
    if (!rastreando?.current) return;
    const k = 1 - Math.pow(0.001, delta); // amortecimento por frame rate
    const alvoY = rastreando.current.x * 0.55; // gira pro lado do cursor
    const alvoX = rastreando.current.y * 0.3; // e olha pra baixo/cima
    cabeca.current.rotation.y += (alvoY - cabeca.current.rotation.y) * k;
    cabeca.current.rotation.x += (alvoX - cabeca.current.rotation.x) * k;
  });

  return (
    <group ref={cabeca} position={[0, 0.55, 0]}>
      {/* esfera da cabeça */}
      <mesh position={[0, 0.5, 0]} scale={[0.95, 1.02, 0.95]}>
        <sphereGeometry args={[0.82, 48, 32]} />
        <meshStandardMaterial color={CORPO} roughness={0.75} />
      </mesh>

      {/* bico: elipsoide achatada projetada pra frente */}
      <mesh position={[0, 0.36, 0.78]} scale={[1.35, 0.4, 1.0]}>
        <sphereGeometry args={[0.3, 32, 24]} />
        <meshStandardMaterial color={BICO} roughness={0.8} />
      </mesh>

      {/* olhos */}
      <mesh ref={olhoEsq} position={[-0.34, 0.72, 0.66]}>
        <sphereGeometry args={[0.105, 24, 16]} />
        <meshStandardMaterial color={OLHO} roughness={0.35} />
      </mesh>
      <mesh ref={olhoDir} position={[0.34, 0.72, 0.66]}>
        <sphereGeometry args={[0.105, 24, 16]} />
        <meshStandardMaterial color={OLHO} roughness={0.35} />
      </mesh>

      {/* tufo do topo */}
      <mesh position={[0.02, 1.32, -0.06]} rotation={[0.25, 0, -0.15]}>
        <coneGeometry args={[0.14, 0.42, 16]} />
        <meshStandardMaterial color={CORPO} roughness={0.75} />
      </mesh>
    </group>
  );
}

/** Corpo + rabo (fixos) — só a cabeça rastreia. */
export function BustoPato({
  rastreando = null,
  escala = 1,
}: {
  rastreando?: React.RefObject<{ x: number; y: number }> | null;
  escala?: number;
}) {
  const corpo = useRef<THREE.Group>(null!);

  /* Balanço idle: deriva lateral + flutuação vertical suaves. */
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    corpo.current.rotation.y = Math.sin(t * 0.35) * 0.09;
    corpo.current.position.y = Math.sin(t * 1.1) * 0.045;
  });

  return (
    <group ref={corpo} scale={escala} position={[0, -0.55, 0]}>
      {/* corpo */}
      <mesh position={[0, -0.35, -0.25]} scale={[1.12, 0.95, 1.28]}>
        <sphereGeometry args={[0.95, 48, 32]} />
        <meshStandardMaterial color={CORPO} roughness={0.75} />
      </mesh>

      {/* rabo apontando pra cima-trás */}
      <mesh position={[0, 0.22, -1.28]} rotation={[-1.15, 0, 0]}>
        <coneGeometry args={[0.34, 0.85, 20]} />
        <meshStandardMaterial color={CORPO} roughness={0.75} />
      </mesh>

      <Cabeca rastreando={rastreando} />
    </group>
  );
}

/** Canvas do topo: pato 3D de bolso que segue o cursor. */
export default function PatoVigia3D() {
  const alvo = usePonteiro();
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
    const aoMudar = () => setAbaVisivel(!document.hidden);
    document.addEventListener("visibilitychange", aoMudar);
    return () => document.removeEventListener("visibilitychange", aoMudar);
  }, []);

  // A saída silenciosa da casa: volta a ser a imagem parada de antes.
  if (semMovimento() || !webgl) {
    return (
      <img
        src="/pato-mascote.png"
        alt="Pato, mascote do JailbreakDN"
        width={40}
        height={40}
        className="size-10 shrink-0 object-contain grayscale"
      />
    );
  }

  return (
    <div className="size-16 shrink-0" aria-label="Pato mascote em 3D — olha para o cursor">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.9, 4.6], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={abaVisivel ? "always" : "never"}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2.5, 4, 4]} intensity={1.3} />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        <BustoPato rastreando={alvo} escala={1.18} />
      </Canvas>
    </div>
  );
}
