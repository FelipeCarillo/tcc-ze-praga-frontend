import { STARTERS, suggestionsFor } from "../suggestions";

const laudo = (over = {}) => ({
  role: "assistant",
  content: "Ferrugem.",
  diagnosis: { id: "d1", disease: "Ferrugem-asiática", severity: "alta", talhaoId: "t3", talhaoNome: "Talhão 3", ...over },
});
const talhoes = [
  { id: "t3", nome: "Talhão 3", apelido: "Sede" },
  { id: "t7", nome: "Talhão 7", apelido: "Baixada" },
];

test("depois de um laudo com doença: o que aplicar, vizinho, comparar e lembrete", () => {
  const out = suggestionsFor(laudo(), { talhoes });
  expect(out.map((s) => s.label)).toEqual([
    "O que aplicar agora?",
    "Pode passar pro Talhão 7?",
    "Comparar com o laudo anterior",
    "Lembrar em 7 dias",
  ]);
  expect(out[1].text).toMatch(/Talhão 7 · Baixada/);
  expect(out[3].action).toBe("reminder");
});

test("sem talhão no laudo não oferece comparar; com lembrete não oferece de novo", () => {
  const out = suggestionsFor(laudo({ talhaoId: null }), { talhoes: [], hasReminder: true });
  expect(out.map((s) => s.label)).toEqual(["O que aplicar agora?", "Isso passa para outras áreas?"]);
});

test("folha saudável muda as perguntas", () => {
  const out = suggestionsFor(laudo({ severity: "nenhuma", disease: "Saudável" }), { talhoes });
  expect(out[0].label).toBe("Como manter o talhão saudável?");
});

test("resposta em texto sugere analisar uma folha", () => {
  const out = suggestionsFor({ role: "assistant", content: "A ferrugem é..." });
  expect(out[0]).toEqual({ label: "Analisar uma folha", action: "camera" });
});

test("nada durante o streaming, em erro ou para o usuário", () => {
  expect(suggestionsFor({ ...laudo(), isStreaming: true })).toEqual([]);
  expect(suggestionsFor({ ...laudo(), isError: true })).toEqual([]);
  expect(suggestionsFor({ role: "user", content: "oi" })).toEqual([]);
  expect(suggestionsFor(null)).toEqual([]);
  expect(STARTERS).toHaveLength(2);
});
