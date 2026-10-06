import { buildReportData } from "../farmReportData";

jest.mock("../../assets/field/lavoura-rs.jpg", () => "lavoura.jpg", { virtual: true });

const NOW = new Date(2026, 9, 6, 8, 15);
const at = (d, m) => new Date(2026, m - 1, d, 8, 0).toISOString();
const fazenda = {
  id: "f1",
  nome: "Fazenda Boa Vista",
  municipio: "Rio Verde",
  uf: "GO",
  agronomoNome: "Ana Lima",
  agronomoCrea: "GO-123",
  talhoes: [
    { id: "t3", nome: "Talhão 3", apelido: "Sede", hectares: 60 },
    { id: "t7", nome: "Talhão 7", apelido: "Baixada", hectares: 48 },
    { id: "t9", nome: "Talhão 9", apelido: "Rio", hectares: 40 },
  ],
};
const laudo = (id, talhaoId, disease, severity, confidence, d, m) => ({
  id, talhaoId, talhaoNome: fazenda.talhoes.find((t) => t.id === talhaoId)?.nome || null, disease, diseaseId: disease.toLowerCase(), severity, confidence, timestamp: at(d, m), modelUsed: "ensemble", top3: [],
});
const laudos = [
  laudo("a", "t3", "Ferrugem-asiática", "alta", 0.86, 8, 9),
  laudo("b", "t3", "Ferrugem-asiática", "alta", 0.91, 25, 9),
  laudo("c", "t3", "Ferrugem-asiática", "alta", 0.97, 6, 10),
  laudo("d", "t7", "Saudável", "nenhuma", 0.99, 14, 9),
  laudo("e", "t7", "Saudável", "nenhuma", 0.98, 29, 9),
  laudo("x", "outro", "Míldio", "media", 0.9, 1, 10), // de outra fazenda
];

test("indicadores, período e resumo qualitativo saem dos dados", () => {
  const r = buildReportData({ fazenda, laudos, now: NOW });
  expect(r.kpis).toEqual({ laudos: 5, talhoes: 3, hectares: 148, doencas: 1, altoRisco: 1 });
  expect(r.periodo).toBe("08/09 a 06/10/2026");
  expect(r.resumo).toMatch(/Ferrugem-asiática foi a ocorrência mais frequente: 3 de 5 laudos, todos no Talhão 3 · Sede, com a confiança subindo de 86% para 97%\./);
  expect(r.resumo).toMatch(/Talhão 7 · Baixada segue saudável nas 2 leituras/);
  expect(r.resumo).toMatch(/Talhão 9 · Rio ainda não tem leitura/);
  expect(r.laudos.map((d) => d.id)).toEqual(["c", "e", "b", "d", "a"]);
});

test("prioridades vão do maior risco para a falta de leitura", () => {
  const r = buildReportData({ fazenda, laudos, now: NOW });
  expect(r.prioridades.map((p) => p.talhao)).toEqual(["Talhão 3 · Sede", "Talhão 9 · Rio"]);
  expect(r.prioridades[0].texto).toMatch(/agrônomo/);
  expect(r.prioridades[1].texto).toMatch(/primeira leitura/);
});

test("nota por talhão e leitura anterior", () => {
  const r = buildReportData({ fazenda, laudos, now: NOW });
  const sede = r.porTalhao.find((p) => p.talhao.id === "t3");
  expect(sede.nota).toMatch(/Ferrugem-asiática em 3 de 3 leituras/);
  expect(r.anterior(laudos[2]).id).toBe("b");
  expect(r.anterior(laudos[0])).toBeNull();
});

test("sem fazenda, cobre todos os laudos; sem laudos, diz isso", () => {
  expect(buildReportData({ fazenda: null, laudos, now: NOW }).kpis.laudos).toBe(6);
  const vazio = buildReportData({ fazenda, laudos: [], now: NOW });
  expect(vazio.periodo).toBe("sem laudos");
  expect(vazio.resumo).toMatch(/Ainda não há laudos/);
});

test("gera o PDF: capa, talhões, um laudo por página e método", async () => {
  // Sem rede no teste: foto e capa caem no "Foto indisponível".
  global.fetch = jest.fn(() => Promise.reject(new Error("offline")));
  const { exportFarmReport } = require("../farmReport");
  const planoDe = jest.fn(async () => ({ essencial: ["Levar o laudo ao agrônomo"], campo: ["Fotografar o mesmo ponto em 7 dias"], sources: [{ title: "Fonte A" }] }));
  const { doc, data } = await exportFarmReport({ fazenda, laudos, produtor: "Felipe", planoDe, save: false, now: NOW });
  expect(data.laudos).toHaveLength(5);
  expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2 + 5 + 1);
  expect(planoDe).toHaveBeenCalledTimes(2); // uma vez por doença
});
