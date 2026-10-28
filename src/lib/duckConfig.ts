/* ---------------------------------------------------------------
   Mascot appearance configuration.

   These values drive the procedural 3D duck in scenes/DuckScene.tsx.
   They were written WITHOUT seeing pato-mascote.png (the session model
   has no image input), so treat the palette as a placeholder to be
   corrected against the reference photo.

   To retune: change the hex values here and reload. Nothing else needs
   to change. To replace the procedural model entirely with a real GLB,
   see scenes/DuckScene.tsx — the <Model> slot accepts one.
   --------------------------------------------------------------- */

export interface DuckPalette {
  body: string;
  bodyShade: string;
  belly: string;
  beak: string;
  beakShade: string;
  feet: string;
  glassesFrame: string;
  glassesLens: string;
  eyeWhite: string;
  pupil: string;
}

export const DUCK_PALETTE: DuckPalette = {
  body: "#ffd23f",
  bodyShade: "#f2b705",
  belly: "#fff3c4",
  beak: "#f5871f",
  beakShade: "#d96d0c",
  feet: "#f5871f",
  glassesFrame: "#1b1b1f",
  glassesLens: "#ffffff",
  eyeWhite: "#ffffff",
  pupil: "#141418",
};

/**
 * True when the visitor asked for reduced motion. Read once at module
 * load and again on change so long-lived scenes stay responsive.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
