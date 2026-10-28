import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DUCK_PALETTE as P } from "@/lib/duckConfig";

/* ---------------------------------------------------------------
   Procedural mascot.

   This is a hand-built primitive model, not a scanned/sculpted asset.
   Every animation below is procedural (breathing, blink, head sway,
   wing flap, mouse parallax) rather than a baked glTF clip. It is a
   faithful-shape stand-in that can be swapped for a real GLB — see
   <MascotModel> usage in DuckScene.
   --------------------------------------------------------------- */

interface MascotProps {
  /** 0 = idle, 1 = greeting wave */
  energy?: number;
  reduced?: boolean;
}

export default function Mascot({ energy = 0, reduced = false }: MascotProps) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  // One ref per eyelid: the two eyes are siblings, so a single shared ref
  // would only ever bind to the last one mounted.
  const lidL = useRef<THREE.Group>(null);
  const lidR = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);

  // Materials are created once; re-instantiating them every frame leaks GPU memory.
  const mats = useMemo(() => {
    const m = (color: string, opts: THREE.MeshPhysicalMaterialParameters = {}) =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: 0.42,
        metalness: 0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.25,
        ...opts,
      });
    return {
      body: m(P.body),
      belly: m(P.belly, { roughness: 0.55 }),
      beak: m(P.beak, { roughness: 0.3, clearcoat: 0.8 }),
      beakShade: m(P.beakShade, { roughness: 0.35 }),
      feet: m(P.feet, { roughness: 0.4 }),
      frame: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(P.glassesFrame),
        roughness: 0.25,
        metalness: 0.6,
        clearcoat: 1,
      }),
      lens: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(P.glassesLens),
        roughness: 0.05,
        metalness: 0,
        transmission: 0.85,
        thickness: 0.25,
        ior: 1.4,
        transparent: true,
        opacity: 0.55,
      }),
      eye: new THREE.MeshPhysicalMaterial({ color: new THREE.Color(P.eyeWhite), roughness: 0.2 }),
      pupil: new THREE.MeshBasicMaterial({ color: new THREE.Color(P.pupil) }),
    };
  }, []);

  const blink = useRef({ next: 2.4, close: 0 });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);

    if (reduced) return;

    // Breathing: subtle vertical swell, never a bounce.
    const breath = Math.sin(t * 1.15) * 0.014;
    if (body.current) body.current.scale.set(1 + breath, 1 - breath * 0.7, 1 + breath);

    // Head sway plus a little interest in the pointer.
    if (head.current) {
      const { x, y } = state.pointer;
      const targetY = x * 0.32 + Math.sin(t * 0.55) * 0.06;
      const targetX = -y * 0.16 + Math.sin(t * 0.41 + 1.1) * 0.04;
      head.current.rotation.y += (targetY - head.current.rotation.y) * Math.min(1, d * 4);
      head.current.rotation.x += (targetX - head.current.rotation.x) * Math.min(1, d * 4);
      head.current.position.y = Math.sin(t * 1.15 + 0.4) * 0.012;
    }

    // Blink: deterministic-ish cadence with a fast close / slower open.
    const b = blink.current;
    b.next -= d;
    if (b.next <= 0) {
      b.close = 1;
      b.next = 2.6 + Math.random() * 3.4;
    }
    if (b.close > 0) {
      b.close = Math.max(0, b.close - d * 4.5);
      const open = Math.max(0.06, 1 - Math.sin(b.close * Math.PI) * 0.95);
      lidL.current?.scale.setY(open);
      lidR.current?.scale.setY(open);
    }

    // Wings: idle sway, opening up into a greeting when energy rises.
    if (wingL.current && wingR.current) {
      const idle = Math.sin(t * 1.6) * 0.06;
      const wave = Math.sin(t * 9) * 0.45 * energy;
      wingL.current.rotation.z = 0.35 + idle + wave;
      wingR.current.rotation.z = -0.35 - idle - wave;
    }

    // Whole-body sway — kept tiny so it reads as life, not wobble.
    if (root.current) {
      root.current.rotation.z = Math.sin(t * 0.7) * 0.018;
      root.current.position.y = Math.sin(t * 0.9) * 0.02;
    }
  });

  return (
    <group ref={root} dispose={null}>
      {/* Feet */}
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} position={[x, -0.72, 0.06]} material={mats.feet} castShadow>
          <sphereGeometry args={[0.13, 16, 12]} />
        </mesh>
      ))}

      {/* Legs */}
      {[-0.15, 0.15].map((x) => (
        <mesh key={x} position={[x, -0.6, 0.04]} material={mats.beakShade}>
          <cylinderGeometry args={[0.045, 0.05, 0.22, 12]} />
        </mesh>
      ))}

      {/* Body */}
      <mesh ref={body} position={[0, -0.2, 0]} material={mats.body} castShadow receiveShadow>
        <sphereGeometry args={[0.62, 48, 40]} />
      </mesh>

      {/* Belly patch */}
      <mesh position={[0, -0.26, 0.34]} material={mats.belly} scale={[0.78, 0.86, 0.5]}>
        <sphereGeometry args={[0.55, 40, 32]} />
      </mesh>

      {/* Wings */}
      <group ref={wingL} position={[-0.56, -0.1, 0]}>
        <mesh material={mats.body} rotation={[0, 0, 0.2]} scale={[0.55, 1, 0.4]} castShadow>
          <sphereGeometry args={[0.4, 28, 22]} />
        </mesh>
      </group>
      <group ref={wingR} position={[0.56, -0.1, 0]}>
        <mesh material={mats.body} rotation={[0, 0, -0.2]} scale={[0.55, 1, 0.4]} castShadow>
          <sphereGeometry args={[0.4, 28, 22]} />
        </mesh>
      </group>

      {/* Head */}
      <group ref={head} position={[0, 0.62, 0.02]}>
        <mesh material={mats.body} castShadow>
          <sphereGeometry args={[0.45, 48, 40]} />
        </mesh>

        {/* Beak */}
        <mesh position={[0, -0.08, 0.42]} rotation={[Math.PI / 2, 0, 0]} material={mats.beak} castShadow>
          <coneGeometry args={[0.17, 0.34, 24]} />
        </mesh>
        <mesh position={[0, -0.13, 0.3]} material={mats.beakShade}>
          <sphereGeometry args={[0.16, 24, 16]} />
        </mesh>

        {/* Eyes + blinking lids */}
        {[-0.16, 0.16].map((x) => (
          <group key={x} position={[x, 0.08, 0.35]}>
            <mesh material={mats.eye}>
              <sphereGeometry args={[0.115, 28, 24]} />
            </mesh>
            <mesh position={[0, 0, 0.09]} material={mats.pupil}>
              <sphereGeometry args={[0.062, 20, 16]} />
            </mesh>
            <group ref={x < 0 ? lidL : lidR} position={[0, 0.11, 0]} scale={[1, 1, 1]}>
              <mesh material={mats.body}>
                <sphereGeometry args={[0.118, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
            </group>
          </group>
        ))}

        {/* Glasses */}
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.08, 0.38]} rotation={[0, 0, 0]} material={mats.frame}>
            <torusGeometry args={[0.15, 0.017, 12, 40]} />
          </mesh>
        ))}
        <mesh position={[0, 0.09, 0.39]} material={mats.frame}>
          <boxGeometry args={[0.06, 0.012, 0.012]} />
        </mesh>
        {[-0.31, 0.31].map((x) => (
          <mesh key={x} position={[x, 0.09, 0.3]} rotation={[0, Math.PI / 2.4, 0]} material={mats.frame}>
            <boxGeometry args={[0.16, 0.012, 0.012]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
