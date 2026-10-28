/* ---------------------------------------------------------------
   Estado do diretório: busca, filtros e favoritos.

   Um único store em React context para que o cabeçalho (busca, menu,
   contador de favoritos) e as páginas compartilhem o mesmo estado.

   Regra explícita do briefing: "a busca não deve apagar o texto
   digitado quando o usuário muda de seção". Por isso o termo de busca
   vive SOMENTE aqui, no provider — que fica montado acima das rotas.
   Nenhuma página lê ou limpa a busca ao montar; só a URL pode
   sobrescrevê-la, e apenas quando traz um ?q= de verdade.

   Favoritos persistem em localStorage e são validados a cada carga
   contra os ids existentes, para que um id removido não fique órfão.
   --------------------------------------------------------------- */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { RESOURCES, type Resource, type RiskLevel, type TipoId } from "@/data/links";
import type { Disponibilidade } from "@/data/disponibilidade";
import { grupoDoRecurso, ordemDaSubcategoria } from "@/lib/filtros";

const CHAVE_FAVS = "jbdn:favs";

export type Ordem = "recentes" | "antigos" | "az" | "za";

export const ORDENS: { id: Ordem; rotulo: string }[] = [
  { id: "recentes", rotulo: "Mais recentes" },
  { id: "antigos", rotulo: "Mais antigos" },
  { id: "az", rotulo: "Nome A–Z" },
  { id: "za", rotulo: "Nome Z–A" },
];

interface Filtros {
  /** Grupos marcados (vazio = todos). */
  grupos: string[];
  /** Subcategorias marcadas (vazio = todas). */
  subcategorias: string[];
  tipo: TipoId | null;
  disponibilidade: Disponibilidade | null;
  risco: RiskLevel | null;
  apenasFavoritos: boolean;
}

const FILTROS_VAZIOS: Filtros = {
  grupos: [],
  subcategorias: [],
  tipo: null,
  disponibilidade: null,
  risco: null,
  apenasFavoritos: false,
};

interface Ctx {
  busca: string;
  setBusca: (v: string) => void;
  filtros: Filtros;
  alternarGrupo: (id: string) => void;
  alternarSubcategoria: (id: string) => void;
  setTipo: (v: TipoId | null) => void;
  setDisponibilidade: (v: Disponibilidade | null) => void;
  setRisco: (v: RiskLevel | null) => void;
  setApenasFavoritos: (v: boolean) => void;
  ordem: Ordem;
  setOrdem: (v: Ordem) => void;
  limpar: () => void;
  /** Número de filtros ativos (para o botão "Limpar"). */
  ativos: number;
  resultados: Resource[];
  todos: Resource[];
  favoritos: string[];
  alternarFavorito: (id: string) => void;
  ehFavorito: (id: string) => boolean;
}

const LibraryContext = createContext<Ctx | null>(null);

