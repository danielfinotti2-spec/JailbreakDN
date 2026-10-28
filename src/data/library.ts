/**
 * Typed facade over the existing prompt library.
 *
 * The original data stays in `prompts.js` untouched, so the content (and
 * the copy/download behaviour that depends on it) is preserved exactly as
 * shipped. This module only adds types and re-computes the same derived
 * fields the old `data.js` produced.
 */
import * as RAW from "./prompts.js";

export interface PromptItem {
  id: number;
  title: string;
  cat: string;
  at: number;
  text: string;
  filename?: string;
  likes: number;
  liked: boolean;
  views: number;
  uses: number;
}

interface RawCreator {
  name: string;
  role: string;
  slides: [string, string, string][];
  links: [string, string][];
}

export const TEXTS = (RAW as unknown as { TEXTS: PromptItem[] }).TEXTS;
export const CATEGORIES = (RAW as unknown as { CATS: string[] }).CATS;
export const SIZE_LABELS = (RAW as unknown as { SIZES: string[] }).SIZES;
export const SORT_OPTIONS = (RAW as unknown as { SORTS: SortOption[] }).SORTS;
export const FAQ_ITEMS = (RAW as unknown as { FAQ: [string, string][] }).FAQ;
export const CREATOR = (RAW as unknown as { ME: RawCreator }).ME;
export const DUCK_SRC = (RAW as unknown as { DUCK: string }).DUCK;
export const FOOTER_DATA = (RAW as unknown as {
  FOOTER: { title: string; text: string; nav: [string, string][] };
}).FOOTER;

export type SortOption = "Mais recentes" | "Mais antigos" | "A–Z" | "Mais curtidos";

export const sizeOf = (t: string): string =>
  t.length < 300 ? "Curto" : t.length < 1200 ? "Médio" : "Longo";
