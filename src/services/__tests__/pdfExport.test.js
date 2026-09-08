jest.mock("../../config/runtime", () => ({ IS_DEMO: true }));
const { exportDiagnosisPdf, exportHistoryPdf } = require("../pdfExport");
test("relatório longo tem páginas adicionais e não corta orientações", () => {
  const doc = exportDiagnosisPdf(
    {
      id: "test",
      disease: "Ferrugem",
      confidence: 0.92,
      timestamp: "2026-09-07",
      description: "Descrição de teste.",
      actionPlan: {
        essencial: Array.from(
          { length: 60 },
          (_, i) =>
            "Orientação " +
            i +
            " para acompanhamento da folha e registro do contexto.",
        ),
      },
    },
    { save: false },
  );
  expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  const content = doc.output();
  expect(content).toContain("59");
  expect(content).toContain("SIMULADO");
});
test("exportação do histórico usa autoTable e inclui todas as linhas", () => {
  const doc = exportHistoryPdf(
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      disease: "Hipótese " + i,
      timestamp: "2026-09-07",
      confidence: 0.8,
      modelUsed: "resnet50",
    })),
    { save: false },
  );
  expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  expect(doc.lastAutoTable.body).toHaveLength(80);
});
