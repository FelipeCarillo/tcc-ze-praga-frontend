// UX-014: todos os serviços compartilham a mesma decisão de ambiente.
export const IS_DEMO =
  process.env.REACT_APP_USE_MOCK === "true" ||
  process.env.REACT_APP_AUTH_MODE === "mock";
export const API_ORIGIN = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");
// Chat por SSE (token a token), ligado com REACT_APP_CHAT_STREAMING=true. O
// primeiro texto aparece em ~1,5-2 s em vez de esperar a resposta inteira
// (teste de 17/10/2026). Se o backend estiver sem SSE (404), o useChat cai no
// POST /chat síncrono (TCC-100).
export const CHAT_STREAMING = process.env.REACT_APP_CHAT_STREAMING === "true";
// Teto do chat síncrono no cliente. Um turno com foto passa por gate de visão,
// classificador e plano de ação — bem mais que os 30 s padrão do axios.
export const CHAT_TIMEOUT_MS = 120000;
