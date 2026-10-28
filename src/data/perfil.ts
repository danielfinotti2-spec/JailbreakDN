/* ---------------------------------------------------------------
   Perfil e redes sociais — os únicos dados pessoais do site.

   Só existem as redes informadas pelo dono. Não há perfil inventado
   para nenhuma outra plataforma. Para editar, altere a lista abaixo:
   o rodapé e a área de perfil são gerados a partir dela.
   --------------------------------------------------------------- */

export const MARCA = {
  nome: "JailbreakDN",
  /** Partes da marca para o wordmark: a última recebe o destaque âmbar. */
  partes: ["Jailbreak", "DN"],
  chamada: "Central pessoal de recursos digitais",
  descricao:
    "Biblioteca pessoal para guardar, organizar e encontrar links, ferramentas, modelos de IA, APIs, prompts e material técnico.",
} as const;

export interface Social {
  id: "instagram" | "github" | "discord" | "site";
  nome: string;
  url: string;
  /** Slug do ícone em components/IconeMarca.tsx. */
  icone: string;
  /** Texto curto exibido nos cards de perfil. */
  handle: string;
}

export const SOCIAIS: Social[] = [
  {
    id: "instagram",
    nome: "Instagram",
    url: "https://www.instagram.com/euodeene/",
    icone: "instagram",
    handle: "@euodeene",
  },
  {
    id: "github",
    nome: "GitHub",
    url: "https://github.com/df2-spec",
    icone: "github",
    handle: "df2-spec",
  },
  {
    id: "discord",
    nome: "Discord",
    url: "https://discord.gg/am9s4fqRHw",
    icone: "discord",
    handle: "Servidor",
  },

  {
    id: "site",
    nome: "Site",
    url: "https://euodeene.shop",
    icone: "site",
    handle: "euodeene.shop",
  },
];

/** Datas usadas nos textos ("última atualização do catálogo"). */
export const ANO = new Date().getFullYear();




