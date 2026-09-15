import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { IS_DEMO } from "../config/runtime";
const GREEN = "#1F5A3D";
const clean = (value) =>
  String(value ?? "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"');
function document() {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({
    title: "Zé Praga - Registro de observação",
    author: "Zé Praga - IMT",
  });
  return doc;
}
function footer(doc) {
  const count = doc.getNumberOfPages();
  for (let page = 1; page <= count; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#59665C");
    doc.text(
      "Zé Praga - IMT | Apoio à observação, sem confirmação em campo.",
      18,
      284,
    );
    doc.text(page + " / " + count, 192, 284, { align: "right" });
  }
}
function writer(doc) {
  let y = 23;
  const text = (value, size = 11, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(bold ? GREEN : "#1C2A20");
    const lines = doc.splitTextToSize(clean(value), 174);
    const height = size * 0.45 + 1;
    // Mantém parágrafos curtos juntos e reserva espaço após um título.
    const required = Math.min(lines.length * height + (bold ? 15 : 3), 245);
    if (y + required > 272) { doc.addPage(); y = 22; }
    for (const line of lines) {
      if (y + height > 272) {
        doc.addPage();
        y = 22;
      }
      doc.text(line, 18, y);
      y += height;
    }
    y += 3;
  };
  return {
    text,
    space: () => {
      y += 4;
    },
  };
}
export function exportDiagnosisPdf(diagnosis, { save = true } = {}) {
  if (!diagnosis) throw new Error("Registro não informado.");
  const doc = document(),
    w = writer(doc);
  w.text("Zé Praga", 23, true);
  w.text("REGISTRO DE OBSERVAÇÃO | IMT 2026", 9);
  if (IS_DEMO) w.text("DEMONSTRAÇÃO - RESULTADO SIMULADO", 11, true);
  w.space();
  w.text(diagnosis.disease || "Hipótese não informada", 20, true);
  w.text(diagnosis.scientificName || "", 11);
  w.text("Data: " + new Date(diagnosis.timestamp).toLocaleString("pt-BR"), 10);
  w.text("Modelo: " + (diagnosis.modelUsed || "não informado"), 10);
  w.text(
    "Confiança do modelo: " +
      (Number.isFinite(diagnosis.confidence)
        ? (diagnosis.confidence * 100).toFixed(1) + "%"
        : "não informada"),
    11,
    true,
  );
  w.text(
    "A pontuação não representa uma confirmação em campo. A severidade da lesão não é medida pelo sistema.",
    10,
  );
  if (diagnosis.description) {
    w.space();
    w.text("Sobre esta doença", 13, true);
    w.text(diagnosis.description);
  }
  const plan = diagnosis.actionPlan;
  if (plan) {
    const levels = Array.isArray(plan)
      ? [["Orientações", plan]]
      : [
          ["Essencial", plan.essencial],
          ["Estratégia de campo", plan.campo],
          ["Visão especialista", plan.especialista],
        ];
    for (const [label, actions] of levels) {
      if (!actions?.length) continue;
      w.space();
      w.text(label, 13, true);
      actions.forEach((action, index) =>
        w.text(
          index +
            1 +
            ". " +
            (typeof action === "string"
              ? action
              : action.description || action.title || ""),
        ),
      );
    }
    if (plan.sources?.length) {
      w.space();
      w.text("Fontes do catálogo de orientações", 13, true);
      plan.sources.forEach((source) =>
        w.text(
          typeof source === "string"
            ? source
            : [source.title || source.name, source.url]
                .filter(Boolean)
                .join(" - "),
          9,
        ),
      );
    }
  } else w.text("Não há plano de ação disponível neste registro.", 10);
  w.space();
  w.text("Próximo passo", 13, true);
  w.text(
    "Compare os sinais com o contexto da lavoura e procure um profissional de agronomia antes de decidir o manejo. Resultados em bases de avaliação não garantem desempenho em campo.",
  );
  footer(doc);
  if (save)
    doc.save(
      "ze-praga-registro-" +
        String(diagnosis.id || "analise").replace(/[^a-zA-Z0-9-]/g, "") +
        ".pdf",
    );
  return doc;
}
export function exportHistoryPdf(items, { save = true } = {}) {
  const doc = document(),
    w = writer(doc);
  w.text("Zé Praga | Caderno de campo", 20, true);
  w.text(
    items.length +
      " registros - Gerado em " +
      new Date().toLocaleDateString("pt-BR"),
    10,
  );
  if (IS_DEMO) w.text("DEMONSTRAÇÃO - RESULTADOS SIMULADOS", 10, true);
  autoTable(doc, {
    startY: IS_DEMO ? 58 : 48,
    margin: { left: 18, right: 18, bottom: 23 },
    head: [["Data", "Hipótese", "Modelo", "Confiança"]],
    body: items.map((item) => [
      new Date(item.timestamp).toLocaleDateString("pt-BR"),
      clean(item.disease),
      clean(item.modelUsed),
      Number.isFinite(item.confidence)
        ? (item.confidence * 100).toFixed(1) + "%"
        : "-",
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: { fillColor: GREEN },
    alternateRowStyles: { fillColor: "#F4F7F2" },
  });
  footer(doc);
  if (save) doc.save("ze-praga-historico.pdf");
  return doc;
}
