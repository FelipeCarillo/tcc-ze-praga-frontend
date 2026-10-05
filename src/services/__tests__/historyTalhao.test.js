// TCC-093 — histórico por talhão no historyService (modo API).
jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() },
}));
jest.mock("../authService", () => ({
  getAuthHeaders: () => ({ Authorization: "Bearer test" }),
  getCurrentUserId: () => "test",
}));
jest.mock("../../config/runtime", () => ({ IS_DEMO: false }));
const api = require("../api").default;
const {
  getDiagnosesPage,
  getDiagnosesByTalhao,
  setDiagnosisTalhao,
  mapDiagnosis,
  SEM_TALHAO,
} = require("../historyService");
beforeEach(() => jest.clearAllMocks());

test("mapDiagnosis expõe o talhão do laudo", () => {
  expect(
    mapDiagnosis({ id: "d", talhao_id: "t-1", talhao_nome: "Sede" }),
  ).toMatchObject({ talhaoId: "t-1", talhaoNome: "Sede" });
  expect(mapDiagnosis({ id: "d" })).toMatchObject({
    talhaoId: null,
    talhaoNome: null,
  });
});

test("lista filtrada por talhão envia talhao_id", async () => {
  api.get.mockResolvedValue({ data: { items: [], total: 0 } });
  await getDiagnosesPage({ talhaoId: SEM_TALHAO });
  expect(api.get.mock.calls[0][1].params.talhao_id).toBe("sem-talhao");
});

test("histórico por talhão mapeia os grupos do backend", async () => {
  api.get.mockResolvedValue({
    data: [
      {
        talhao_id: "t-1",
        talhao_nome: "Sede",
        total: 4,
        last_at: "2026-10-05T10:00:00Z",
        severity_trend: ["nenhuma", "alta"],
        recent: [
          {
            id: "d1",
            disease_name: "Ferrugem",
            talhao_id: "t-1",
            talhao_nome: "Sede",
          },
        ],
      },
      {
        talhao_id: null,
        talhao_nome: null,
        total: 1,
        last_at: null,
        severity_trend: [],
        recent: [],
      },
    ],
  });
  const groups = await getDiagnosesByTalhao({ perGroup: 3 });
  expect(api.get.mock.calls[0][0]).toBe("/api/v1/diagnoses/por-talhao");
  expect(api.get.mock.calls[0][1].params).toEqual({ per_group: 3 });
  expect(groups[0]).toMatchObject({
    talhaoId: "t-1",
    talhaoNome: "Sede",
    total: 4,
    severityTrend: ["nenhuma", "alta"],
  });
  expect(groups[0].recent[0]).toMatchObject({
    id: "d1",
    disease: "Ferrugem",
    talhaoNome: "Sede",
  });
  expect(groups[1].talhaoId).toBeNull();
});

test("mover laudo usa PATCH e null desfaz o vínculo", async () => {
  api.patch.mockResolvedValue({ data: { id: "d1", talhao_id: null } });
  await setDiagnosisTalhao("d1", { id: "t-2", nome: "Baixada" });
  expect(api.patch.mock.calls[0][0]).toBe("/api/v1/diagnoses/d1/talhao");
  expect(api.patch.mock.calls[0][1]).toEqual({ talhao_id: "t-2" });
  await setDiagnosisTalhao("d1", null);
  expect(api.patch.mock.calls[1][1]).toEqual({ talhao_id: null });
});
