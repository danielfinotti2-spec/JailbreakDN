/* ---------------------------------------------------------------
   Resource catalog — the single source of truth for every external
   link on the site.

   Every URL below is reproduced verbatim from the brief, including
   invite and referral parameters. Nothing is rewritten or shortened.

   `descricao` and `verificado` reflect what was actually observed by
   fetching each page. Where a page could not be inspected, the entry
   says so instead of inventing a description.
   --------------------------------------------------------------- */

export type RiskLevel = "none" | "caution" | "high";

export interface Resource {
  id: string;
  nome: string;
  url: string;
  categoria: CategoriaId;
  subcategoria: string;
  origem: string;
  descricao: string;
  /** What kind of thing sits behind the link. */
  tipo: "site" | "video" | "repositorio" | "download" | "artigo";
  /** Was the page actually fetched and read? */
  verificado: boolean;
  /** Only set when the page itself showed this information. */
  conta?: boolean | "desconhecido";
  preco?: string;
  risco: RiskLevel;
  avisos?: string[];
}

export type CategoriaId = "privacidade" | "ia" | "re" | "cursos" | "outros";

export interface Categoria {
  id: CategoriaId;
  nome: string;
  resumo: string;
}

export const CATEGORIAS: Categoria[] = [
  {
    id: "privacidade",
    nome: "Privacidade, VPN e sistemas",
    resumo:
      "Ferramentas de rede, criptografia e sistemas operacionais voltados a reduzir exposição. Nenhuma delas garante anonimato — cada uma protege uma parte específica do problema.",
  },
  {
    id: "ia",
    nome: "Modelos de IA e APIs",
    resumo:
      "Diretórios de modelos, provedores de inferência e consoles de API. A maioria exige conta ou chave própria; nunca cole sua chave em sites de terceiros.",
  },
  {
    id: "re",
    nome: "Engenharia reversa e segurança",
    resumo:
      "Material de estudo e ferramentas de análise. Use em sistemas que você possui ou tem autorização escrita para testar. Arquivos executáveis de origem desconhecida trazem risco real.",
  },
  {
    id: "cursos",
    nome: "Cursos, vídeos e mídia",
    resumo: "Vídeos e publicações para aprender. Disponibilidade e conteúdo podem mudar sem aviso.",
  },
  { id: "outros", nome: "Outros", resumo: "Links que ainda não tiveram a finalidade confirmada." },
];

export const SUBCATEGORIAS: Record<CategoriaId, string[]> = {
  privacidade: ["VPN", "Anonimato e roteamento", "Sistema operacional", "Criptografia", "Utilitários"],
  ia: ["Diretório de modelos", "Provedor de inferência", "Console de API", "Ferramenta de desenvolvimento", "Institucional"],
  re: ["Educação", "Análise de segurança", "Offsets e SDK", "Arquivos e downloads"],
  cursos: ["Vídeo", "Publicação"],
  outros: ["Não verificado"],
};

