# Execução da identidade visual — 18/09/2026

## Decisões

- Direção adotada: **Campo próximo** (`DESIGN.md`).
- Sem skill externa de direção visual: a skill de website disponível cria e publica
  outro produto e conflita com este React/CRA existente. Graphify, revisão React
  e navegador foram usados para navegação, qualidade e inspeção.
- Sem nova chamada de inferência: a bancada lê somente mensagens, arquivo local,
  SSE e diagnóstico já existentes.
- Foto USDA em domínio público é exemplo documental; a mídia final de abertura
  continua pendente (`ASSETS.md`).

## Etapas A–I

| Etapa | Estado | Evidência / decisão |
| --- | --- | --- |
| A | concluída | `BASELINE.md`; Graphify e testes de baseline registrados |
| B | concluída com mídia pendente | duas direções documentadas; Campo próximo escolhida; inventário e brief em `ASSETS.md` |
| C | concluída | tokens, Page, nav, upload, plano de ação, cotas e estados globais consolidados |
| D | concluída | home, login e redefinição revisados; a demonstração local agora declara simulação no próprio formulário e não promete chat anônimo |
| E | concluída | bancada preserva SSE, voz, cancelamento, HITL e sessões; status sem progresso fictício |
| F | concluída | resultado/detalhe/histórico preservam hipótese, plano, paginação e gates |
| G | concluída | perfil, planos, ativação, modelos, sobre, API e 404 seguem a linguagem de fichas; modelos ganhou quadro de contexto e API, marcações de método |
| H | parcial | mídia autorizada de exemplo incorporada; captura própria final e vídeo permanecem pendentes |
| I | concluída com limites externos | testes, build, navegador e grafo atualizados; limites abaixo |

## Cobertura por rota

| Rota | Claro/escuro | Teclado/zoom | Estados verificados | Pendência |
| --- | --- | --- | --- | --- |
| `/` | claro e escuro em 390 | skip link e foco visível | sucesso/demo | captura final de abertura; zoom 200% manual |
| `/login`, `/redefinir-senha` | escuro em 390; login também em claro | Tab alcançou o campo de e-mail | entrada/demo, recuperação sem token, sem overflow em 360 | e-mail real |
| `/chat` | escuro em 360, 390 e 1366 | controles têm nome; Tab manual parcial | vazio, prévia, espera e resultado demo | HITL visual, câmera/mic físico e SSE real |
| `/historico`, detalhe | rota carregada em 768 | não ensaiado manualmente | rota, tema e sem overflow | Storage/PDF manual real |
| `/perfil` | rota carregada em 768 | não ensaiado manualmente | rota, tema e sem overflow | API local |
| planos/ativação | rota carregada em 768 e 1366 | não ensaiado manualmente | gate, demo e sem overflow | cobrança real fora de escopo |
| modelos/sobre/API/404 | modelos/API em 390; rotas restantes em 768 | teclado no retorno 404 | conteúdo, retorno e sem overlay | — |

## Verificações executadas

- `npm.cmd test -- --watchAll=false --runInBand`: **15 suítes, 81 testes**.
  Inclui verificações da bancada: resultado antigo não é associado à foto mais
  recente; o diagnóstico posterior aparece na ficha da foto atual; pergunta
  HITL continua visível junto da foto em análise.
- `npm.cmd run build`: passou. Bundle inicial `334,51 kB gzip` (+292 B); avisos
  pré-existentes de Browserslist e sourcemaps ausentes de `fetch-event-source`.
- Navegador demo: home claro/escuro, login, redefinição, modelos, API, histórico,
  planos e 404 nas larguras 360/390/768/1366. Fluxo de chat anterior cobriu
  foto → prévia → espera → resultado simulado. `scrollWidth === innerWidth` em
  360 e 768 e não excedeu a viewport em 390/1366; rotas carregaram sem overlay
  nem console errors. Tab no 404 alcançou o link de retorno com `outline: solid`.
- Grafo canônico da raiz atualizado localmente por AST: 4.059 nós, 9.300
  arestas e 247 comunidades após `graphify update . --no-cluster` e
  `graphify cluster-only .` (a execução ocorreu na raiz do workspace).
  O update estrutural confirmou `DiagnosisCard → useActionPlan → getActionPlan`.
  A bancada (`ObservationWorkspace`) recebe apenas mensagens, loading e HITL de
  `ChatWindow`; não há caminho estrutural direto dela para `sendMessageStream`.
  Relação confirmada também por leitura de `ChatWindow.js` e `useChat.js`.

Mock confirma composição e transporte simulado; não confirma inferência.
Integração local, inferência real, produção, voz/câmera em telefone físico,
leitor de tela e zoom 200% continuam verificações separadas e pendentes.
