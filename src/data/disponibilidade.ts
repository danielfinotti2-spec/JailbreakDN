/* Disponibilidade real de cada recurso.

   O briefing é explícito: não classificar uma API como gratuita só
   porque existe cadastro gratuito, e não inventar cotas, preços ou
   créditos. Por isso o padrão é "nao-verificado": só sai dele quando há
   evidência registrada no próprio catálogo.

   "nao-verificado" não é um balde de dúvidas que finge ser uma
   categoria — é o valor honesto para tudo que não foi conferido, e a
   interface mostra exatamente isso. */

export type Disponibilidade =
  | "gratis"
  | "plano-gratuito"
  | "creditos-gratuitos"
  | "local-open-source"
  | "pago"
  | "nao-verificado";

export interface DisponibilidadeInfo {
  id: Disponibilidade;
  rotulo: string;
  /** Explicação curta, usada em tooltip/aria e na legenda dos filtros. */
  descricao: string;
}

export const DISPONIBILIDADES: DisponibilidadeInfo[] = [
  {
    id: "gratis",
    rotulo: "Grátis",
    descricao: "Serviço utilizável sem pagamento, conforme as condições atuais.",
  },
  {
    id: "plano-gratuito",
    rotulo: "Plano gratuito",
    descricao: "Serviço com limites, cotas ou restrições no uso sem pagamento.",
  },
  {
    id: "creditos-gratuitos",
    rotulo: "Créditos gratuitos",
    descricao: "Serviço que oferece créditos promocionais.",
  },
  {
    id: "local-open-source",
    rotulo: "Local e open source",
    descricao: "Modelo ou ferramenta executável na própria máquina.",
  },
  {
    id: "pago",
    rotulo: "Pago",
    descricao: "Serviço que exige pagamento para a funcionalidade relevante.",
  },
  {
    id: "nao-verificado",
    rotulo: "Preço e limites não verificados",
    descricao: "As condições atuais deste serviço não foram conferidas.",
  },
];

const INFO = new Map(DISPONIBILIDADES.map((d) => [d.id, d]));

export const disponibilidadeInfo = (id: Disponibilidade): DisponibilidadeInfo =>
  INFO.get(id) ?? DISPONIBILIDADES[DISPONIBILIDADES.length - 1];

/** Ordem de exibição nos filtros: do mais acessível ao menos. */
export const ordemDaDisponibilidade = (id: Disponibilidade): number =>
  DISPONIBILIDADES.findIndex((d) => d.id === id);
