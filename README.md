# Cofre de TXT · @euodeene

Site estático em React 19 + TypeScript + Vite 8. Reúne a biblioteca de prompts original e um
catálogo de 40 recursos externos organizados em cinco categorias, com aviso de risco e origem.

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build e preview

```bash
npm run typecheck    # tsc -b --noEmit
npm run build        # tsc -b && vite build  -> dist/
npm run preview
```

`dist/` é estático: publica em Vercel, Netlify ou GitHub Pages. Não há backend.
O `vercel.json` já traz `cleanUrls` e o rewrite de SPA, então rotas profundas
(`/produtos/algum-slug`) são servidas para o roteador do app.

## Testes

Os testes dirigem um Chrome real via Playwright. Suba o app antes
(`npm run dev` ou `npm run preview`) e rode:

```bash
npm run test:e2e         # 35 checagens: rotas, busca, filtros, favoritos, tema, links, 3D
npm run test:fallbacks   # 9 checagens: WebGL desligado, reduced-motion, foco, 404 profundo
npm run test:layout      # 11 checagens: hero, player 16:9, nav flutuante, desktop e mobile
```

Para testar o build de produção em vez do dev server:

```bash
npm run preview
# noutro terminal:
$env:BASE="http://localhost:4173"; npm run test:e2e    # PowerShell
BASE=http://localhost:4173 npm run test:e2e            # bash
```

## Estrutura

```
src/
  Root.tsx              tabela de rotas (/, /produtos, /produtos/:slug, senão 404)
  lib/router.ts         router por History API + evento app:pathchange
  data/
    links.ts            catálogo — fonte única dos 40 recursos
    prompts.js          conteúdo original dos prompts (preservado, não editado)
    library.ts          fachada tipada sobre prompts.js
  components/           Hero, Catalog, Player, PromptLibrary, NotFound, Shop, FloatingNav
  scenes/DuckScene.tsx  Canvas com WebGL fallback, lazy e reduced-motion
  scenes/Mascot.tsx     mascote procedural (formas primitivas + animação)
  styles/tokens.css     tokens de cor/tipografia, light e dark
```

## Sobre o mascote 3D

O mascote é **procedural**: construído com esferas, cone e toros em código, com animação
calculada por frame (respiração, piscada, balanço de cabeça, asas, inércia de mouse). Não é um
modelo esculpido nem escaneado do desenho original.

Para usar um modelo real, exporte um `.glb` e defina `VITE_DUCK_MODEL_URL` no `.env`:

```
VITE_DUCK_MODEL_URL=/models/duck.glb
```

Sem essa variável nenhuma requisição é feita para um arquivo inexistente. A imagem
`public/pato-mascote.png` é a referência original, mantida no repositório.

## Degradação

- Sem WebGL: o hero troca o canvas pela ilustração estática (`public/duck.webp`).
- Pouco movimento (`prefers-reduced-motion`): animações e scroll suave são desligados.
- Aba em segundo plano: o loop de render é pausado pelo `Canvas` do R3F.

## Avisos

Os links do catálogo apontam para sites de terceiros, cada um com sua própria política. Vários
foram classificados como risco alto (revenda de acesso a modelos, arquivos de origem desconhecida,
ferramentas ofensivas). As descrições indicam quando a página **não** pôde ser verificada. Nada é
hospedado, espelhado ou recomendado por este site.
