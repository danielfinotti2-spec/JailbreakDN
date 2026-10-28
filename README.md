# JailbreakDN

Portal pessoal de recursos digitais: um lugar para guardar, organizar, pesquisar e acessar links,
ferramentas de IA, APIs, prompts, tutoriais e materiais técnicos.

Não é um portfólio. É uma biblioteca: o conteúdo são os recursos, não a vitrine.

## Stack

React 19 · TypeScript (strict) · Vite 8 (Rolldown) · Tailwind CSS v4 · lucide-react · Radix Slot.

Sem framework de UI pesada, sem 3D, sem serviço externo para dados essenciais. Tudo funciona a
partir de arquivos locais.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b + vite build
npm run preview    # serve o build
```

## Dados — fonte única

| Arquivo | Conteúdo |
| --- | --- |
| `src/data/links.ts` | **Todo** o catálogo: 112 recursos, 9 categorias, tipos, tags, risco, avisos. |
| `src/data/prompts.js` | Os 16 prompts originais, preservados sem alteração. |
| `src/data/perfil.ts` | Marca e redes sociais (Instagram, GitHub, Discord, site). |

Para adicionar um link, basta inserir um objeto em `RESOURCES`. Categoria, contagens, filtros,
busca e ordenação se atualizam sozinhos — não há número digitado à mão em nenhum lugar.

### Esquema de um recurso

```ts
{
  id: "ghidra",                      // único, usado na URL /recurso/ghidra
  nome: "Ghidra",
  url: "https://ghidra-sre.org",     // exatamente como cadastrada
  categoriaIds: ["re"],              // pode ter mais de uma
  subcategoria: "Decompilador",
  origem: "NSA",
  descricao: "…",                    // em português
  tipo: "ferramenta",                // site|api|ferramenta|repositorio|video|download|artigo|prompt
  tags: ["re", "decompilador"],
  verificado: false,                 // true só se a página foi realmente consultada
  conta: "desconhecido",             // true | false | "desconhecido"
  risco: "none",                     // none | caution | high  (high exige `avisos`)
  adicionadoEm: "2026-02-10",
}
```

## Rotas

| Rota | Página |
| --- | --- |
| `/` | Início: boas-vindas, busca, categorias, recentes, favoritos, atalhos, números reais |
| `/recursos` | Catálogo com busca, filtros e ordenação |
| `/categoria/:id` | Uma das 9 categorias |
| `/categorias` | Visão geral das categorias |
| `/recurso/:id` | Detalhe: URL completa, avisos, verificação, relacionados |
| `/favoritos` | Só o que você marcou neste navegador |
| `/prompts` | Os 16 prompts, com leitura, cópia e download |
| `/prompt/:id` | Um prompt específico |

Filtros combináveis por URL: `?q=`, `?cat=`, `?tipo=`, `?risco=alto`.

## O que o site não faz

Regras seguidas na montagem, para que a interface não minta:

- **Não inventa estatística.** Não existe contador de visitas, curtidas ou "mais populares". A
  seção de favoritos é a sua lista local, guardada em `localStorage` — ninguém mais a vê.
- **Não inventa link.** Nenhuma URL substituta é criada quando um endereço parece fora do ar.
  Parâmetros de indicação e convite são preservados como vieram.
- **Não afirma verificação que não houve.** `verificado: true` significa que a página foi
  consultada durante o catálogo. Os 47 links adicionados sem consulta aparecem como
  "descrição não verificada".
- **Não baixa nada sozinho.** Downloads e arquivos abrem a página de origem em nova aba.
- **Não declara nada malicioso sem evidência.** Onde há risco, o aviso diz o que se sabe e o que
  não se sabe.

## Verificação

```bash
npm run preview          # em outro terminal, na porta 4180
npm run test:all
```

- `scripts/verify.cjs` — 42 checagens funcionais: busca, filtros, categorias, favoritos após
  recarregar, copiar URL, abrir recurso, tema, menu mobile, estados vazios, console, overflow em
  1440/1920/390.
- `scripts/verify-dados.cjs` — 11 checagens de integridade: os 49 links originais presentes,
  nenhuma URL duplicada ou vazia, `href="#"` ausente, risco alto sempre com aviso, prompts intactos.
