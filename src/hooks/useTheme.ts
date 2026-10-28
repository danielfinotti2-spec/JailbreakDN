import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
const STORAGE_KEY = "jb:theme";

function systemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme(): ThemeMode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    // Private mode / blocked storage — fall back to the system preference.
    return null;
  }
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", mode === "dark" ? "#0a0a0a" : "#ffffff");
}

/**
 * Theme state. Starts from the stored choice; when the visitor has never
 * chosen, it follows the operating system preference and keeps following
 * it live until they make an explicit choice.
 */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => storedTheme() ?? systemTheme());
  const [explicit, setExplicit] = useState<boolean>(() => storedTheme() !== null);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (explicit) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setMode(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [explicit]);

  const set = useCallback((next: ThemeMode) => {
    setMode(next);
    setExplicit(true);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the choice still applies for this session */
    }
  }, []);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next: ThemeMode = m === "dark" ? "light" : "dark";
      setExplicit(true);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { mode, set, toggle };
}

/** Inline script content for index.html — applies the theme before first paint. */
export const THEME_BOOT_SCRIPT = `(function(){try{var k="jb:theme",s=localStorage.getItem(k),d=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=d;document.documentElement.style.colorScheme=d;}catch(e){}})();`;

