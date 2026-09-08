// UX-018: ambiente local reproduzível, sem alterar .env ou configuração de nuvem.
const { spawn } = require("node:child_process");
const mode = process.argv[2] || "api";
const command = process.argv[3] || "start";
if (!["api", "demo"].includes(mode) || !["start", "build"].includes(command)) {
  throw new Error("Uso: node scripts/local.cjs api|demo start|build");
}
const env = {
  ...process.env,
  HOST: "127.0.0.1",
  PORT: process.env.PORT || "3100",
  BROWSER: "none",
  REACT_APP_API_URL: "http://127.0.0.1:8000",
  REACT_APP_AUTH_MODE: mode === "demo" ? "mock" : "api",
  REACT_APP_USE_MOCK: String(mode === "demo"),
};
console.log(
  mode === "demo"
    ? "Zé Praga · demonstração local com dados simulados · http://127.0.0.1:" +
        env.PORT
    : "Zé Praga · frontend local · API esperada em http://127.0.0.1:8000",
);
const child = spawn(
  process.execPath,
  [require.resolve(`react-scripts/scripts/${command}.js`)],
  {
    env,
    stdio: "inherit",
    windowsHide: true,
  },
);
child.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
