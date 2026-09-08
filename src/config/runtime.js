// UX-014: todos os serviços compartilham a mesma decisão de ambiente.
export const IS_DEMO =
  process.env.REACT_APP_USE_MOCK === "true" ||
  process.env.REACT_APP_AUTH_MODE === "mock";
export const API_ORIGIN = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");
