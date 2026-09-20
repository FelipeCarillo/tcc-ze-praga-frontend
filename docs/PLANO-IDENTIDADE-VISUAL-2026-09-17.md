# Zé Praga: estudo e plano de refatoração visual

Data de referência: 17/09/2026. Executor previsto: Terra, em uma tarefa com acesso ao workspace. Estado: planejamento, sem implementação da refatoração. Base inspecionada: frontend `bbe8a9d`, inicialmente sem alterações locais no Git.

## 1. Decisão central

Transformar o Zé Praga em um **caderno de campo visual para observar a folha da soja**. A fotografia enviada, a hipótese e os próximos passos passam a organizar a experiência. A conversa permanece disponível para dúvidas e perguntas do agente, mas deixa de determinar a composição de toda a aplicação.

O objetivo é personalidade e adequação ao trabalho no campo. A interface deve continuar informando que a análise usa modelos computacionais. Não criar a impressão de atendimento por um agrônomo humano nem esconder limitações para parecer menos “IA”.

Direção recomendada: **Campo próximo**. Fotografias documentais de soja e de observação da folha; enquadramentos amplos na apresentação; fichas legíveis na área de trabalho; verde, papel e marca existentes; movimento restrito a mudanças de estado e a uma peça audiovisual opcional. A assinatura do produto será a continuidade visual entre **folha fotografada → ficha da análise → registro no histórico**.

Esta é uma decisão de projeto proposta, não um resultado comprovado por pesquisa com usuários. “Parecer feito por IA” é uma percepção subjetiva: validar especificidade, clareza e autenticidade com pessoas, sem prometer que uma skill elimina essa percepção.

## 2. O que foi estudado e o que foi observado

Foram consultados o grafo estrutural, fontes do frontend, a auditoria de 06/09 e a entrega local de 08/09. Foi iniciada uma demonstração isolada em `127.0.0.1:3191`, com as flags de mock do script existente. Inspeção de navegador: início, login e estado inicial do chat, no tema escuro e viewport desktop. A entrada demonstrativa foi usada sem credenciais pessoais. Wildfarmed também foi inspecionado visualmente no navegador.

Não foi feita nesta rodada uma auditoria visual completa de todas as páginas, teste de celular físico, teste automatizado, inferência real, avaliação ONNX ou validação de produção. Os números de testes de documentos anteriores são históricos. Não tratá-los como resultado desta rodada.

### Achados atuais

| Evidência | Interpretação e consequência para o plano |
|---|---|
| `src/theme/theme.js` já tem verde mata, papel, terracota, Bricolage Grotesque e DM Sans | A identidade não precisa começar do zero. Preservar fontes e cores; mudar composição, proporção e uso dos componentes. |
| `LandingPage.js` já usa `soybean-rust.jpg`, CTA de análise e três cartões de passos | Acrescentar apenas outra foto não resolve a repetição estrutural. Substituir o padrão de bloco de texto + fotografia arredondada + três cartões iguais por uma abertura documental e uma sequência visual. |
| `FieldPhoto` anima zoom/deslocamento e uma faixa de luz em loop | O efeito dá movimento à foto, mas não documenta uma cena real. Remover a varredura luminosa; usar fotografia estática ou vídeo real com controle. |
| O chat já prioriza câmera/galeria, mas mantém título central, campo fixo inferior e mensagens com avatar | A mudança principal deve acontecer na estrutura da tarefa, não só no tema dos balões. |
| `TypingIndicator.js` digita/apaga frases; `copy/ze.js` inclui “Quase fechando uma resposta…” e “Encontrei algo útil…” | Trocar por estado estável correspondente a eventos existentes. Frases temporizadas não comprovam avanço ou descoberta. |
| `useChat.js` oferece `onToken`, `onToolCall`, `onToolResult`, `onDiagnosis`, `onTranscript`, `onInterrupt` e `onDone` | Há base para reorganizar a apresentação preservando SSE, voz e intervenção humana. Não inventar um novo protocolo para fazer o layout. |
| `DiagnosisCard.js` e `DiagnosisDetailPage.js` apresentam o mesmo domínio em contextos diferentes | Extrair apresentação comum para o resultado, com variantes compacta/completa, sem duplicar busca, salvamento ou inferência. |
| Login renderiza “Não precisa de conta pra usar o chat”, mas `/chat` redireciona ao login | Contradição atual confirmada em navegador e código. Corrigir como parte de UX-004/UX-012; não copiar a conclusão histórica de “resolvido” sem conferir. |
| Há rota `*`, tokens de contraste ajustados, estados comuns e documento de entrega em 08/09 | Vários problemas da auditoria antiga já receberam trabalho. Revalidar, preservar e evitar refazê-los integralmente. |
| Há componentes antigos em `components/Landing/`, mas a página inicial atual é implementada diretamente em `LandingPage.js` | Confirmar imports e renderização antes de editar; aparência de arquivo relevante não prova uso. |

A amostra local da foto tem 238.481 bytes. Não foi localizado crédito nas buscas dirigidas em `docs/` e no README. Isso não prova ausência de licença: localizar a origem antes de incorporá-la ao pacote final de mídia.

## 3. Pesquisa web aplicada

