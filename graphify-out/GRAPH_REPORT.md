# Graph Report - frontend  (2026-09-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 606 nodes · 1319 edges · 36 communities (29 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bbe8a9d5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34

## God Nodes (most connected - your core abstractions)
1. `react` - 73 edges
2. `lucide-react` - 31 edges
3. `react-router-dom` - 29 edges
4. `useAuth()` - 25 edges
5. `getAuthHeaders()` - 23 edges
6. `@mui/material` - 20 edges
7. `IS_DEMO` - 20 edges
8. `Achados priorizados e critérios de aceitação` - 19 edges
9. `getCurrentUserId()` - 17 edges
10. `delay()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `TryItPanel()` --calls--> `useFeatures()`  [EXTRACTED]
  frontend/src/components/ApiDocs/TryItPanel.js → frontend/src/contexts/FeaturesContext.js
- `ChatInput()` --calls--> `useFeatures()`  [EXTRACTED]
  frontend/src/components/Chat/ChatInput.js → frontend/src/contexts/FeaturesContext.js
- `DiagnosisCard()` --calls--> `useActionPlan()`  [EXTRACTED]
  frontend/src/components/Chat/DiagnosisCard.js → frontend/src/hooks/useActionPlan.js
- `QuotaDisplay()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/components/Layout/QuotaDisplay.js → frontend/src/hooks/useAuth.js
- `FeaturesProvider()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/contexts/FeaturesContext.js → frontend/src/hooks/useAuth.js

## Import Cycles
- None detected.

## Communities (36 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (58): lucide-react, @mui/material, react, react-router-dom, AboutPage, ApiDocsPage, routeIndex(), routeOrder (+50 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (34): axios, chipColor(), formatCounter(), QuotaDisplay(), useActionPlan(), useHistory(), DiagnosisDetailPage(), HistoryPage() (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (31): uuid, cardVariants, SEV, delay(), demoImagePreview(), getKeywordResponse(), getModelName(), mockSendMessage() (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (26): framer-motion, react-markdown, remark-gfm, TryItPanel(), ChatInput(), ChatMessage(), ChatWindow(), DiagnosisCard() (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (40): 10. Plano de execução em etapas, 11. Critérios de qualidade, 12. Escopo, dependências e contingência, 1. Decisão central, 2. O que foi estudado e o que foi observado, 3. Pesquisa web aplicada, 4. Direção visual executável, 5. Arquitetura das telas (+32 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (27): @microsoft/fetch-event-source, SessionsDrawer(), {
  getSessionMessages,
  closeSession,
}, {
  sendMessage,
  sendMessageStream,
  resumeMessageStream,
}, describe(), initial(), useChat(), abortError() (+19 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (20): ModelsPage, metrics, ConfusionMatrix(), Pipeline(), STEPS, toneSx(), CLASS_LABELS, CONFUSION_LABELS (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (25): dependencies, axios, @emotion/react, @emotion/styled, framer-motion, jspdf, jspdf-autotable, lucide-react (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (15): @testing-library/react, firstMessage, FeatureGate(), { FeatureGate }, { FeaturesProvider }, mockUseAuth, mockGetUsageSummary, mockUseAuth (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (19): Achados priorizados e critérios de aceitação, UX-001 — P0 — Inferência pode apresentar resultado aleatório após falha, UX-002 — P0 — Severidade e explicação têm significado diferente do sugerido, UX-003 — P0 — Cache de navegador abrange respostas privadas, UX-004 — P1 — Promessa de acesso anônimo contradiz autenticação, UX-005 — P1 — “Limpar histórico” aparenta sucesso sem apagar no servidor, UX-006 — P1 — Histórico ignora a paginação do servidor, UX-007 — P1 — Exportação PDF do histórico está ligada incorretamente (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (15): name, private, version, @emotion/react, @emotion/styled, jspdf, jspdf-autotable, @mui/icons-material (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.26
Nodes (15): LoginPage(), apiHeaders(), createMockUser(), forgotPassword(), getAuthToken(), getSession(), login(), logout() (+7 more)

### Community 12 - "Community 12"
Cohesion: 0.23
Nodes (12): App(), getInitialColorMode(), Root(), checkValidServiceWorker(), isLocalhost, register(), registerValidSW(), unregister() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (12): Arquitetura que existe hoje, Direção proposta para UX e UI, Evidências para continuar, Modelos e material acadêmico, Método e limites da validação, O que foi executado, Ordem de implementação, Parecer (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (8): API e banco isolados para testar contratos, Demonstração da interface, Entrega de UX/UI local — Zé Praga, O que mudou e por quê, Pontos parcialmente atendidos ou pendentes, Rodar no computador, Roteiro de apresentação local, Verificação e limites

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (10): babel, compiled, detail, directory, example, fs, history, Module (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (10): Estrutura, Funcionalidades, Pré-requisitos, Relação com o backend, Revisão de UX e execução local — setembro de 2026, Scripts, Setup, Stack (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (7): clean(), document(), exportDiagnosisPdf(), exportHistoryPdf(), footer(), writer(), { exportDiagnosisPdf, exportHistoryPdf }

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (8): scripts, build, build:local, eject, start, start:demo, start:local, test

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): Decisão, Direção por rota, Direção visual — Zé Praga, Propostas comparadas, Regras de conteúdo, Sistema

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (7): global, branches, functions, lines, statements, jest, coverageThreshold

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (5): Cobertura por rota, Decisões, Etapas A–I, Execução da identidade visual — 18/09/2026, Verificações executadas

### Community 25 - "Community 25"
Cohesion: 0.50
Nodes (3): Baseline da refatoração visual — 17/09/2026, Evidência inicial, Inventário de rotas e destino

### Community 26 - "Community 26"
Cohesion: 0.50
Nodes (4): eslintConfig, extends, react-app, react-app/jest

### Community 27 - "Community 27"
Cohesion: 0.50
Nodes (3): child, env, { spawn }

### Community 28 - "Community 28"
Cohesion: 0.83
Nodes (3): ConfidenceBar(), confidenceLabel(), confidenceToken()

### Community 30 - "Community 30"
Cohesion: 0.50
Nodes (3): build, env, CI

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (3): browserslist, development, production

## Knowledge Gaps
- **217 isolated node(s):** `name`, `version`, `private`, `@emotion/react`, `@emotion/react` (+212 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 261 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 8`, `Community 10`, `Community 12`, `Community 23`, `Community 24`, `Community 28`, `Community 29`?**
  _High betweenness centrality (0.239) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 7` to `Community 10`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Community 0` to `Community 1`, `Community 3`, `Community 5`, `Community 6`, `Community 10`, `Community 23`, `Community 24`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _217 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05083655083655084 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11193339500462535 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._