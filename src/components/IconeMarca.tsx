/* Ícones de marca — SVG de verdade.

   O lucide-react v1 removeu todos os ícones de marca (4.352 ícones,
   nenhum de empresa). Os glifos neutros que estavam no lugar
   (Camera, GitBranch, MessagesSquare) não identificavam Instagram,
   GitHub nem Discord.

   Aqui os paths vêm do pacote `simple-icons`, que é só dados SVG.
   O pacote inteiro são dezenas de MB: importar `simple-icons` direto
   arrastaria tudo para o bundle. Por isso importamos apenas os ícones
   usados, um a um — o resto é descartado no build.

   Herdam `currentColor` e ficam monocromáticos como o resto do site:
   o pedido era o ícone real, não o roxo do Instagram. */

import {
  siInstagram,
  siGithub,
  siDiscord,
  siWhatsapp,
  siTiktok,
  siYoutube,
  siTelegram,
  siReddit,
  siX,
  type SimpleIcon,
} from "simple-icons";

const MARCAS: Record<string, SimpleIcon> = {
  instagram: siInstagram,
  github: siGithub,
  discord: siDiscord,
  whatsapp: siWhatsapp,
  tiktok: siTiktok,
  youtube: siYoutube,
  telegram: siTelegram,
  reddit: siReddit,
  x: siX,
};

export function temMarca(nome: string): boolean {
  return nome in MARCAS;
}

export function IconeMarca({
  nome,
  className = "size-4",
}: {
  nome: string;
  className?: string;
}) {
  const icone = MARCAS[nome];
  // Ícone desconhecido não renderiza nada em vez de quebrar o layout.
  if (!icone) return null;

  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d={icone.path} />
    </svg>
  );
}
