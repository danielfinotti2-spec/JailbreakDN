/* Helpers de filtragem derivados da taxonomia.

   Ficam separados do hook porque são puros e testáveis: dado um
   recurso, qual é o grupo dele? dado um grupo, quais subcategorias
   pertencem a ele? */

import { GRUPOS, SUBCATEGORIAS, ordemDaSubcategoria } from "@/data/categorias";
import type { Resource } from "@/data/links";

const GRUPO_DA_SUB = new Map(SUBCATEGORIAS.map((s) => [s.id, s.grupoId]));

/** Grupo ao qual o recurso pertence, sempre derivado da subcategoria. */
export const grupoDoRecurso = (r: Resource): string | undefined =>
  GRUPO_DA_SUB.get(r.subcategoriaId);

/** Ids das subcategorias de um grupo. */
export const subcategoriasDoGrupo = (grupoId: string): string[] =>
  (GRUPOS.find((g) => g.id === grupoId)?.subcategorias ?? []).map((s) => s.id);

/** Reexportado por conveniência de quem ordena listas. */
export { ordemDaSubcategoria };
