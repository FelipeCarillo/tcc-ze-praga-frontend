# Zé Praga — Frontend

## Revisão de UX e execução local — setembro de 2026

Para explorar a interface sem serviços externos: `npm.cmd run start:demo` e abra
http://127.0.0.1:3100/. O modo demonstração identifica os resultados simulados.
Para ligar ao backend local: `npm.cmd run start:local`.

Veja o [roteiro local, mudanças, testes e pendências para o TCC](docs/ENTREGA-UX-LOCAL-2026-09-08.md).
Esses comandos definem as flags sem alterar `.env`. A inferência real e os serviços
externos exigem validação separada da demonstração da interface.

SPA em **React + Material UI** do **Zé Praga**, sistema de diagnóstico de doenças
foliares de soja (TCC). Consome a API FastAPI (`tcc-ze-praga-backend`): autenticação,
upload de imagem + diagnóstico (modelo ONNX), planos de ação, chat com agente
LangGraph (texto, imagem e áudio), histórico, cotas de uso e API keys.

## Stack

- React (Create React App) + React Router
- Material UI (MUI) — tema claro/escuro
- `react-markdown` para renderizar as respostas do chat
- Consome a API REST/SSE do backend

## Pré-requisitos

- Node.js 18+
- O backend rodando (ver `tcc-ze-praga-backend/README.md`) — por padrão em
  `http://localhost:8000`.

## Setup

```bash
npm install
cp .env.example .env   # e ajuste as variáveis (veja abaixo)
npm start              # http://localhost:3000
```

## Variáveis de ambiente (`.env`)

| Variável | Descrição | Default |
|---|---|---|
| `REACT_APP_API_URL` | URL base da API do backend | `http://localhost:8000/api/v1` |
| `REACT_APP_AUTH_MODE` | Modo de autenticação | `real` |
| `REACT_APP_USE_MOCK` | `true` usa dados mockados (sem backend); `false` chama a API real | `false` |

> Em desenvolvimento sem backend, `REACT_APP_USE_MOCK=true` permite navegar a UI
> com respostas simuladas.

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Dev server com hot-reload (porta 3000) |
| `npm test` | Testes (Jest + React Testing Library) em watch mode |
| `npm run build` | Build de produção em `build/` |

## Funcionalidades

- **Autenticação**: login/registro contra `/auth` (JWT).
- **Diagnóstico**: upload de foto da folha → `POST /inference` → card com top-3
  doenças, confiança, severidade e plano de ação.
- **Chat multimodal**: agente LangGraph via SSE (streaming), com suporte a imagem
  (gate de visão) e áudio (transcrição); Markdown ao vivo.
- **Histórico**: lista de diagnósticos anteriores (resposta paginada).
- **Cotas & planos**: indicador de uso restante; modal de upgrade no 429.
- **API keys**: página de gestão de chaves (tier Enterprise).

## Estrutura

```
src/
├── pages/          # telas (Chat, DiagnosisDetail, History, ApiKeys, ...)
├── components/     # Chat/, Layout/, common/ (Markdown), ...
├── hooks/          # useChat (streaming + interrupt), ...
├── services/       # chatService, inferenceService, historyService, authService
└── contexts/       # FeaturesContext, auth, ...
```

## Relação com o backend

Este frontend é a camada de apresentação do contrato definido no backend
(`POST /api/v1/inference`, `/auth`, `/chat`, `/diagnoses`, `/action-plans`,
`/usage`). Mantenha `REACT_APP_API_URL` apontando para a API correta.
