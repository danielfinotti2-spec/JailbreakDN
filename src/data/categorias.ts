/* Taxonomia do diretório.

   Sete grupos, cada um com subcategorias. O agrupamento é o eixo de
   navegação principal; o recurso guarda apenas `subcategoriaId`, e o
   grupo é sempre derivado dela — assim não existe a possibilidade de um
   recurso apontar para um grupo diferente do da sua subcategoria.

   Subcategoria sem nenhum recurso continua listada: é informação de
   que aquele espaço do diretório ainda está vazio, e é melhor mostrar
   isso do que esconder ou preencher com link inventado. */

export type GrupoId =
  | "ia"
  | "apis"
  | "desenvolvimento"
  | "re"
  | "seguranca"
  | "prompts"
  | "tutoriais"
  | "outros";

export interface Subcategoria {
  id: string;
  nome: string;
  grupoId: GrupoId;
}

export interface Grupo {
  id: GrupoId;
  nome: string;
  /** Linha curta que aparece abaixo do título do grupo. */
  resumo: string;
  subcategorias: Subcategoria[];
}

/** Atalho para declarar subcategorias sem repetir o grupo em cada uma. */
const sub = (grupoId: GrupoId) => (id: string, nome: string): Subcategoria => ({
  id,
  nome,
  grupoId,
});

const iaSub = sub("ia");
const apiSub = sub("apis");
const devSub = sub("desenvolvimento");
const reSub = sub("re");
const segSub = sub("seguranca");
const prmSub = sub("prompts");
const tutSub = sub("tutoriais");
const outSub = sub("outros");

export const GRUPOS: Grupo[] = [
  {
    id: "ia",
    nome: "Inteligência artificial",
    resumo: "Chatbots, modelos, geradores e ferramentas de IA.",
    subcategorias: [
      iaSub("ia-gratis", "IA grátis"),
      iaSub("chatbots", "Chatbots gratuitos"),
      iaSub("open-source", "Modelos de IA open source"),
      iaSub("ollama", "Modelos locais para Ollama"),
      iaSub("imagens", "Geradores de imagens"),
      iaSub("video-audio", "Geração de vídeo e áudio"),
      iaSub("programacao-ia", "Ferramentas de programação com IA"),
    ],
  },
  {
    id: "apis",
    nome: "APIs",
    resumo: "Chaves de API, provedores e roteadores de modelos.",
    subcategorias: [
      apiSub("apis-gratis", "APIs gratuitas"),
      apiSub("apis-plano", "APIs com planos gratuitos e limites de uso"),
      apiSub("inferencia", "Provedores de inferência"),
      apiSub("roteadores", "Roteadores de modelos"),
      apiSub("apis-dev", "APIs para programação"),
      apiSub("creditos", "Serviços com créditos promocionais"),
    ],
  },
  {
    id: "desenvolvimento",
    nome: "Desenvolvimento",
    resumo: "Editores, bibliotecas, componentes e documentação.",
    subcategorias: [
      devSub("editores", "Editores e IDEs"),
      devSub("ferramentas-dev", "Ferramentas para desenvolvedores"),
      devSub("bibliotecas", "Bibliotecas JavaScript e React"),
      devSub("componentes", "Componentes de interface"),
      devSub("repos", "Repositórios GitHub"),
      devSub("docs", "Documentação técnica"),
    ],
  },
  {
    id: "re",
    nome: "Engenharia reversa",
    resumo: "Análise de binários, depuração e material técnico.",
    subcategorias: [
      reSub("rea", "REA"),
      reSub("ghidra", "Ghidra e Ghidra MCP"),
      reSub("analise-bin", "Ferramentas de análise de binários"),
      reSub("debugging", "Ferramentas de depuração"),
      reSub("recursos-re", "Recursos técnicos e tutoriais"),
    ],
  },
  {
    id: "seguranca",
    nome: "Segurança e privacidade",
    resumo: "VPNs, sistemas privativos, análise e utilitários.",
    subcategorias: [
      segSub("vpns", "VPNs"),
      segSub("so-privacidade", "Sistemas operacionais voltados à privacidade"),
      segSub("analise-seg", "Ferramentas de análise de segurança"),
      segSub("utilitarios-win", "Utilitários para Windows"),
      segSub("pesquisa-tecnica", "Recursos de pesquisa técnica"),
    ],
  },
  {
    id: "prompts",
    nome: "Prompts e jailbreaks",
    resumo: "Textos preservados dos arquivos originais do projeto.",
    subcategorias: [
      prmSub("prompts-ia", "Prompts para modelos de IA"),
      prmSub("prompts-dev", "Prompts de programação"),
      prmSub("prompts-agentes", "Prompts para agentes"),
      prmSub("pesquisa-modelos", "Pesquisas sobre comportamento de modelos"),
      prmSub("prompts-outros", "Outros prompts do projeto"),
    ],
  },
  {
    id: "tutoriais",
    nome: "Tutoriais e downloads",
    resumo: "Vídeos, playlists, guias e ferramentas de download.",
    subcategorias: [
      tutSub("youtube", "Vídeos do YouTube"),
      tutSub("playlists", "Playlists"),
      tutSub("guias", "Guias"),
      tutSub("ferramentas-download", "Ferramentas para download"),
      tutSub("outros-tecnicos", "Outros recursos técnicos"),
    ],
  },
  {
    id: "outros",
    nome: "Outros",
    resumo: "Sites e ferramentas que não se encaixam nos grupos acima.",
    subcategorias: [outSub("sites", "Sites e ferramentas")],
  },
];

/** Índices derivados, calculados uma vez na carga do módulo. */
export const SUBCATEGORIAS: Subcategoria[] = GRUPOS.flatMap((g) => g.subcategorias);

const POR_ID = new Map(SUBCATEGORIAS.map((s) => [s.id, s]));

export const GRUPO_POR_ID = new Map(GRUPOS.map((g) => [g.id, g]));

export const subcategoriaPorId = (id: string): Subcategoria | undefined => POR_ID.get(id);

export const grupoDaSubcategoria = (id: string): Grupo | undefined => {
  const s = POR_ID.get(id);
  return s ? GRUPO_POR_ID.get(s.grupoId) : undefined;
};

/** Ordem canônica: a mesma dos grupos e subcategorias acima. */
export const ordemDaSubcategoria = (id: string): number =>
  SUBCATEGORIAS.findIndex((s) => s.id === id);

export const ordemDoGrupo = (id: GrupoId): number => GRUPOS.findIndex((g) => g.id === id);

export const TOTAL_SUBCATEGORIAS = SUBCATEGORIAS.length;