export const RESOURCES: Resource[] = [
  /* ---------------- A — Privacidade, VPN e sistemas ---------------- */
  {
    id: "protonvpn",
    nome: "Proton VPN",
    url: "https://protonvpn.com/download",
    categoria: "privacidade",
    subcategoria: "VPN",
    origem: "Proton AG",
    descricao:
      "Página oficial de downloads dos aplicativos Proton VPN para Windows, macOS, Linux, Android e iOS. A própria empresa descreve os apps como de código aberto e auditados, e informa que já usam contas Proton.",
    tipo: "site",
    verificado: true,
    conta: true,
    preco: "Plano gratuito e planos pagos anunciados no site; valores não conferidos item a item.",
    risco: "none",
    avisos: [
      "Uma VPN troca o endereço IP visto pelos sites e protege o tráfego até o servidor. Ela não torna você anônimo nem impede rastreamento por outros meios.",
    ],
  },
  {
    id: "cyberghost",
    nome: "CyberGhost",
    url: "https://www.cyberghostvpn.com/",
    categoria: "privacidade",
    subcategoria: "VPN",
    origem: "CyberGhost VPN",
    descricao:
      "Site principal de um serviço de VPN comercial, com navegação por recursos, oferta promocional ativa e botão de assinatura.",
    tipo: "site",
    verificado: true,
    conta: "desconhecido",
    preco: "Valores não visíveis no conteúdo carregado; a página cita garantia de reembolso em 45 dias.",
    risco: "caution",
    avisos: [
      "VPN comercial registra metadados de conexão conforme sua própria política. Leia o documento de privacidade antes de confiar.",
    ],
  },
  {
    id: "tails",
    nome: "Tails",
    url: "https://tails.net/",
    categoria: "privacidade",
    subcategoria: "Sistema operacional",
    origem: "Tails Project",
    descricao:
      "Sistema operacional que inicia a partir de um dispositivo externo e não deixa rastros no computador por padrão. Todo o tráfego é encaminhado pela rede Tor.",
    tipo: "site",
    verificado: true,
    conta: false,
    risco: "none",
    avisos: [
      "Protege o computador local e a saída da rede, mas não esconde que você está usando Tor de quem controla a rede ou o site visitado.",
    ],
  },
  {
    id: "kodachi",
    nome: "Kodachi OS",
    url: "https://kodachi.cloud/",
    categoria: "privacidade",
    subcategoria: "Sistema operacional",
    origem: "kodachi.cloud — canal oficial não confirmado",
    descricao:
      "Site de uma distribuição Linux de privacidade (base Debian) que se descreve como trazendo dashboard próprio, múltiplos protocolos de roteamento (Tor, OpenVPN, WireGuard) e ferramentas antiforense.",
    tipo: "site",
    verificado: true,
    conta: false,
    preco: "A página cita uso pessoal gratuito e plano Premium por dispositivo/ano; valores sujeitos a mudança.",
    risco: "caution",
    avisos: [
      "O domínio não pôde ser confirmado como canal oficial do projeto — historicamente distribuído por outro site. Verifique a origem antes de baixar uma ISO.",
      "A página usa linguagem de marketing intensa (canário de mandado, hospedagem resistente a DMCA). Trate as alegações como do próprio projeto.",
    ],
  },
  {
    id: "whonix",
    nome: "Whonix",
    url: "https://www.whonix.org/",
    categoria: "privacidade",
    subcategoria: "Anonimato e roteamento",
    origem: "Whonix Project",
    descricao:
      "Distribuição que separa as funções de rede (Gateway) e trabalho (Workstation) em duas máquinas virtuais, de forma que um vazamento no sistema de trabalho não exponha o IP real.",
    tipo: "site",
    verificado: true,
    conta: false,
    risco: "none",
    avisos: [
      "Só funciona dentro de um hypervisor (VirtualBox, KVM). Erros do próprio usuário continuam capazes de revelar informação.",
    ],
  },
  {
    id: "pureos",
    nome: "PureOS",
    url: "https://pureos.net/",
    categoria: "privacidade",
    subcategoria: "Sistema operacional",
    origem: "Purism",
    descricao:
      "Distribuição GNU/Linux que se apresenta como livre e voltada a privacidade, oficialmente associada ao hardware da Purism.",
    tipo: "site",
    verificado: true,
    conta: false,
    risco: "none",
  },
  {
    id: "qubes",
    nome: "Qubes OS",
    url: "https://www.qubes-os.org/",
    categoria: "privacidade",
    subcategoria: "Sistema operacional",
    origem: "Invisible Things Lab",
    descricao:
      "Sistema que compartimenta cada atividade em uma máquina virtual isolada, de forma que um comprometimento em uma área não afete as demais.",
    tipo: "site",
    verificado: true,
    conta: false,
    risco: "none",
    avisos: ["Exige hardware compatível e razoavelmente potente; não é uma proteção contra ameaças físicas."],
  },
  {
    id: "veracrypt",
    nome: "VeraCrypt",
    url: "https://veracrypt.io/en/Downloads.html",
    categoria: "privacidade",
    subcategoria: "Criptografia",
    origem: "IDRIX",
    descricao:
      "Página de downloads de um software de criptografia de disco, usado para criar volumes protegidos por senha.",
    tipo: "download",
    verificado: true,
    conta: false,
    risco: "caution",
    avisos: [
      "Uma senha fraca derrota qualquer criptografia. Também é preciso manter cópias de segurança: um volume corrompido não tem recuperação.",
    ],
  },
  {
    id: "usboblivion",
    nome: "Histórico de USB no Windows",
    url: "https://www.thewindowsclub.com/usboblivion-remove-usb-traces-windows",
    categoria: "privacidade",
    subcategoria: "Utilitários",
    origem: "The Windows Club",
    descricao:
      "Artigo que ensina a consultar o histórico de dispositivos USB no Windows 11 pelo registro e pelo PowerShell, e recomenda ferramentas como USBDeview, USBOblivion e USBDriveLog para listar ou apagar esses rastros.",
    tipo: "artigo",
    verificado: true,
    conta: false,
    preco: "Ferramentas citadas descritas como gratuitas.",
    risco: "caution",
    avisos: [
      "O artigo contém links de afiliado para um produto de reparo de PC, sem relação com o procedimento descrito.",
      "Alterar o registro do Windows pode tornar o sistema instável. Faça backup antes.",
    ],
  },

  /* ---------------- B — Modelos de IA, APIs e plataformas ---------------- */
  {
    id: "huggingface",
    nome: "Hugging Face",
    url: "https://huggingface.co/",
    categoria: "ia",
    subcategoria: "Diretório de modelos",
    origem: "Hugging Face",
    descricao:
      "Plataforma onde comunidades e empresas publicam modelos, datasets e aplicações de aprendizado de máquina, com licenças que variam por repositório.",
    tipo: "site",
    verificado: true,
    conta: true,
    risco: "none",
    avisos: [
      "Cada repositório tem sua própria licença. Baixar um modelo executável em Python exige avaliar o que o código faz antes de rodar.",
    ],
  },
  {
    id: "inception",
    nome: "Inception",
    url: "https://www.inceptionlabs.ai/",
    categoria: "ia",
    subcategoria: "Provedor de inferência",
    origem: "Inception Labs",
    descricao:
      "Site de uma empresa de modelos de linguagem. O conteúdo é renderizado no navegador; a inspeção recuperou apenas o título 'Inception – When Every Millisecond Matters'.",
    tipo: "site",
    verificado: false,
    conta: "desconhecido",
    risco: "none",
    avisos: ["Descrição limitada — o corpo da página não pôde ser lido. Confirme a finalidade no próprio site."],
  },
  {
    id: "freellmapi",
    nome: "FreeLLMAPI",
    url: "https://freellmapi.co/models",
    categoria: "ia",
    subcategoria: "Diretório de modelos",
    origem: "freellmapi.co",
    descricao:
      "Catálogo navegável de modelos de linguagem acessíveis pelas camadas gratuitas de cada provedor, usando um roteador de código aberto auto-hospedado com endpoint compatível com a API da OpenAI.",
    tipo: "site",
    verificado: true,
    conta: true,
    preco: "Modelos gratuitos via camadas gratuitas dos provedores; a página também cita um plano pago para catálogo ao vivo.",
    risco: "caution",
    avisos: [
      "Você adiciona suas próprias chaves de provedor ao roteador — mantenha isso em máquina local e nunca versionado.",
      "A própria página exibe contagens de modelos inconsistentes entre si. Não trate o catálogo como inventário estável.",
    ],
  },
  {
    id: "unorouter",
    nome: "UnoRouter",
    url: "https://unorouter.com/en/models",
    categoria: "ia",
    subcategoria: "Provedor de inferência",
    origem: "unorouter.com",
    descricao:
      "Roteador de modelos que centraliza o acesso a diferentes provedores de IA por uma interface única.",
    tipo: "site",
    verificado: true,
    conta: true,
    risco: "caution",
    avisos: [
      "Ao passar por um intermediário, o operador tecnicamente alcança o prompt. Verifique a política de privacidade antes de enviar conteúdo sensível.",
    ],
  },
  {
    id: "nvidia-nim",
    nome: "NVIDIA NIM — DeepSeek V4 Flash",
    url: "https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731",
    categoria: "ia",
    subcategoria: "Provedor de inferência",
    origem: "NVIDIA (build.nvidia.com)",
    descricao:
      "Página do catálogo NVIDIA Build com o modelo deepseek-v4-flash-0731 disponibilizado via NIM, com exemplos de chamada por API.",
    tipo: "site",
    verificado: true,
    conta: true,
    risco: "none",
    avisos: [
      "O identificador inclui uma data de versão; confirme o nome atual antes de fixá-lo no código.",
      "O corpo da página é renderizado no cliente — apenas o título foi inspecionado.",
    ],
  },
  {
    id: "atria",
    nome: "Atria AI",
    url: "https://api.atria-asi.ai/console",
    categoria: "ia",
    subcategoria: "Console de API",
    origem: "Atria",
    descricao: "Console de uma plataforma de API para modelos; exige autenticação para uso.",
    tipo: "site",
    verificado: false,
    conta: true,
    risco: "none",
    avisos: ["Descrição limitada — o console exige login e não pôde ser inspecionado."],
  },
  {
    id: "jev",
    nome: "Jev AI Community",
    url: "https://www.jevai.org/",
    categoria: "ia",
    subcategoria: "Provedor de inferência",
    origem: "Comunidade (não oficial)",
    descricao:
      "Hub comunitário sobre o 'Jev Model' com demos, playbooks, plugins e trechos de API organizados por modo.",
    tipo: "site",
    verificado: true,
    conta: "desconhecido",
    risco: "caution",
    avisos: [
      "O próprio site declara não ser o site oficial: documentação e API ficam com a empresa responsável pelo modelo.",
      "Consulte a fonte oficial para qualquer informação de produto ou preço.",
    ],
  },
  {
    id: "anymodel",
    nome: "AnyModel",
    url: "https://anymodel.org/",
    categoria: "ia",
    subcategoria: "Provedor de inferência",
    origem: "anymodel.org",
    descricao:
      "Serviço que revende acesso a modelos Claude, Codex e GPT por uma única API cobrada por token, em página em russo com formulário de login embutido na home.",
    tipo: "site",
    verificado: true,
    conta: true,
    preco: "A página anuncia preços muito abaixo da tabela dos fornecedores originais (a própria página exibe a comparação).",
    risco: "high",
    avisos: [
      "Revende acesso a modelos de terceiros sem vínculo declarado com os criadores. Contas e chaves podem ser suspensas a qualquer momento.",
      "Preço muito abaixo do custo de origem é sinal de risco, não de vantagem: pode indicar chaves revendidas ou contas indevidas.",
      "Não envie prompts com dados pessoais ou confidenciais.",
    ],
  },
  {
    id: "dahl",
    nome: "Dahl Inference",
    url: "https://inference.dahl.global/",
    categoria: "ia",
    subcategoria: "Provedor de inferência",
    origem: "dahl.global",
    descricao:
      "Serviço de inferência para modelos abertos com endpoints compatíveis com a API da OpenAI, documentação de autenticação por chave e integração com editores de código.",
    tipo: "site",
    verificado: true,
    conta: true,
    risco: "none",
    avisos: ["A documentação descreve chaves Bearer e recarga de saldo. Nenhum preço foi exibido na inspeção."],
  },
  {
    id: "xkiro",
    nome: "xKiro",
    url: "https://xkiro.com/",
    categoria: "ia",
    subcategoria: "Ferramenta de desenvolvimento",
    origem: "xkiro.com",
    descricao:
      "Revendedor de tokens para agentes de IA que oferece uma chave única para modelos GPT, Claude, Gemini, DeepSeek e Qwen via SDK compatível com OpenAI e Anthropic.",
    tipo: "site",
    verificado: true,
    conta: true,
    preco: "A página exibe planos mensais pagos e cota gratuita diária mediante verificação em rede social.",
    risco: "high",
    avisos: [
      "Revenda acesso a modelos de terceiros sem vínculo com os criadores, com desconto anunciado muito acima do plausível.",
      "O catálogo usa nomes de modelo que não correspondem a versões oficiais publicadas — trate como não verificado.",
      "Não use para dados sensíveis.",
    ],
  },
  {
    id: "modelrouter",
    nome: "ModelRouter",
    url: "https://modelrouter.id/register?ref=MR-GAFAHM",
    categoria: "ia",
    subcategoria: "Provedor de inferência",
    origem: "modelrouter.id",
    descricao:
      "Cadastro de um roteador de modelos que oferece uma única API para vários modelos de fronteira. O link redireciona para a página de criação de conta e contém um código de indicação.",
    tipo: "site",
    verificado: false,
    conta: true,
    risco: "caution",
    avisos: [
      "O parâmetro ref= foi preservado exatamente como recebido e pode creditar quem indicou o link.",
      "O formulário de cadastro é renderizado no cliente e não pôde ser inspecionado.",
    ],
  },
  {
    id: "codecraftapi",
    nome: "CodeCraft API",
    url: "https://codecraftapi.com/?ref=CC8VLFK6",
    categoria: "ia",
    subcategoria: "Console de API",
    origem: "codecraftapi.com",
    descricao:
      "API agregadora compatível com OpenAI que dá acesso a modelos Claude, GPT, Gemini e DeepSeek por uma única chave, com planos por volume de tokens.",
    tipo: "site",
    verificado: true,
    conta: true,
    preco: "A página exibe camada gratuita com cota mensal e planos pagos por volume.",
    risco: "caution",
    avisos: [
      "O parâmetro ref= foi preservado como recebido e pode creditar quem indicou.",
      "Revenda de modelos de terceiros; o catálogo usa nomes de modelo não verificáveis.",
      "Não envie dados sensíveis.",
    ],
  },
  {
    id: "tokenharbor",
    nome: "Token Harbor",
    url: "https://tokenharbor.ai/login?invite=TH-J5HZ-C4QS",
    categoria: "ia",
    subcategoria: "Console de API",
    origem: "tokenharbor.ai",
    descricao:
      "Página de login de uma plataforma de acesso a modelos de IA. A inspeção recuperou apenas a marca e o estado de carregamento.",
    tipo: "site",
    verificado: false,
    conta: true,
    risco: "caution",
    avisos: [
      "O parâmetro invite= foi preservado. A finalidade do serviço não foi confirmada.",
      "Plataformas que revendem acesso a modelos exigem cuidado com qualquer chave ou dado enviado.",
    ],
  },
  {
    id: "apinex",
    nome: "APINex",
    url: "https://apinex.bond/",
    categoria: "ia",
    subcategoria: "Console de API",
    origem: "apinex.bond",
    descricao: "Serviço de acesso a APIs de modelos. Não verificado.",
    tipo: "site",
    verificado: false,
    conta: "desconhecido",
    risco: "high",
    avisos: [
      "O domínio usa a extensão .bond, comum em registros baratos e efêmeros. Não há identidade corporativa verificável.",
      "Nunca envie chaves de outros provedores nem dados sensíveis.",
    ],
  },
  {
    id: "river",
    nome: "River AI",
    url: "https://console.river.ai/",
    categoria: "ia",
    subcategoria: "Console de API",
    origem: "console.river.ai",
    descricao:
      "Console de acesso a modelos de IA. Na inspeção a página exibiu uma mensagem de falha ao carregar.",
    tipo: "site",
    verificado: false,
    conta: true,
    risco: "none",
    avisos: ["A página retornou erro de carregamento; a disponibilidade pode variar."],
  },
  {
    id: "claude-startups",
    nome: "Claude Startups",
    url: "https://claude.com/programs/startups",
    categoria: "ia",
    subcategoria: "Institucional",
    origem: "Anthropic",
    descricao:
      "Página do programa da Anthropic voltado a startups, apresentando produtos (API, Claude Code) e inscrição em newsletter. Nenhuma oferta de créditos aparece na página.",
    tipo: "site",
    verificado: true,
    conta: false,
    risco: "none",
    avisos: ["Condições e eventuais créditos são definidos pela Anthropic e não foram verificados aqui."],
  },
  {
    id: "antigravity",
    nome: "Google Antigravity",
    url: "https://antigravity.google/download",
    categoria: "ia",
    subcategoria: "Ferramenta de desenvolvimento",
    origem: "Google",
    descricao: "Página de download de uma ferramenta de desenvolvimento de um produto do Google.",
    tipo: "download",
    verificado: true,
    conta: "desconhecido",
    risco: "none",
  },
  {
    id: "america-gov",
    nome: "America.gov",
    url: "https://america.gov/",
    categoria: "ia",
    subcategoria: "Institucional",
    origem: "Governo dos Estados Unidos",
    descricao:
      "Portal do governo norte-americano que permite descrever o que você precisa em linguagem natural e responde com referências a fontes oficiais.",
    tipo: "site",
    verificado: true,
    conta: false,
    preco: "Uso gratuito, sem anúncios, segundo a própria página.",
    risco: "none",
    avisos: ["Não é um provedor de API de IA; a relação com o catálogo é apenas de referência institucional."],
  },

  /* ---------------- C — Engenharia reversa, segurança e ferramentas ---------------- */
  {
    id: "curso-re",
    nome: "Curso de Engenharia Reversa — Aula 0",
    url: "https://www.youtube.com/watch?v=IkUfXfnnKH4&list=PLIfZMtpPYFP6zLKlnyAeWY1I85VpyshAA",
    categoria: "re",
    subcategoria: "Educação",
    origem: "Mente Binária (@mentebinaria)",
    descricao:
      "Vídeo 'Curso de Engenharia Reversa Online - Aula 0 - Como funciona a Engenharia Reversa', publicado no canal Mente Binária, com uma playlist associada.",
    tipo: "video",
    verificado: true,
    conta: false,
    risco: "none",
  },
  {
    id: "winrepl",
    nome: "WinREPL",
    url: "https://www.youtube.com/watch?v=RF3-qDy-xMs&list=PLIfZMtpPYFP6_YOrfX79YX79I5V6mS0ci",
    categoria: "re",
    subcategoria: "Educação",
    origem: "Mente Binária (@mentebinaria)",
    descricao:
      "Vídeo 'WinREPL', do canal Mente Binária, sobre um REPL de linha de comando para workbench RE.",
    tipo: "video",
    verificado: true,
    conta: false,
    risco: "none",
  },
  {
    id: "shodan",
    nome: "Shodan",
    url: "https://www.shodan.io/dashboard",
    categoria: "re",
    subcategoria: "Análise de segurança",
    origem: "Shodan",
    descricao:
      "Painel de um motor de busca que indexa dispositivos e serviços expostos na internet. O acesso a esta página exige autenticação.",
    tipo: "site",
    verificado: false,
    conta: true,
    risco: "caution",
    avisos: [
      "O painel respondeu 401 e não pôde ser inspecionado.",
      "Consultar é pesquisar; acessar, testar ou medir dispositivos de terceiros sem autorização é ilegal na maioria das jurisdições.",
    ],
  },
  {
    id: "hexstrike",
    nome: "HexStrike AI MCP",
    url: "https://github.com/0x4m4/hexstrike-ai",
    categoria: "re",
    subcategoria: "Análise de segurança",
    origem: "GitHub — 0x4m4 (OTT Cybersecurity LLC)",
    descricao:
      "Servidor MCP em Python que conecta agentes de IA a mais de 150 ferramentas de segurança ofensiva para pentest automatizado, instalado via git clone e pip.",
    tipo: "repositorio",
    verificado: true,
    conta: false,
    risco: "high",
    avisos: [
      "O README expõe um endpoint /api/command que executa comandos arbitrários sem autenticação; representar como serviço exposto pode entregar controle da máquina a terceiros.",
      "O próprio README recomenda execução em ambiente isolado.",
      "As instruções do projeto orientam a instruir o modelo a contornar as próprias salvaguardas éticas.",
      "Use apenas em laboratório isolado, contra sistemas próprios ou com autorização escrita.",
    ],
  },
  {
    id: "cassandra",
    nome: "Cassandra v2",
    url: "https://www.youtube.com/watch?v=w1mVDOC4ykk",
    categoria: "re",
    subcategoria: "Educação",
    origem: "YouTube — Mörlsara OFTEC",
    descricao:
      "Vídeo intitulado 'Cassandra v2 - Ferramenta de automação em Hacking ( Sem Censura )', do canal Mörlsara OFTEC.",
    tipo: "video",
    verificado: true,
    conta: false,
    risco: "caution",
    avisos: [
      "O título anuncia uma ferramenta de automação de inovação e indica 'sem censura'. O conteúdo do vídeo não foi assistido, então a finalidade exata não está confirmada.",
    ],
  },
  {
    id: "andromeda",
    nome: "Andromeda SDK",
    url: "https://andromeda-sdk.com/overview",
    categoria: "re",
    subcategoria: "Offsets e SDK",
    origem: "andromeda-sdk.com",
    descricao:
      "Página cujo único texto observável é o título 'Andromeda · Offsets & Patterns'. O restante é renderizado por JavaScript e não pôde ser lido.",
    tipo: "site",
    verificado: false,
    conta: "desconhecido",
    risco: "high",
    avisos: [
      "Conteúdo não verificável. 'Offsets & patterns' são termos típicos de SDK de modificação de jogos.",
      "O domínio não tem identidade organizacional pública.",
    ],
  },
  {
    id: "hwidr-dump",
    nome: "HWIDR SDK Dump",
    url: "https://deko661.github.io/hwidr-dump-site/",
    categoria: "re",
    subcategoria: "Offsets e SDK",
    origem: "GitHub Pages — conta 'deko661'",
    descricao:
      "Página no GitHub Pages cujo único texto observável é 'HWIDR SDK Viewer - Loading...'. O conteúdo dinâmico não foi carregado na inspeção.",
    tipo: "site",
    verificado: false,
    conta: "desconhecido",
    risco: "high",
    avisos: [
      "Não foi possível verificar o que a página carrega depois do estado de carregamento.",
      "Hospedado em conta pessoal, sem identidade organizacional. O caminho associa 'dump' a SDK e HWID.",
    ],
  },
  {
    id: "rustoffsets",
    nome: "RustOffsets",
    url: "https://www.rustoffsets.com/",
    categoria: "re",
    subcategoria: "Offsets e SDK",
    origem: "rustoffsets.com (operador 'jeromington2')",
    descricao:
      "Site que publica offsets do jogo Rust ('Rust · Il2Cpp offsets') e oferece endpoints de API para baixar offsets.json e offsets.hpp.",
    tipo: "site",
    verificado: true,
    conta: false,
    risco: "high",
    avisos: [
      "Conteúdo voltado a modificação de jogo. Usar isso para obter vantagem indevida pode violar os termos do jogo e, em alguns contextos, a lei.",
      "A página exibe um pedido de doação em criptomoeda e não mostra identidade corporativa.",
      "Os arquivos da API não foram baixados nem analisados.",
    ],
  },
  {
    id: "junin-dumper",
    nome: "JUNIN DUMPER (MediaFire)",
    url: "https://www.mediafire.com/file/ta15mq6f9zm29qb/JUNIN+DUMPER.rar/file",
    categoria: "re",
    subcategoria: "Arquivos e downloads",
    origem: "MediaFire — autor não identificado",
    descricao:
      "Página de compartilhamento de um arquivo .rar chamado 'JUNIN DUMPER'. O conteúdo do arquivo, seu tamanho, data e autor não puderam ser verificados.",
    tipo: "download",
    verificado: true,
    conta: false,
    risco: "high",
    avisos: [
      "Arquivo compactado de origem desconhecida. Não há como verificar o conteúdo sem baixá-lo e analisá-lo.",
      "Este site não hospeda, espelha nem recomenda o download.",
      "Hospedagem em serviço conhecido não atesta a segurança do arquivo.",
    ],
  },

  /* ---------------- D — Cursos, vídeos e outros recursos ---------------- */
  {
    id: "internet-offline",
    nome: "Internet offline",
    url: "https://youtu.be/WF0ySfcEMUw?si=m48r99H8mcXj4s9h",
    categoria: "cursos",
    subcategoria: "Vídeo",
    origem: "YouTube — Slackjeff",
    descricao:
      "Vídeo 'CRIE uma INTERNET OFFLINE que Funciona Sem Conexão!', do canal Slackjeff, sobre montar e servir uma rede local sem depender de internet.",
    tipo: "video",
    verificado: true,
    conta: false,
    risco: "none",
  },
  {
    id: "iadodia",
    nome: "ia·do·dia",
    url: "https://iadodia.com.br/",
    categoria: "cursos",
    subcategoria: "Publicação",
    origem: "Multcode",
    descricao:
      "Boletim diário em português que resume e comenta notícias de IA para desenvolvedores, com assinatura por e-mail e links para as fontes originais.",
    tipo: "site",
    verificado: true,
    conta: true,
    risco: "none",
    avisos: ["A newsletter coleta e-mail; consulte a política de privacidade antes de assinar."],
  },
  {
    id: "osx-reims",
    nome: "OSX-REIMS",
    url: "https://www.osx-reims.com/en-us/",
    categoria: "cursos",
    subcategoria: "Publicação",
    origem: "Universo Hackintosh",
    descricao:
      "Apresentação do OSX-REIMS 0.6.0, ferramenta de linha de comando para criar e gerenciar máquinas virtuais de macOS no Ubuntu, distribuída como pacote .deb apenas para assinantes pagos.",
    tipo: "download",
    verificado: true,
    conta: true,
    preco: "Acesso pago por assinatura; distribuição por link pessoal no Discord.",
    risco: "caution",
    avisos: [
      "A própria página declara software em fase alpha, sem garantia nem suporte.",
      "Integra EFI/OpenCore de terceiros e gera um número de série de máquina por VM.",
      "Rodar macOS em hardware que não é Apple pode conflitar com a licença da Apple.",
      "O .deb não foi baixado nem avaliado.",
    ],
  },

  /* ---------------- E — Outro link compartilhado ---------------- */
  {
    id: "installer-degolado",
    nome: "Installer (iOS)",
    url: "https://installer.degolado.workers.dev/",
    categoria: "outros",
    subcategoria: "Não verificado",
    origem: "Cloudflare Workers — operador zeeX",
    descricao:
      "A página apenas anuncia que o projeto mudou para installer.zeex.lol e redireciona para lá após alguns segundos. Não é um instalador oficial da Apple.",
    tipo: "download",
    verificado: true,
    conta: "desconhecido",
    risco: "high",
    avisos: [
      "A página exibida não hospeda nada: ela só redireciona para outro domínio (zeex.lol).",
      "O destino oferece perfil de DNS para iOS com 'anti-revoke protection' e um arquivo .ipa hospedado em raw.githubusercontent.com.",
      "Instalar perfis de configuração ou apps fora da App Store pode expor o dispositivo e violar os termos da Apple.",
      "Este site não oferece nem recomenda a instalação. Nada foi baixado na verificação.",
    ],
  },
];

/* ---------------- Helpers ---------------- */

export const RISCO_LABEL: Record<RiskLevel, string> = {
  none: "Sem alertas",
  caution: "Atenção",
  high: "Risco alto",
};

export const TIPO_LABEL: Record<Resource["tipo"], string> = {
  site: "Site",
  video: "Vídeo",
  repositorio: "Repositório",
  download: "Download",
  artigo: "Artigo",
};

export const totalLinks = RESOURCES.length;
export const totalVerificados = RESOURCES.filter((r) => r.verificado).length;