/** Normaliza para busca: sem acentos, minúsculas. */
const normalizar = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Texto pesquisável de cada recurso, precomputado uma vez. */
const INDICE: { r: Resource; texto: string }[] = RESOURCES.map((r) => ({
  r,
  texto: normalizar(
    [r.nome, r.descricao, r.subcategoria, r.origem, r.url, r.tags.join(" ")].join(" \u0001 "),
  ),
}));

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [favoritos, setFavoritos] = useState<string[]>(() => {
    try {
      const bruto = localStorage.getItem(CHAVE_FAVS);
      if (!bruto) return [];
      const lido: unknown = JSON.parse(bruto);
      if (!Array.isArray(lido)) return [];
      const existentes = new Set(RESOURCES.map((r) => r.id));
      return lido.filter((x): x is string => typeof x === "string" && existentes.has(x));
    } catch {
      return [];
    }
  });

  // Persiste favoritos e mantém abas sincronizadas.
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_FAVS, JSON.stringify(favoritos));
    } catch {
      /* modo privado / cota: o estado em memória continua válido */
    }
  }, [favoritos]);

  useEffect(() => {
    const aoMudar = (e: StorageEvent) => {
      if (e.key !== CHAVE_FAVS) return;
      try {
        const lido: unknown = JSON.parse(e.newValue ?? "[]");
        if (Array.isArray(lido)) {
          setFavoritos(lido.filter((x): x is string => typeof x === "string"));
        }
      } catch {
        /* valor externo inválido: ignora */
      }
    };
    window.addEventListener("storage", aoMudar);
    return () => window.removeEventListener("storage", aoMudar);
  }, []);

  const alternarFavorito = useCallback((id: string) => {
    setFavoritos((atuais) =>
      atuais.includes(id) ? atuais.filter((x) => x !== id) : [id, ...atuais],
    );
  }, []);

  const ehFavorito = useCallback((id: string) => favoritos.includes(id), [favoritos]);

  const alternarGrupo = useCallback((id: string) => {
    setFiltros((f) => {
      const on = f.grupos.includes(id);
      // Ao ligar um grupo, as subcategorias dele deixam de ser necessárias.
      return {
        ...f,
        grupos: on ? f.grupos.filter((x) => x !== id) : [...f.grupos, id],
        subcategorias: on ? f.subcategorias : [],
      };
    });
  }, []);

  const alternarSubcategoria = useCallback((id: string) => {
    setFiltros((f) => ({
      ...f,
      grupos: [],
      subcategorias: f.subcategorias.includes(id)
        ? f.subcategorias.filter((x) => x !== id)
        : [...f.subcategorias, id],
    }));
  }, []);

  const setTipo = useCallback((v: TipoId | null) => setFiltros((f) => ({ ...f, tipo: v })), []);
  const setDisponibilidade = useCallback(
    (v: Disponibilidade | null) => setFiltros((f) => ({ ...f, disponibilidade: v })),
    [],
  );
  const setRisco = useCallback((v: RiskLevel | null) => setFiltros((f) => ({ ...f, risco: v })), []);
  const setApenasFavoritos = useCallback(
    (v: boolean) => setFiltros((f) => ({ ...f, apenasFavoritos: v })),
    [],
  );

  const limpar = useCallback(() => {
    setFiltros(FILTROS_VAZIOS);
    setBusca("");
  }, []);

  const ativos = useMemo(
    () =>
      filtros.grupos.length +
      filtros.subcategorias.length +
      (filtros.tipo ? 1 : 0) +
      (filtros.disponibilidade ? 1 : 0) +
      (filtros.risco ? 1 : 0) +
      (filtros.apenasFavoritos ? 1 : 0) +
      (busca.trim() ? 1 : 0),
    [filtros, busca],
  );

  const todos = useMemo(() => {
    const favSet = new Set(favoritos);
    const termo = normalizar(busca.trim());
    const partes = termo.split(/\s+/).filter(Boolean);

    let lista = INDICE.filter(({ r, texto }) => {
      if (partes.length && !partes.every((p) => texto.includes(p))) return false;
      if (filtros.apenasFavoritos && !favSet.has(r.id)) return false;
      if (filtros.tipo && r.tipo !== filtros.tipo) return false;
      if (filtros.disponibilidade && r.disponibilidade !== filtros.disponibilidade) return false;
      if (filtros.risco && r.risco !== filtros.risco) return false;
      if (filtros.subcategorias.length) {
        if (!filtros.subcategorias.includes(r.subcategoriaId)) return false;
      }
      if (filtros.grupos.length) {
        const grupo = grupoDoRecurso(r);
        if (!grupo || !filtros.grupos.includes(grupo)) return false;
      }
      return true;
    }).map((x) => x.r);

    const cmp: Record<Ordem, (a: Resource, b: Resource) => number> = {
      recentes: (a, b) => b.adicionadoEm.localeCompare(a.adicionadoEm) || a.nome.localeCompare(b.nome, "pt-BR"),
      antigos: (a, b) => a.adicionadoEm.localeCompare(b.adicionadoEm) || a.nome.localeCompare(b.nome, "pt-BR"),
      az: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
      za: (a, b) => b.nome.localeCompare(a.nome, "pt-BR"),
    };
    // Ordenação canônica do diretório: subcategoria, depois nome.
    lista = lista.sort(
      (a, b) =>
        ordemDaSubcategoria(a.subcategoriaId) - ordemDaSubcategoria(b.subcategoriaId) || cmp[ordem](a, b),
    );
    return lista;
  }, [busca, filtros, favoritos, ordem]);

  const valor = useMemo<Ctx>(
    () => ({
      busca,
      setBusca,
      filtros,
      alternarGrupo,
      alternarSubcategoria,
      setTipo,
      setDisponibilidade,
      setRisco,
      setApenasFavoritos,
      ordem,
      setOrdem,
      limpar,
      ativos,
      resultados: todos,
      todos: RESOURCES,
      favoritos,
      alternarFavorito,
      ehFavorito,
    }),
    [
      busca,
      filtros,
      alternarGrupo,
      alternarSubcategoria,
      setTipo,
      setDisponibilidade,
      setRisco,
      setApenasFavoritos,
      ordem,
      limpar,
      ativos,
      todos,
      favoritos,
      alternarFavorito,
      ehFavorito,
    ],
  );

  return <LibraryContext.Provider value={valor}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): Ctx {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary precisa estar dentro de <LibraryProvider>");
  return ctx;
}




