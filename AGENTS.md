# Frontend — Zé Praga

Neste workspace, leia `../AGENTS.md` e `docs/AUDITORIA-TCC-2026-09-06.md`.
Em clone isolado, use este arquivo, o README e a auditoria; o workspace pai pode
não existir. Não dependa de arquivos irmãos para o build do frontend.

Priorize foto → diagnóstico → plano de ação → histórico. Reutilize MUI,
`src/theme/theme.js`, `src/copy/ze.js` e os componentes existentes.
Preserve contratos REST/SSE e gates de plano. Conteúdo em português.
`REACT_APP_API_URL` não inclui `/api/v1`; autenticação real usa o valor `api`.
Confira teclado, mensagens de erro, responsividade e contraste ao alterar UI.
Verifique com `npm test -- --watchAll=false --runInBand` e `npm run build`.
O modo mock não comprova integração com o backend.
