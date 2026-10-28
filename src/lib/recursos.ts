import {
  Binary,
  Camera,
  CircleDot,
  Code2,
  Download,
  FileText,
  GitBranch,
  Globe,
  MessagesSquare,
  MonitorSmartphone,
  Network,
  PlayCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/* ---------------------------------------------------------------
   Ícones por nome.

   lucide-react v1 removeu TODOS os ícones de marca — não existe mais
   Github nem Instagram. Em vez de puxar um pacote de logos só para
   quatro links, cada rede usa um glifo neutro (Camera, GitBranch,
   MessagesSquare, Globe) ao lado do nome escrito. O nome é o que
   identifica; o glifo só acompanha. Nome desconhecido cai em
   CircleDot em vez de quebrar o render.
   --------------------------------------------------------------- */

const ICONES: Record<string, LucideIcon> = {
  Binary,
  Camera,
  CircleDot,
  Code2,
  Download,
  FileText,
  GitBranch,
  Globe,
  MessagesSquare,
  MonitorSmartphone,
  Network,
  PlayCircle,
  Quote,
  ShieldCheck,
  Sparkles,
};

export const icone = (nome: string): LucideIcon => ICONES[nome] ?? CircleDot;

/* ---------------- Área de transferência ---------------- */

/**
 * Copia texto para a área de transferência.
 *
 * `navigator.clipboard` só existe em contexto seguro (https ou
 * localhost) e pode ser bloqueado por permissão. Por isso há um
 * caminho alternativo com um textarea temporário — sem ele, o botão
 * simplesmente não faria nada em alguns navegadores.
 */
export async function copiar(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* segue para o fallback */
  }

  try {
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, texto.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/* ---------------- Formatação ---------------- */

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2026-02-10" -> "10 fev 2026" (sem depender de Intl/locale do sistema). */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  const m = Number(mes) - 1;
  if (!ano || m < 0 || m > 11) return iso;
  return `${Number(dia)} ${MESES[m]} ${ano}`;
}

/** Domínio limpo para exibir no card ("mediafire.com"). */
export function dominio(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export const plural = (n: number, um: string, muitos: string) =>
  `${n} ${n === 1 ? um : muitos}`;

