jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), delete: jest.fn() },
}));
jest.mock("../authService", () => ({
  getAuthHeaders: () => ({ Authorization: "Bearer test" }),
  getCurrentUserId: () => "test",
}));
jest.mock("../../config/runtime", () => ({ IS_DEMO: false }));
const api = require("../api").default;
const {
  getDiagnosesPage,
  getDiagnoses,
  clearAllDiagnoses,
} = require("../historyService");
beforeEach(() => jest.clearAllMocks());
test("preserva total e envia paginação e busca ao servidor", async () => {
  api.get.mockResolvedValue({
    data: {
      items: [{ id: "d", disease_name: "Ferrugem" }],
      total: 35,
      page: 2,
      limit: 12,
    },
  });
  const page = await getDiagnosesPage({
    page: 2,
    limit: 12,
    search: "Ferrugem",
  });
  expect(page.total).toBe(35);
  expect(page.items[0].disease).toBe("Ferrugem");
  expect(api.get.mock.calls[0][1].params).toEqual({
    page: 2,
    limit: 12,
    search: "Ferrugem",
    severity: undefined,
  });
});
test("exportação busca todas as páginas e mantém os filtros", async () => {
  api.get
    .mockResolvedValueOnce({
      data: {
        items: Array.from({ length: 100 }, (_, i) => ({ id: String(i) })),
        total: 101,
      },
    })
    .mockResolvedValueOnce({ data: { items: [{ id: "last" }], total: 101 } });
  const items = await getDiagnoses({ search: "soja" });
  expect(items).toHaveLength(101);
  expect(api.get.mock.calls[1][1].params).toMatchObject({
    page: 2,
    search: "soja",
  });
});
test("exclusão global exige confirmação e valida o retorno", async () => {
  api.delete.mockResolvedValueOnce({ data: { deleted: 23 } });
  await expect(clearAllDiagnoses()).resolves.toEqual({ deleted: 23 });
  expect(api.delete.mock.calls[0][1].params).toEqual({ confirm: true });
  api.delete.mockResolvedValueOnce({ data: { detail: "Pass confirm" } });
  await expect(clearAllDiagnoses()).rejects.toThrow("não confirmou");
});
