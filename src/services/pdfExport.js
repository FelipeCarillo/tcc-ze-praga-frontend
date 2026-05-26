import { jsPDF } from 'jspdf';

const MATA = '#1F5A3D';
const SOLO = '#1C2A20';

function severityLabel(sev) {
  return { alta: 'Severa', media: 'Moderada', baixa: 'Leve', nenhuma: 'Saudável' }[sev] || '—';
}

function actionList(actionPlan) {
  if (!actionPlan) return [];
  if (Array.isArray(actionPlan)) return actionPlan;
  return actionPlan.essencial || actionPlan.campo || [];
}

/**
 * Gera um PDF do diagnóstico com cabeçalho institucional (Zé Praga · IMT),
 * pra o produtor mostrar pro agrônomo. Texto puro via jsPDF (sem libs extras).
 */
export function exportDiagnosisPdf(diagnosis) {
  if (!diagnosis) return;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 56;

  // Header
  doc.setFillColor(MATA);
  doc.roundedRect(margin, y - 28, 36, 36, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(MATA);
  doc.text('Zé Praga', margin + 48, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('CONSULTA DE PRAGAS · IMT 2026', margin + 48, y + 14);

  y += 48;
  doc.setDrawColor(220);
  doc.line(margin, y, pageW - margin, y);
  y += 32;

  // Diagnosis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(SOLO);
  doc.text(diagnosis.disease || 'Diagnóstico', margin, y);
  y += 18;
  if (diagnosis.scientificName) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text(diagnosis.scientificName, margin, y);
    y += 20;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(SOLO);
  const conf = diagnosis.confidence != null ? `${(diagnosis.confidence * 100).toFixed(1)}%` : '—';
  doc.text(`Confiança: ${conf}    Severidade: ${severityLabel(diagnosis.severity)}`, margin, y);
  y += 16;
  if (diagnosis.timestamp) {
    doc.setTextColor(120);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(diagnosis.timestamp).toLocaleString('pt-BR')}`, margin, y);
    y += 20;
  }

  // Description
  if (diagnosis.description) {
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(MATA);
    doc.text('O que é', margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(SOLO);
    const lines = doc.splitTextToSize(diagnosis.description, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 8;
  }

  // Action plan
  const actions = actionList(diagnosis.actionPlan);
  if (actions.length > 0) {
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(MATA);
    doc.text('Receita do Zé', margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(SOLO);
    actions.forEach((a, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${a}`, pageW - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 4;
    });
  }

  // Footer disclaimer
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    'Apoio à decisão. Para casos sérios, consulte um engenheiro agrônomo.',
    margin,
    doc.internal.pageSize.getHeight() - 40
  );

  const slug = (diagnosis.disease || 'diagnostico').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`diagnostico-${slug}.pdf`);
}
