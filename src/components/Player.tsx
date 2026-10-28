import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------
   Media stage.

   There is no encoded video in the project, so this renders a clearly
   labelled demo state: the progress bar and controls are real and work,
   but the visual is a generated gradient, not footage. Pass `src` to
   play an actual file — the same controls then drive real playback.
   --------------------------------------------------------------- */

interface Props {
  src?: string;
  poster?: string;
  titulo?: string;
  legenda?: string;
}

export default function Player({
  src,
  poster,
  titulo = "Apresentação do mascote",
  legenda = "Estado de demonstração — nenhum vídeo está carregado.",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const demoRef = useRef<number>(0);
  const isDemo = !src;

  // Demo progress: a slow looping bar so the control is demonstrably alive.
  useEffect(() => {
    if (!isDemo || !playing) return;
    const id = window.setInterval(() => {
      demoRef.current = (demoRef.current + 0.4) % 100;
      setProgress(demoRef.current);
      setElapsed(Math.round((demoRef.current / 100) * 45));
    }, 80);
    return () => window.clearInterval(id);
  }, [playing, isDemo]);

  const toggle = () => {
    if (isDemo) {
      setPlaying((p) => !p);
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    if (isDemo) {
      setMuted((m) => !m);
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const fullscreen = () => {
    void videoRef.current?.parentElement?.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-xl)] border border-hairline bg-surface-2 shadow-[var(--shadow-lift)]">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted={muted}
          playsInline
          preload="metadata"
          className="size-full object-cover"
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress((v.currentTime / v.duration) * 100);
            setElapsed(Math.round(v.currentTime));
          }}
          onEnded={() => setPlaying(false)}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 20% 0%, color-mix(in srgb, var(--warm) 32%, transparent) 0%, transparent 55%), radial-gradient(90% 70% at 85% 20%, color-mix(in srgb, var(--accent) 28%, transparent) 0%, transparent 60%), var(--surface-2)",
          }}
        /* Generated backdrop only — no footage is implied. */
        />
      )}

      {/* Overlay controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-3">
          <span className="font-mono text-[11px] tabular-nums text-white/80">
            00:{String(elapsed).padStart(2, "0")}
          </span>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso"
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
          >
            <div
              className="h-full rounded-full bg-white transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[11px] tabular-nums text-white/60">{isDemo ? "00:45" : "--:--"}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">{titulo}</p>
            {isDemo && <p className="truncate text-[11px] text-white/60">{legenda}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleMute}
              aria-label={muted ? "Ativar som" : "Silenciar"}
              className="text-white hover:bg-white/15 hover:text-white"
            >
              {muted ? <VolumeX /> : <Volume2 />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={fullscreen}
              aria-label="Tela cheia"
              disabled={isDemo}
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Centre play button — a plain button, not <Button>, so the absolute
          centring is not overridden by the component's inline-flex display. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar demonstração" : "Reproduzir demonstração"}
        className={cn(
          "absolute left-1/2 top-1/2 z-10 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg transition-[transform,opacity] duration-200 hover:scale-105",
          playing && "pointer-events-none scale-90 opacity-0",
        )}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 size-6" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      {playing && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
          {isDemo ? "demonstração" : "reproduzindo"}
        </div>
      )}
    </div>
  );
}