As observações de marca abaixo são referências de direção, não autorização para copiar layouts, textos, fotografias ou promessas comerciais.

| Referência | O que aproveitar | Adaptação ao Zé Praga |
|---|---|---|
| [Wildfarmed](https://wildfarmed.com/) | Na abertura inspecionada, cena em movimento em grande escala, marca forte e ligação explícita com agricultura. | Mostrar o mundo da soja antes de explicar tecnologia. Não reproduzir verde fluorescente, formas onduladas ou navegação comercial. |
| [Patagonia Provisions](https://www.patagonia.com/provisions/) | Conteúdo editorial associa pessoas, lugares, legendas e autoria das fotografias à história do produto. Página consultada por conteúdo; não houve inspeção visual integral. | Usar fotos da equipe e do processo real, acompanhadas de contexto verificável. O trabalho de TCC deve ser reconhecível sem depoimentos inventados. |
| [Plantix](https://plantix.net/en/) | O site comunica uma tarefa agrícola concreta: fotografia e consulta sobre problemas da cultura. Conteúdo e navegação consultados; aplicativo não testado. | Aprender com a clareza da tarefa. Não importar sua amplitude de culturas, promessas de tempo ou comunidade de especialistas. |
| [NN/g: Photos as Web Content](https://www.nngroup.com/articles/photos-as-web-content/) | A pesquisa distingue imagens que informam de imagens usadas apenas para preencher a página. | Uma foto precisa mostrar como fotografar, o que foi enviado ou quem realizou o trabalho. Paisagem sozinha não explica o produto. |
| [Anthropic: frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Orientação de projeto ancorada no assunto e crítica de escolhas automáticas de composição. | Aplicar o briefing específico deste documento. Trocar todos os cartões por um “jornal bege” também pode produzir outro template. |

Conclusão de projeto: a combinação mais promissora é **conteúdo próprio + composição específica + resultado fácil de consultar**. Fotos e vídeo entram depois de definida a tarefa que cada peça ajuda a entender. Não há evidência nesta pesquisa de que mais animação produza mais autenticidade.

## 4. Direção visual executável

### Alternativas consideradas

| Direção | Vantagem | Limite | Decisão |
|---|---|---|---|
| Campo próximo: fotografia documental + ficha de observação | Une identidade agrícola e uso diário; aproveita a marca atual | Depende de curadoria de fotos | Recomendada |
| Atlas botânico: espécimes, nomes científicos e diagramas | Expressa método e precisão | Pode parecer uma publicação acadêmica densa | Usar pontualmente em Modelos e nas explicações |
| Filme de marca: tela inteira, vídeo e transições de rolagem | Forte impacto na abertura | Pode atrasar a tarefa e excluir aparelhos modestos | Apenas uma peça opcional; não governa o aplicativo |

### Regras de composição

1. **Uma assinatura memorável:** foto de observação da soja e sua ficha correspondente. Não adicionar simultaneamente mascote animado, partículas, textura, carrossel e parallax.
2. Na home, uma fotografia documental ampla, com corte pensado para desktop e celular. Texto em área própria e legível; não depender de texto sobre detalhes da folha.
3. Na aplicação, imagem sem filtros ou alterações cromáticas; painel de resultado com títulos, parágrafos curtos, divisórias e ações claras.
4. Cartões somente quando representam unidades independentes. Orientações relacionadas podem ser seções do mesmo documento, não cartões dentro de cartões.
5. MUI continua responsável por controles, foco, menus, dialogs e formulários. Customizar tokens e variantes, não reimplementar componentes acessíveis do zero.
6. Não redesenhar marca, criar nova mascote ou trocar toda a tipografia. Remover repetição do avatar em cada seção estruturada; a marca permanece na navegação.
7. Não usar “carimbo de aprovado”, escudo de segurança ou selo profissional no diagnóstico: comunicariam uma validação inexistente.

### Tokens propostos para ensaio visual

Estes valores orientam protótipos e devem ser medidos em contexto; não são certificação de contraste.

| Papel | Decisão |
|---|---|
| Base clara | `brand.papel` #FBF7EE, `brand.papel2` #F4EEDF; ficha branca quando necessária |
| Estrutura e texto | `brand.mata` #1F5A3D e `brand.solo` #1C2A20 |
| Ação | `primary.main`; conservar `secondary.main` #AA462B no claro para usos secundários apropriados, sem transformar toda ação em terracota |
| Tema escuro | Preservar superfícies `noite`, `noite2`, `noite3`, texto creme e primary claro existentes |
| Tipografia | Bricolage nos títulos, DM Sans na leitura; mono apenas em código/dados técnicos; Caveat opcional em uma assinatura editorial, nunca em formulário/status |
| Escala | Corpo 16–18 px; metadados 14 px; título de tarefa 28–36 px; título da home 40–64 px com limites responsivos |
| Comprimento | Texto de explicação com aproximadamente 55–75 caracteres por linha; títulos curtos |
| Raios | Controles em torno de 8 px; painéis 12 px; pílulas reservadas a chips; evitar raio de 999 px em todo botão |
| Espaço | Escala 4/8/12/16/24/32/48/64 px; margens mobile 16–20 px; conteúdo desktop até aproximadamente 1200 px |
| Fotografias | Home 16:9 ou 3:2, captura 4:3, histórico miniatura consistente; diagnóstico usa `contain` e ampliação, sem cortar lesão |

Preservar preferência de tema. A direção clara não justifica forçar tema em quem já escolheu escuro. Se consolidar famílias de fonte, verificar primeiro como são carregadas em `index.css` e `public/`.

## 5. Arquitetura das telas

Manter as URLs atuais nesta primeira refatoração. No produto, a entrada para `/chat` pode se chamar “Analisar uma folha”. Alterar o rótulo não exige alterar todos os links salvos.

### Home `/`

Ordem: marca e navegação enxuta; título e CTA; cena de observação; demonstração visual de fotografia adequada; exemplo de ficha claramente identificado; contexto do TCC; acesso a metodologia e conteúdos secundários.

Copy proposta: **“Olhe de perto. Entenda os sinais da soja.”** Apoio: “Envie uma foto da folha para consultar uma hipótese de doença e orientações de manejo.” CTA único predominante: **“Analisar uma folha”**. Explicar a necessidade de entrar antes da análise real.

O cenário deve mostrar soja e a prática de observação. Não usar campo de trigo, lavoura genérica ou alguém com tablet posando como agrônomo da equipe. Em falta de paisagem autorizada, usar um close documental da folha com composição honesta.

```text
Marca             Como funciona    O projeto       Entrar

Olhe de perto. Entenda os sinais da soja.
Explicação curta                 [Analisar uma folha]

┌─────────────────────────────────────────────────────┐
│ Foto ampla de uma pessoa observando folha de soja    │
└─────────────────────────────────────────────────────┘
Legenda verdadeira sobre a cena e crédito

Foto em foco / foto distante       Exemplo de registro
O que ajuda a análise              Hipótese e limites

O trabalho da equipe                Modelos e método
```

O wireframe define hierarquia, não exige que a foto empurre o CTA para fora da primeira tela. Evitar ocupar 100% da altura só com vídeo.

### Entrada, cadastro e redefinição

`LoginPage.js` e `ResetPasswordPage.js`: formulário como elemento principal; foto lateral no desktop, opcional no mobile. Um título por estado. Trocar “Quem é você, compadre?” por “Entre para guardar suas análises”. A voz continua próxima, sem repetir tratamento regional em todos os campos.

Preservar cadastro, confirmação de e-mail, reenvio, retorno ao destino e estados de redefinição. Eliminar a promessa falsa de acesso anônimo. A entrada demonstrativa deve continuar explicitamente identificada. Não aproveitar a reforma para pedir mais dados pessoais.

### Análise `/chat`

Desktop: bancada em duas áreas, foto à esquerda e tarefa/resultado à direita. Mobile: fluxo vertical único. “Conversa sobre esta análise” fica acessível abaixo do resultado ou em painel aberto pelo usuário; perguntas pendentes do agente aparecem imediatamente, sem ficar escondidas atrás desse painel.

```text
Marca    Nova análise    Histórico             Conta

Folha em análise                  Resultado da observação
┌──────────────────────┐          Estado ou hipótese
│                      │          Confiança e significado
│ Foto integral        │          Próximos passos
│ enviada pelo usuário │          Limitações / fontes
│                      │
└──────────────────────┘          [Ver plano de ação]
[Ampliar] [Trocar foto]           [Abrir registro] [Exportar*]

Pergunta necessária, quando existir: resposta em destaque
Conversa sobre esta análise: texto e voz existentes
* Apenas se disponível para o plano e para o estado atual.
```

Entrada sem foto: exemplo real de boa captura, câmera/galeria e orientação curta. O texto livre continua possível através de “Tirar uma dúvida”; não obrigar upload em toda conversa. No celular, priorizar câmera/galeria; no desktop, arquivo/arrastar, sem prometer disponibilidade de câmera.

Com foto selecionada: prévia, remover/trocar e confirmação explícita de envio. Revisar arquivos inválidos, limites, erro de rede e preservação de rascunho. Não enviar automaticamente por selecionar arquivo.

Durante processamento: manter a foto; status sem digitação teatral; permitir interrupção. Não simular raio varrendo lesões, heatmap, bounding box ou porcentagem de progresso. Sem evento granular, usar “Análise em andamento”.

Resultado: cabeçalho com hipótese; score explicado; plano e limites; metadados técnicos em expansão. Nunca transformar score em “chance de estar certo” nem severidade de catálogo em percentual visual. Estado saudável também precisa de texto adequado; não forçar bloco “doença detectada”.

### Resultado `/historico/:id` e plano de ação

Usar a mesma apresentação central do resultado obtido na conversa. A página completa adiciona data, navegação e exportação. Foto original visível, ampliação acessível, placeholder útil se URL assinada expirar ou falhar.

Plano em seções legíveis conforme os dados existentes. Não criar cronograma, doses, prescrição ou tarefas persistentes apenas para preencher uma ficha. Checkboxes de “manejo concluído” exigiriam persistência nova: fora da refatoração visual. Fontes abrem links reais quando disponíveis; ausência deve ser comunicada, não preenchida.

### Histórico `/historico`

Registros com miniatura, data, hipótese e acesso ao detalhe. Lista no desktop e lista compacta no mobile como padrão inicial; não acrescentar calendário/mapa sem necessidade. Conservar busca/paginação/total do servidor, confirmação de exclusão e gates de exportação. Distinguir histórico vazio de busca sem resultados e erro de carregamento.

### Demais superfícies: cobertura integral

| Rotas/área | Entrega visual | Comportamentos a preservar |
|---|---|---|
| `/perfil` | Configurações em grupos claros; reduzir cartões e CTA promocional | Edição, erros, planos, cotas e operações de talhão que já existem |
| `/planos` | Comparação simples de capacidades, linguagem acadêmica honesta | Recursos e limites corretos por plano |
| `/planos/pagamento/:planName` | Seleção/ativação demonstrativa explícita | Não voltar a solicitar cartão/CVV ou fingir cobrança |
| `/modelos` | Página de método: métricas, classes, limitações e comparações | Valores dos artefatos e semântica correta; gráficos legíveis em ambos os temas |
| `/sobre` | História concreta do TCC e processo; fotos reais da equipe se disponíveis | Créditos verdadeiros e escopo de pesquisa |
| `/api-docs` | Documentação técnica com navegação e código legíveis | Contratos reais, autenticação e recursos existentes; não inventar endpoints |
| `*` | Página de erro integrada à marca, retorno útil | URL inválida não vira tela vazia |
| Navegação, footer, quota, menus, dialogs, toasts | Tokens consistentes e linguagem comum | Acesso mobile, teclado, estados disabled/loading e avisos de demonstração |

Não é necessário dar foto de fundo a perfil, docs ou histórico. Coerência vem de tipografia, espaço e comportamento, não da repetição do hero em cada rota.

## 6. Plano de fotografia e vídeo

### Pacote mínimo

| Peça | Conteúdo a produzir/selecionar | Uso e aceite |
|---|---|---|
| 1 abertura | Pessoa observando uma folha de soja, ambiente real e luz natural | Desktop amplo e corte mobile que preserve a ação; sem texto incorporado |
| 2–3 fotos de captura | Folha nítida, foto distante e enquadramento inadequado | Ensinar a fotografar; exemplos não recebem diagnóstico inventado |
| 1 foto de contexto | Fileiras de soja ou observação em campo | Sobre/projeto; cultura identificável |
| 1 foto da equipe | Integrantes reais trabalhando no projeto | Sobre; só com autorização e nomes confirmados |
| 1 exemplo de resultado | Foto autorizada e saída correspondente de execução documentada, ou fixture rotulada | Mostrar a ligação entre entrada e resultado sem falsificar validação |
| 1 vídeo opcional | 6–10 s de folhas/observação, câmera estável e movimento natural | Som desligado, poster equivalente, pausar/reproduzir; nunca requisito para analisar |
| 1 tutorial opcional | 20–30 s: enquadrar, escolher, conferir e enviar | Iniciado pelo usuário, controles e legendas se houver fala |

Prioridade de origem: material próprio da equipe; material cedido com autorização; banco com licença verificada por item. Unsplash/Pexels/Wikimedia podem servir para descoberta, mas não presumir espécie, autoria, autorização de pessoas ou direito de reutilização pelo nome do banco. Não retirar imagens dos sites de referência para publicar no Zé Praga.

Criar `docs/design/ASSETS.md` com caminho, origem, autor, licença ou autorização, data de consulta, crédito exigido, uso, texto alternativo, ponto focal e variantes. Não armazenar documentos pessoais de autorização no repositório público. Marcar cada item como pendente ou liberado.

Geração de imagem pode auxiliar exploração de composição, identificada como conceitual. **Não atende ao pedido de foto real**, não deve inventar membros da equipe e não deve fabricar lesões usadas como evidência de classificação. Se a mídia final faltar, implementar com o acervo já autorizado e documentar a substituição pendente; não declarar a direção documental concluída.

### Preparação e orçamento de mídia

Valores abaixo são metas propostas do projeto, ajustáveis após inspeção da qualidade:

- Exportar variantes 480/960/1600 px, usando `srcset`/`sizes`, WebP/AVIF com fallback compatível. Reservar dimensões e proporção.
- Abertura: procurar ficar até 250 kB no mobile e 400 kB no desktop. Miniaturas: até 50 kB. Preservar nitidez dos sinais nas fotos de diagnóstico; estes limites não justificam perda de informação clínica da imagem original.
- Vídeo opcional: tentar até 2 MB por loop curto. Começar com poster; no mobile, reprodução por toque como padrão. Não carregar vários filmes na primeira dobra.
- Não aplicar lazy loading à imagem principal que determina LCP. Carregar mídia abaixo da dobra sob demanda. Usar recursos nativos e fallback, sem adicionar player pesado para um loop simples. Base técnica: [web.dev sobre carregamento de vídeo](https://web.dev/articles/lazy-loading-video).
- A análise deve funcionar se o vídeo, a fonte remota ou uma foto editorial não carregar. Mídias públicas da marca e imagens privadas de diagnóstico têm políticas de armazenamento distintas; não ampliar cache privado.

## 7. Movimento com função

| Interação | Tratamento proposto |
|---|---|
| Abrir menu, expansão, dialog | 120–200 ms, opacidade e deslocamento pequeno, sem bounce |
| Prévia confirmada → análise | 180–240 ms mantendo referência espacial da foto |
| Resultado recebido | Entrada discreta uma única vez; não reiniciar em cada token |
| Upload/requisição | Indicador indeterminado quando não existe porcentagem real |
| Troca entre registro e detalhe | Preservar posição/retorno; animação opcional, navegação imediata |
| Home | Foto estática por padrão; único vídeo opcional com controle |

Reutilizar `framer-motion`, já presente. Não adicionar GSAP, Three.js, Rive ou motor de scroll sem necessidade demonstrada. `prefers-reduced-motion` precisa afetar animações JavaScript e vídeos, não apenas CSS. Testar `useReducedMotion`/configuração equivalente nos componentes existentes.

Movimento automático que dura mais de cinco segundos, em paralelo a outro conteúdo e não essencial, precisa permitir pausa/parada/ocultação conforme [W3C, Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide). Preferência de redução de movimento é complementar, não substituto universal desse controle.

## 8. Skills: seleção e uso

Nenhuma skill ou plugin novo foi instalado neste estudo. Disponibilidade no Codex não significa disponibilidade automática em outra conversa sem acesso ao workspace. Os nomes externos devem ser conferidos na versão escolhida antes de executar comandos.

### Conjunto mínimo recomendado

| Skill/capacidade | Situação nesta sessão | Uso recomendado |
|---|---|---|
| `graphify` | Disponível; usada para navegação estrutural | Localizar rotas/componentes/hooks; confirmar no código |
| `frontend-design`, Anthropic | Pesquisada; não aparece no catálogo instalado | Primeira candidata para direção visual e autocrítica, subordinada a este briefing. [Fonte oficial](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) |
| `vercel:react-best-practices` | Disponível; conteúdo local consultado | Revisar renderização, hooks, carregamento e componentes; aplicar apenas regras pertinentes a React/CRA, não padrões de Next.js/RSC |
| Navegador disponível / `vercel:agent-browser-verify` | Capacidade de navegador disponível; skill listada | Inspecionar estados reais, capturar evidências e testar responsividade; usar uma ferramenta de navegador coerente por execução |
| `vercel:verification` | Disponível; conteúdo consultado | Encerrar com fluxo completo; separar mock, integração local e produção |
| `web-design-guidelines`, Vercel Labs | Pesquisada; não listada separadamente como instalada | Complemento de revisão de acessibilidade/UX. [Coleção oficial](https://github.com/vercel-labs/agent-skills) |

Não é obrigatório instalar uma skill externa para começar: este plano contém a direção específica. Se instalar, usar a skill `skill-installer`, ler o pacote e licença, registrar versão/commit e selecionar somente o necessário. Não assumir que copiar comandos de Claude Code funciona no Codex ou num chat comum.

### Alternativas avaliadas

| Opção | Avaliação para este projeto |
|---|---|
| [Impeccable](https://github.com/pbakaus/impeccable) | Útil para ciclos de crítica, clareza, adaptação e acabamento. Alternativa à direção genérica, não requisito. A versão consultada inclui instalador, engine e hooks; revisar o escopo antes de instalar. Evitar que gere documentação concorrente ou sobrescreva decisões da marca. |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Tem proposta de redesign e variação de composição. A versão padrão consultada é experimental e inclui direção forte de movimento. Não escolher como padrão deste trabalho; avaliar separadamente se o primeiro estudo ainda parecer genérico. |
| `imagegen` / Higgsfield | Disponíveis para exploração ou mídia gerada, mas não substituem fotografia documental. Não consumir geração por padrão neste projeto. |
| Higgsfield `video-editing` | Skill listada; candidata para editar material fornecido na etapa audiovisual. Ler instruções e confirmar ferramenta executável quando chegar à etapa. |
| `skill-creator` | Disponível. Opcional após consolidar a direção: empacotar regras específicas do Zé Praga para futuras iterações. Um `DESIGN.md` no projeto já atende à continuidade inicial. |

Não adotar shadcn/Geist/AI Elements como troca de biblioteca neste trabalho: MUI e os tokens existentes atendem ao escopo. Figma/Canva não são dependências do plano; só valem uma integração futura se a equipe quiser manter e revisar material nessas ferramentas.

Para o Terra: usar uma orientação principal de design, uma revisão técnica e uma verificação visual. Não empilhar várias skills de “anti-template” com regras diferentes de fonte, raio e animação.

## 9. Estratégia técnica para proteger o fluxo

Separar apresentação do ciclo de conversa. Manter `useChat` como proprietário de mensagens, sessão, cancelamento e interrupções. Criar um adaptador/selector puro para a superfície de análise a partir de mensagens e estados já existentes. Nome sugerido: `selectAnalysisView`; confirmar se a abstração ainda é necessária ao implementar.

Estados de apresentação sugeridos: vazio, prévia local, processando, aguardando resposta do usuário, resultado disponível, falha e interrompido. Não substituir o estado do transporte por um cronômetro nem esconder mensagem de texto porque não existe diagnóstico estruturado.

| Entrada existente | Apresentação |
|---|---|
| `pendingFile` local | Prévia ainda não enviada |
| `isLoading` sem ferramenta conhecida | “Análise em andamento” ou “Resposta em andamento”, conforme a tarefa |
| `toolCall` conhecido | Descrição correspondente ao evento; nome desconhecido usa fallback neutro |
| `pendingInterrupt` | Pergunta e ações em destaque, inclusive se painel de conversa estiver recolhido |
| `message.diagnosis` | Ficha estruturada vinculada à mensagem/turno correto |
| Texto sem diagnóstico | Resposta de conversa normal; não extrair JSON de Markdown por heurística |
| `diagnosisUnavailable` | Aviso de registro indisponível, sem reapresentar resultado anterior |

Uma sessão pode conter várias fotos e resultados. Não assumir “último diagnóstico da sessão = foto atualmente selecionada”. Associar resultado ao turno/ID e preservar essa relação ao alternar sessões. Se a associação não puder ser recuperada, exibir estado explícito em vez de combinar foto nova com hipótese antiga.

Componentes sugeridos, a criar somente se eliminarem duplicação: `AnalysisWorkspace`, `PhotoReview`, `AnalysisStatus`, `DiagnosisSummary` e `ConversationPanel`. Manter `ActionPlan`, `InterruptPrompt`, `SessionsDrawer`, `ChatInput` e infraestrutura de páginas quando possível.

Não adicionar chamadas diretas a `/inference` para alimentar o novo painel em paralelo ao chat: isso pode duplicar consumo e persistência. Busca do plano de ação e exportação continuam usando serviços existentes. Conservar autenticação própria, `/api/v1`, flags separadas, quotas e features. URL de imagem privada continua resolvida pelo contrato de Storage, sem expor credenciais.

## 10. Plano de execução em etapas

Cada etapa termina em um incremento verificável e uma atualização de `docs/design/EXECUCAO.md`. Etapas são propostas deste documento; não representam tickets já existentes. As referências UX abaixo são os IDs reais da auditoria, usados para rastreabilidade e regressão.

### Etapa A — Baseline e contratos visuais

**Dependência:** nenhuma. **Rastreabilidade:** UX-004, 008–012, 014–018.

- Ler AGENTS, auditoria e entrega de 08/09. Registrar Git status e preservar alterações existentes.
- Consultar Graphify e confirmar quais componentes são usados por cada rota.
- Fotografar telas atuais em 390×844 e 1366×900, claro/escuro, incluindo resultado demonstrativo e erro. Não incluir dados pessoais ou segredos nas evidências.
- Executar testes/build de base e registrar falhas preexistentes, sem atribuí-las ao redesign.
- Criar inventário de rotas, estados, componentes ativos e mídias; corrigir a matriz histórica apenas com evidência atual.

**Saída:** `docs/design/BASELINE.md`, capturas locais e matriz de rotas. **Aceite:** toda rota atual tem destino no plano e comportamentos críticos estão registrados.

### Etapa B — Direção e mídia

**Dependência:** A. **Rastreabilidade:** UX-012, 015, 016.

- Montar duas composições simples de home e análise com o mesmo conteúdo: Campo próximo e uma variação mais sóbria. Aplicar a direção recomendada se não houver nova preferência do usuário.
- Consolidar `docs/design/DESIGN.md`: tokens, hierarquia, composição, copy, movimentos e regras de fotografia.
- Inventariar/selecionar mídia autorizada e produzir o brief de captura para peças faltantes.
- Não parar pedindo aprovação de cada detalhe reversível: documentar escolha e seguir. Falta de mídia impede apenas sua incorporação final, não o restante da implementação.

**Saída:** duas propostas comparáveis, direção escolhida e `ASSETS.md`. **Aceite:** reconhecível como produto de observação de soja mesmo sem logotipo; fotos com origem registrada; nenhuma métrica fictícia nos exemplos.

### Etapa C — Base visual e navegação

**Dependência:** B. **Rastreabilidade:** UX-015, 016.

Arquivos: `theme/theme.js`, `theme/BrandCssVariables.js`, `index.css`, `copy/ze.js`, `components/Layout/*`, `components/common/Page.js` e `App.js`, conforme necessidade.

- Consolidar raios, espaço, variantes de botões e tipografia sem quebrar chaves existentes.
- Unificar rótulos de ação e navegação, preservando links institucionais no mobile.
- Ajustar loading, erro, vazio, dialogs, foco e estados disabled nos dois temas.
- Remover inconsistência entre estilos `sx`, variáveis CSS e valores locais, sem reescrever todos os componentes indiscriminadamente.

**Aceite:** galeria de componentes/estados ou página temporária de revisão, claro/escuro; sem controles sem nome; sem regressões de navegação. Excluir superfícies de desenvolvimento do produto final.

### Etapa D — Home e autenticação

**Dependência:** C e mídia liberada de B. **Rastreabilidade:** UX-004, 012, 015, 016.

Arquivos: `LandingPage.js`, `LoginPage.js`, `ResetPasswordPage.js`, conteúdo de marca e assets.

- Implementar abertura documental, guia de captura e contexto real do projeto.
- Reformar formulário e microcopy; preservar todas as ramificações de autenticação.
- Verificar que componentes antigos de landing não mantenham textos incorretos em uso.

**Aceite:** caminho início → login → destino funciona; CTA claro na primeira tela mobile; nenhuma promessa de acesso anônimo; foto sem loop luminoso.

### Etapa E — Bancada de análise e conversa

**Dependência:** C. **Rastreabilidade:** UX-008, 009, 010, 014–016.

Arquivos: `ChatPage.js`, `ChatWindow.js`, `ChatInput.js`, `ChatMessage.js`, `TypingIndicator.js`, `InterruptPrompt.js`, `SessionsDrawer.js`; hooks apenas quando necessário.

- Implementar composição foto/tarefa com estados da seção 9; mobile vertical e viewport dinâmico.
- Manter pergunta pendente visível; preservar conversa textual e áudio existentes.
- Remover frases de progresso fictício e animação de digitar/apagar no indicador de espera.
- Preservar cancelamento, rascunho, proteção contra envio duplo, reabertura e scroll sem roubar a leitura.
- Manter seletor de modelo em opções secundárias acessíveis e gates intactos.

**Aceite:** prévia → envio → espera → resultado; erro recuperável; troca de sessão durante streaming não mistura respostas; vários diagnósticos mantêm suas fotos; não há requisição duplicada.

### Etapa F — Resultado, plano e histórico

**Dependência:** E. **Rastreabilidade:** UX-002, 005–008, 011, 012, 014.

Arquivos: `DiagnosisCard.js`, `DiagnosisDetailPage.js`, `components/Diagnosis/*`, `HistoryPage.js`, `components/History/*`, `pdfExport.js` quando necessário.

- Unificar apresentação de hipótese/foto/plano sem duplicar estado de rede.
- Reformar lista e detalhe; preservar filtros e total no servidor.
- Harmonizar PDF com a marca e manter significado dos dados; não transformar exportação em captura de tela.

**Aceite:** reabrir registro mantém conteúdo; plano não aparece associado à doença anterior; download válido e PDF sem cortes; imagem indisponível tem fallback; planos sem exportação permanecem restritos.

### Etapa G — Restante do frontend

**Dependência:** C, padrões consolidados em D–F. **Rastreabilidade:** UX-012–018.

Arquivos: `ProfilePage.js`, `PlansPage.js`, `PaymentPage.js`, `ModelsPage.js`, `AboutPage.js`, `ApiDocsPage.js`, `NotFoundPage.js`, componentes associados.

- Aplicar a matriz da seção 5, inclusive menus, tabelas, tabs e diálogos.
- Revisar copy antiga centralizada e strings inline; não trocar texto só em componentes fora de uso.
- Preservar métricas e contratos; não acrescentar funcionalidades para justificar a estética.

**Aceite:** nenhuma rota fica com aparência da versão anterior por esquecimento; conteúdos técnicos continuam consultáveis em celular e tema escuro.

### Etapa H — Mídia e acabamento

**Dependência:** D–G. **Rastreabilidade:** UX-015, 016, 018.

- Incorporar versões finais autorizadas, créditos, recortes responsivos e fallbacks.
- Adicionar vídeo somente se houver arquivo adequado e orçamento; respeitar controles e redução de movimento.
- Medir peso por rota e remover efeitos que não esclareçam mudança de estado.

**Aceite:** tarefas funcionam sem mídia editorial; não há salto de layout relevante; celular não baixa vídeo por obrigação; não existe placeholder apresentado como entrega final.

### Etapa I — Verificação e ensaio

**Dependência:** todas as anteriores. **Rastreabilidade:** UX-001–018 como matriz de regressão, sem presumir que todos foram reimplementados.

- Executar a matriz da seção 11 e registrar evidências por camada.
- Fazer comparação antes/depois com o orientador e pessoas próximas do público, usando roteiro neutro.
- Corrigir problemas, atualizar documentação e mapa estrutural quando componentes/relações mudarem.
- Preparar roteiro de demonstração e gravação de contingência identificando se é fluxo real ou simulado.

**Aceite:** todos os itens críticos verificados ou bloqueios externos descritos concretamente; não declarar “pronto para produção” a partir de mock.

## 11. Critérios de qualidade

### Visual e uso

Testar 360/390/768/1366 px, zoom de 200%, dois temas, teclado, navegação de retorno, erros, vazio e sucesso. Testar teclado virtual/câmera/microfone em dispositivo real quando disponível e registrar essa disponibilidade.

- Na primeira tela, identificar soja, tarefa e CTA sem precisar ler sobre arquitetura.
- Depois de selecionar uma foto, encontrar conferência/troca/envio sem tentativa e erro.
- Depois do resultado, encontrar hipótese, significado da confiança e próximo passo sem ler a conversa inteira.
- Resposta pendente do agente nunca fica oculta; modal devolve foco; não há armadilha de teclado.
- Texto comum com contraste mínimo de 4,5:1 e texto grande de 3:1, conforme [W3C, contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Verificar pares efetivamente renderizados, inclusive disabled quando relevante à legibilidade.
- Meta de conforto: controles de 44 px. O mínimo AA de 24 px tem exceções e condições próprias, conforme [W3C, tamanho do alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Não confundir as duas medidas.
- Fotos informativas com texto alternativo; decorativas com alt vazio; não repetir legenda inteira no leitor de tela. Resultado atualizado anunciado uma vez, sem ler cada token em voz alta.

### Performance

Medir build de produção e rotas principais, não apenas servidor de desenvolvimento. Guardar baseline, aparelho/perfil de rede e condições iguais de comparação.

Alvos de referência de Core Web Vitals: LCP ≤2,5 s, INP ≤200 ms e CLS ≤0,1 no percentil 75 quando houver dados de campo suficientes, conforme [web.dev, Web Vitals](https://web.dev/articles/vitals). Lighthouse é indício de laboratório, não comprova INP real ou esses percentis. Em protótipo sem tráfego, registrar medições locais e limitações.

Meta interna adicional: justificar aumento de JS inicial maior que 10% em relação ao baseline atual. Não usar o bundle de setembro antigo como baseline do código futuro.

### Regressão funcional prioritária

| Cenário | Resultado esperado |
|---|---|
| Login com retorno e confirmação de e-mail | Destino preservado; erro útil; sem promessa anônima |
| Arquivo inválido, cancelamento de seleção, troca de foto | Sem envio indevido; prévia e rascunho coerentes |
| Dois cliques no envio / nova sessão durante resposta | Uma operação válida; mensagens antigas não contaminam a nova sessão |
| SSE fragmentado, encerramento inesperado, abort | Estado recuperável; não marcar sucesso artificial |
| HITL e reabertura da sessão | Pergunta pendente reaparece e pode ser respondida |
| Áudio/transcrição | Revisar, descartar e distinguir transcrição; negar permissão é recuperável |
| Vários turnos e resultados | Foto, hipótese e ID correspondentes, inclusive na volta do histórico |
| Plano lento/falha/troca de doença | Sem plano antigo; retry correto |
| Histórico com mais de 20 registros | Paginação, busca, total e exclusão coerentes |
| PDF longo e foto indisponível | Arquivo legível, sem corte e sem falha silenciosa |
| Plano/cota indisponível ou esgotada | Explicação e restrição corretas |
| Sem rede / mídia editorial bloqueada | Aplicação explica falha; não promete envio offline automático |

Testes devem verificar comportamento e contratos, não só snapshots de estilo. Reutilizar suites de hooks, transportes, upload, plano e PDF. Acrescentar testes de associação foto/resultado, visibilidade de HITL e ações da nova composição onde houver mudança funcional.

No diretório `frontend/`:

```powershell
npm.cmd test -- --watchAll=false --runInBand
npm.cmd run build
```

Se houver mudança inevitável no backend, seguir seu AGENTS e executar Ruff/mypy/pytest com variáveis de teste. Não rodar migrations, seeds ou testes destrutivos em produção para validar layout. Este plano não depende de alterar banco ou retreinar modelos.

### Ensaio com pessoas

Rodada qualitativa proposta com 3–5 pessoas, incluindo alguém familiarizado com agricultura se possível. Não representa estudo estatístico.

1. Mostrar home sem explicar e perguntar: “Para que serve este site?”
2. Pedir: “Você viu uma mancha numa folha; comece uma análise.”
3. No resultado: “O que este número significa? Qual seria seu próximo passo?”
4. Pedir para encontrar novamente o registro.
5. Comparar versões em ordem alternada: “Qual parece mais própria deste projeto? O que causou essa impressão?”

Registrar conclusão da tarefa, ajuda necessária, confusões e palavras usadas espontaneamente. Critério proposto: nenhum problema crítico de navegação e todos os participantes distinguem hipótese de confirmação após ler a explicação. Se não ocorrer, corrigir texto e hierarquia. A avaliação estética deve citar motivos concretos; não basta votação de “mais bonita”.

## 12. Escopo, dependências e contingência

Estimativa inicial para um executor, em esforço equivalente de trabalho humano, não tempo garantido de modelo: A–B 1–2 dias; C–D 2–3; E–F 3–5; G–H 2–3; I 1–2. Total indicativo: **9–15 dias úteis**, com incerteza alta e sem incluir espera por fotografia, infraestrutura ou participantes. Reestimar ao concluir A. Um agente pode escrever código mais rápido; isso não elimina revisão visual e validação.

Se o prazo apertar, cortar primeiro vídeo, tutorial audiovisual, variações decorativas e animações de navegação. Preservar foto real, análise/resultado, autenticação, histórico, acessibilidade e coerência das demais rotas. Não reduzir silenciosamente a entrega a uma home reformada.

Principais riscos: mídia sem autorização; associação incorreta entre foto e resultado; perda de HITL ao recolher conversa; redução da legibilidade no dark mode; regressão por estilos globais; vídeo pesado; copy antiga ainda ativa. Cada um tem um aceite nas etapas anteriores.

Entrega mínima final do Terra: frontend refatorado; `DESIGN.md`; `ASSETS.md`; `EXECUCAO.md` com checklist por rota; evidências visuais e testes; pendências externas específicas; instruções de rodar. Sem commits/deploys automáticos exigidos por este plano.

O plano não depende de uma instalação nova. Se mídia ou serviços externos faltarem, o Terra continua as partes independentes e informa exatamente o que ainda impede o aceite final.
