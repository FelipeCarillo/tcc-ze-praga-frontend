jest.mock("../../config/runtime", () => ({ IS_DEMO: true }));
jest.mock("../api", () => ({ __esModule: true, default: {} }));

const { createFazenda, deleteFazenda, listFazendas, updateFazenda } = require("../fazendasService");
const { createTalhao, updateTalhao } = require("../talhoesService");
const { readTalhoes } = require("../localFarmStore");
const { summarize } = require("../../hooks/useFazendas");

beforeEach(() => localStorage.clear());

test("talhões antigos, sem fazenda, vão para a 'Minha fazenda' (como a migration 0013)", async () => {
  localStorage.setItem("zepraga-talhoes:" + require("../authService").getCurrentUserId(), JSON.stringify([{ id: "t-velho", nome: "Sede" }]));
  const [f] = await listFazendas();
  expect(f.nome).toBe("Minha fazenda");
  expect(f.talhoes.map((t) => t.id)).toEqual(["t-velho"]);
});

test("fazenda com talhões aninhados; mover talhão e apagar fazenda", async () => {
  const boa = await createFazenda({ nome: "Fazenda Boa Vista", municipio: "Rio Verde", uf: "go", hectares: "182" });
  expect(boa).toMatchObject({ uf: "GO", hectares: 182, talhoes: [] });
  const sitio = await createFazenda({ nome: "Sítio São José" });
  const t3 = await createTalhao({ nome: "Talhão 3", apelido: "Sede", hectares: "60", fazendaId: boa.id });
  await createTalhao({ nome: "Talhão 7", hectares: 48, fazendaId: boa.id });
  let list = await listFazendas();
  expect(list.find((f) => f.id === boa.id).talhoes).toHaveLength(2);
  expect(summarize({ ...list[0], talhoes: list[0].talhoes.map((t) => ({ ...t, last: { severity: "alta" } })) })).toMatchObject({ talhoes: 2, hectares: 108, altoRisco: 2 });

  await updateTalhao(t3.id, { fazendaId: sitio.id });
  list = await listFazendas();
  expect(list.find((f) => f.id === sitio.id).talhoes.map((t) => t.id)).toEqual([t3.id]);

  const editada = await updateFazenda(boa.id, { nome: "Boa Vista II", agronomoNome: "Ana" });
  expect(editada).toMatchObject({ nome: "Boa Vista II", agronomoNome: "Ana", municipio: "Rio Verde" });

  await deleteFazenda(sitio.id);
  expect(readTalhoes().some((t) => t.id === t3.id)).toBe(false);
  expect((await listFazendas()).map((f) => f.nome)).toEqual(["Boa Vista II"]);
});

test("talhão sem fazenda escolhida vai para a padrão", async () => {
  const t = await createTalhao({ nome: "Talhão 1" });
  const [f] = await listFazendas();
  expect(t.fazendaId).toBe(f.id);
  expect(f.nome).toBe("Minha fazenda");
});
