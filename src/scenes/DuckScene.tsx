import { Component, Suspense, useEffect, useState, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Float, useGLTF } from "@react-three/drei";
import Mascot from "./Mascot";
import { prefersReducedMotion } from "@/lib/duckConfig";

/* ---------------------------------------------------------------
   DuckScene — the mascot stage.

   Three tiers of graceful degradation, in order:
     1. Real GLB at /models/duck.glb, if present  (useGLTF + native clips)
     2. Procedural mascot (Mascot.tsx)             — what ships today
     3. Static illustration (/duck.webp)           — no WebGL at all

   The GLB load is wrapped in an error boundary on purpose: a missing or
   malformed model file must degrade to the procedural duck, never blank
   the page.
   --------------------------------------------------------------- */



/** Optional GLB slot. Only ever mounted once the file is known to exist. */
function ModelSlot({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

/** Captures a failed model load so the tree survives. */
class ModelBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* Missing or invalid GLB is expected — the procedural mascot covers it. */
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Pause the render loop while the tab is hidden — no wasted GPU. */
function VisibilityGuard() {
  const { invalidate, frameloop } = useThree();
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && frameloop === "demand") invalidate();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [invalidate, frameloop]);
  return null;
}

function Scene({ reduced, modelUrl }: { reduced: boolean; modelUrl: string }) {
  const mascot = <Mascot reduced={reduced} />;
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#9db4ff" />

      <Float speed={reduced ? 0 : 1.1} rotationIntensity={reduced ? 0 : 0.12} floatIntensity={reduced ? 0 : 0.35}>
        <group position={[0, 0.1, 0]} scale={1.05}>
          {modelUrl ? (
            <ModelBoundary fallback={mascot}>
              <Suspense fallback={mascot}>
                <ModelSlot url={modelUrl} />
              </Suspense>
            </ModelBoundary>
          ) : (
            mascot
          )}
        </group>
      </Float>

      <ContactShadows position={[0, -0.95, 0]} opacity={0.35} scale={6} blur={2.6} far={2} />
      {/* Lighting is local on purpose. drei's <Environment preset> fetches an
          HDR file from a third-party CDN at runtime, which breaks offline and
          leaks a request to an external host — the materials are lit by the
          three lights above instead. */}
      <VisibilityGuard />
    </>
  );
}

/** Cheap WebGL capability probe — avoids constructing a broken context. */
function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

export default function DuckScene({ className }: { className?: string }) {
  const [status, setStatus] = useState<"probing" | "webgl" | "fallback">("probing");
  const [reduced, setReduced] = useState(prefersReducedMotion());

  /* No model file ships with this build, so the GLB is opt-in at build time
     rather than probed at runtime. Set VITE_DUCK_MODEL_URL to a real .glb to
     use it; without it no request is ever made for a file that isn't there. */
  const modelUrl = (import.meta.env.VITE_DUCK_MODEL_URL as string | undefined) || "";
  const useGlb = Boolean(modelUrl);

  useEffect(() => {
    setStatus(webglAvailable() ? "webgl" : "fallback");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (status === "fallback") {
    return (
      <div className={className} role="img" aria-label="Pato mascote">
        <img
          src="/duck.webp"
          alt=""
          className="mx-auto w-full max-w-[340px] drop-shadow-[0_24px_40px_rgba(0,0,0,0.22)]"
        />
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.1, 4.1], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          // Cap DPR so a 4K screen does not render 4x the pixels.
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <Scene reduced={reduced} modelUrl={useGlb ? modelUrl : ""} />
      </Canvas>
      <span className="sr-only">Pato mascote tridimensional animado com óculos.</span>
    </div>
  );
}


