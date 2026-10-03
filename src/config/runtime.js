// UX-014: todos os serviços compartilham a mesma decisão de ambiente.
export const IS_DEMO =
  process.env.REACT_APP_USE_MOCK === "true" ||
  process.env.REACT_APP_AUTH_MODE === "mock";
export const API_ORIGIN = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");
// Chat por SSE (token a token). Desligado por padrão: a nuvem responde o chat
// de forma síncrona (POST /chat), que custa os mesmos tokens sem prender uma
// conexão aberta por resposta. Ligue com REACT_APP_CHAT_STREAMING=true quando o
// backend tiver CHAT_STREAMING_ENABLED=true.
export const CHAT_STREAMING = process.env.REACT_APP_CHAT_STREAMING === "true";
// Teto do chat síncrono no cliente. Um turno com foto passa por gate de visão,
// classificador e plano de ação — bem mais que os 30 s padrão do axios.
export const CHAT_TIMEOUT_MS = 120000;
