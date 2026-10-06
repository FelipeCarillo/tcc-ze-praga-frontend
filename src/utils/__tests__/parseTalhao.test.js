import { parseTalhao, pedeCadastroDeTalhao } from "../parseTalhao";

const NOW = new Date(2026, 9, 6); // 06/10/2026

test("lê nome, apelido, área e data por extenso", () => {
  expect(parseTalhao("É novo. Talhão 9, do Rio, uns 40 hectares. Plantei dia 12 de setembro.", NOW)).toEqual({
    nome: "Talhão 9",
    apelido: "Rio",
    hectares: 40,
    dataSemeadura: "2026-09-12",
  });
});

test("aceita ha, vírgula decimal e data numérica", () => {
  expect(parseTalhao("talhao 12 da Chapada, 34,5 ha, semeado 08/09/2026", NOW)).toMatchObject({
    nome: "Talhão 12",
    apelido: "Chapada",
    hectares: 34.5,
    dataSemeadura: "2026-09-08",
  });
});

test("plantio em data 'futura' é do ano anterior", () => {
  expect(parseTalhao("talhão 2, plantei dia 20 de dezembro", NOW).dataSemeadura).toBe("2025-12-20");
});

test("não inventa o que não foi dito", () => {
  expect(parseTalhao("é o da baixada", NOW)).toEqual({ nome: "Novo talhão", apelido: null, hectares: null, dataSemeadura: null });
  expect(parseTalhao("talhão Sede de Cima", NOW).nome).toBe("Talhão Sede");
});

test("reconhece pedido de cadastro", () => {
  expect(pedeCadastroDeTalhao("cria o talhão 9 do Rio, 40 hectares")).toBe(true);
  expect(pedeCadastroDeTalhao("cadastra um talhão novo")).toBe(true);
  expect(pedeCadastroDeTalhao("o que é ferrugem no talhão?")).toBe(false);
});
