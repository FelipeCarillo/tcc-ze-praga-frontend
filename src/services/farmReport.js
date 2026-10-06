import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { IS_DEMO } from "../config/runtime";
import { CLASS_LABELS, DATASET, MODELS } from "../data/modelMetrics";
import { riskOf } from "../utils/severity";
import { buildReportData, nomeTalhao } from "./farmReportData";
import capa from "../assets/field/lavoura-rs.jpg";

/**
 * "Relatório da lavoura" em PDF A4 (TCC-099) — as quatro páginas do canvas:
 * capa e resumo; situação por talhão com todos os laudos; uma página
 * completa por laudo; método, limites e revisão técnica.
 */

const W = 210;
const M = 15;
const INK = "#0F1A13";
const SUB = "#4A5A4F";
const LINE = "#DCE2D6";
const GREEN = "#1B4D2E";
const LIME = "#C8F169";

const clean = (v) =>
  String(v ?? "")
    .replace(/[‐-―]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...");
const pct = (c) => (Number.isFinite(c) ? Math.round(c * 100) + "%" : "-");
const ha = (n) => Number(n || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " ha";
const dataHora = (iso) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} · ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

/** Imagem → dataURL (para o jsPDF). Falha de rede/CORS vira null. */
export async function loadImage(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Recorte central na proporção do quadro (como `object-fit: cover`), para a
 * foto não sair esticada no PDF. Sem canvas (testes), devolve a original.
 */
export async function cover(dataUrl, ratio, maxW = 1200) {
  // jsdom (testes) não carrega imagens: o onload nunca viria.
  if (!dataUrl || typeof document === "undefined" || /jsdom/i.test(navigator.userAgent)) return dataUrl;
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return dataUrl;
    let sw = w;
    let sh = w / ratio;
    if (sh > h) {
      sh = h;
      sw = h * ratio;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(maxW, Math.round(sw));
    canvas.height = Math.round(canvas.width / ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return dataUrl;
  }
}

function fmt(img) {
  return /^data:image\/png/.test(img) ? "PNG" : "JPEG";
}

function text(doc, value, x, y, { size = 10, color = INK, bold = false, italic = false, align, maxWidth } = {}) {
  doc.setFont("helvetica", bold ? (italic ? "bolditalic" : "bold") : italic ? "italic" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(color);
  const lines = maxWidth ? doc.splitTextToSize(clean(value), maxWidth) : clean(value);
  doc.text(lines, x, y, { align, lineHeightFactor: 1.4 });
  return Array.isArray(lines) ? lines.length * size * 0.3528 * 1.4 : size * 0.3528 * 1.4;
}

function chip(doc, label, x, y, risk) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const w = doc.getTextWidth(clean(label)) + 6;
  doc.setFillColor(risk.bg);
  doc.roundedRect(x, y - 4, w, 6, 3, 3, "F");
  doc.setTextColor(risk.fg);
  doc.text(clean(label), x + 3, y);
  return w;
}

function notice(doc, y, title, body) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(clean(`${title} ${body}`), W - 2 * M - 12);
  const h = lines.length * 4.6 + 6;
  doc.setFillColor("#FBF1C9");
  doc.roundedRect(M, y, W - 2 * M, h, 3, 3, "F");
  doc.setDrawColor("#5A3E02");
  doc.setLineWidth(0.4);
  doc.circle(M + 4.6, y + 4.6, 1.8, "S");
  doc.setTextColor("#5A3E02");
  doc.setFont("helvetica", "bold");
  doc.text(clean(title), M + 9, y + 5.6);
  const tw = doc.getTextWidth(clean(title) + " ");
  doc.setFont("helvetica", "normal");
  const rest = doc.splitTextToSize(clean(body), W - 2 * M - 12 - tw);
  doc.text(rest[0] || "", M + 9 + tw, y + 5.6);
  if (rest.length > 1) doc.text(doc.splitTextToSize(clean(rest.slice(1).join(" ")), W - 2 * M - 12), M + 9, y + 10.2, { lineHeightFactor: 1.4 });
  return h;
}

function eyebrow(doc, value, y) {
  text(doc, value.toUpperCase(), M, y, { size: 8, color: GREEN, bold: true });
}

function h1(doc, value, y, size = 22) {
  text(doc, value, M, y, { size, bold: true });
}

function footers(doc, left) {
  const n = doc.getNumberOfPages();
  for (let p = 1; p <= n; p++) {
    doc.setPage(p);
    doc.setDrawColor(LINE);
    doc.setLineWidth(0.3);
    doc.line(M, 284, W - M, 284);
    text(doc, p === 1 ? left : "Zé Praga · auxiliar, não fonte da verdade", M, 289, { size: 8, color: SUB });
    text(doc, `${p} / ${n}`, W - M, 289, { size: 8, color: SUB, align: "right" });
  }
}

function sparkline(doc, laudos, x, y, w, h) {
  const pts = laudos.filter((d) => Number.isFinite(d.confidence));
  if (pts.length < 2) return;
  const step = w / (pts.length - 1);
  const yOf = (c) => y + h - c * h;
  doc.setLineWidth(0.6);
  doc.setDrawColor(riskOf(pts[pts.length - 1].severity).dot);
  for (let i = 1; i < pts.length; i++) doc.line(x + (i - 1) * step, yOf(pts[i - 1].confidence), x + i * step, yOf(pts[i].confidence));
  pts.forEach((d, i) => {
    doc.setFillColor(riskOf(d.severity).dot);
    doc.circle(x + i * step, yOf(d.confidence), 0.9, "F");
  });
}

function capaPage(doc, data, { fazenda, produtor, capaImg }) {
  doc.setFillColor("#0B1510");
  doc.rect(0, 0, W, 106, "F");
  if (capaImg) {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.42 }));
    doc.addImage(capaImg, fmt(capaImg), 0, 0, W, 106, undefined, "FAST");
    doc.restoreGraphicsState();
  }
  doc.setFillColor(LIME);
  doc.roundedRect(M, 13, 9, 9, 2, 2, "F");
  doc.setFillColor(GREEN);
  doc.circle(M + 4.5, 17.5, 2.2, "F");
  text(doc, "ZÉ PRAGA", M + 12, 19.6, { size: 13, color: "#FFFFFF", bold: true });
  text(doc, "RELATÓRIO FITOSSANITÁRIO · SOJA", W - M, 19.6, { size: 8, color: LIME, bold: true, align: "right" });
  text(doc, "Relatório", M, 60, { size: 38, color: "#FFFFFF", bold: true });
  text(doc, "da lavoura", M, 74, { size: 38, color: "#FFFFFF", bold: true });
  const local = fazenda ? [fazenda.municipio, fazenda.uf].filter(Boolean).join("/") : "";
  const linhas = [
    `Período de ${data.periodo} · gerado em ${data.geradoEm}`,
    fazenda ? [fazenda.nome, local, data.kpis.talhoes ? `${ha(data.kpis.hectares)} em ${data.kpis.talhoes} ${data.kpis.talhoes === 1 ? "talhão" : "talhões"}` : ""].filter(Boolean).join(" · ") : "Todos os laudos da conta",
    `Produtor: ${produtor || "não informado"}`,
  ];
  linhas.forEach((l, i) => text(doc, l, M, 86 + i * 6, { size: 10.5, color: "#DDE5D8" }));
  if (IS_DEMO) text(doc, "DEMONSTRAÇÃO · RESULTADOS SIMULADOS", W - M, 100, { size: 8, color: LIME, bold: true, align: "right" });

  // Indicadores
  const k = data.kpis;
  const tiles = [
    [String(k.laudos), "laudos no período"],
    [String(k.talhoes), k.hectares ? `talhões · ${ha(k.hectares)}` : "talhões"],
    [String(k.doencas), k.doencas === 1 ? "doença encontrada" : "doenças encontradas"],
    [String(k.altoRisco), k.altoRisco === 1 ? "talhão em risco alto" : "talhões em risco alto"],
  ];
  const tw = (W - 2 * M - 9) / 4;
  tiles.forEach(([v, l], i) => {
    const x = M + i * (tw + 3);
    const alert = i === 3 && k.altoRisco > 0;
    doc.setDrawColor(alert ? "#8A1C12" : LINE);
    doc.setLineWidth(alert ? 0.7 : 0.3);
    doc.roundedRect(x, 114, tw, 22, 3, 3, "S");
    text(doc, v, x + 4, 125, { size: 20, bold: true, color: alert ? "#8A1C12" : INK });
    text(doc, l, x + 4, 132, { size: 8, color: alert ? "#8A1C12" : SUB, bold: alert });
  });

  let y = 148;
  h1(doc, "Resumo do período", y, 15);
  y += 7;
  y += text(doc, data.resumo, M, y, { size: 10.5, maxWidth: W - 2 * M });
  y += 6;

  // Ocorrências | Prioridades
  const colW = (W - 2 * M - 10) / 2;
  text(doc, "Ocorrências por diagnóstico", M, y, { size: 11.5, bold: true });
  text(doc, "Prioridades sugeridas", M + colW + 10, y, { size: 11.5, bold: true });
  let yl = y + 7;
  const max = Math.max(1, ...data.ocorrencias.map((o) => o.n));
  for (const o of data.ocorrencias.slice(0, 6)) {
    text(doc, o.nome, M, yl, { size: 9 });
    doc.setFillColor("#EEF1EA");
    doc.roundedRect(M + 36, yl - 3, colW - 44, 3.6, 1, 1, "F");
    doc.setFillColor(o.saudavel ? GREEN : o === data.ocorrencias.find((x) => !x.saudavel) ? "#8A1C12" : "#B7791F");
    doc.roundedRect(M + 36, yl - 3, Math.max(2, ((colW - 44) * o.n) / max), 3.6, 1, 1, "F");
    text(doc, String(o.n), M + colW, yl, { size: 9, align: "right" });
    yl += 6.5;
  }
  let yr = y + 7;
  data.prioridades.forEach((p, i) => {
    yr += text(doc, `${i + 1}. ${p.talhao}: ${p.texto}`, M + colW + 10, yr, { size: 9.5, maxWidth: colW }) + 1.5;
  });
  if (!data.prioridades.length) text(doc, "Nada urgente: siga monitorando.", M + colW + 10, yr, { size: 9.5, color: SUB });
  y = Math.max(yl, yr) + 4;
  notice(doc, Math.min(y, 262), "O Zé Praga é um auxiliar, não fonte da verdade.", "Os diagnósticos deste relatório são hipóteses automáticas a partir de fotos. Confirme com um engenheiro-agrônomo antes de qualquer aplicação.");
}

function talhoesPage(doc, data) {
  doc.addPage();
  eyebrow(doc, "Seção 1", 20);
  h1(doc, "Situação por talhão", 30);
  let y = 38;
  const colW = (W - 2 * M - 6) / 2;
  data.porTalhao.forEach((p, i) => {
    const x = M + (i % 2) * (colW + 6);
    if (i % 2 === 0 && i > 0) y += 33;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    const alto = p.risco?.rank === 3;
    doc.setDrawColor(alto ? "#8A1C12" : LINE);
    doc.setLineWidth(alto ? 0.7 : 0.3);
    if (!p.ultimo) doc.setLineDashPattern([1.5, 1.2], 0);
    doc.roundedRect(x, y, colW, 29, 3, 3, "S");
    doc.setLineDashPattern([], 0);
    text(doc, nomeTalhao(p.talhao), x + 4, y + 7, { size: 11.5, bold: true });
    const r = p.risco || { label: "Sem leitura", bg: "#EEF1EA", fg: SUB };
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    chip(doc, r.label, x + colW - 4 - (doc.getTextWidth(clean(r.label)) + 6), y + 7, r);
    const meta = [p.talhao.hectares ? ha(p.talhao.hectares) : null, p.talhao.dataSemeadura ? `semeado ${new Date(p.talhao.dataSemeadura + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}` : null, `${p.laudos.length} ${p.laudos.length === 1 ? "laudo" : "laudos"}`].filter(Boolean).join(" · ");
    text(doc, meta, x + 4, y + 12.5, { size: 8, color: SUB });
    sparkline(doc, p.laudos, x + 4, y + 16, 26, 9);
    text(doc, p.nota, x + (p.laudos.length >= 2 ? 34 : 4), y + 19, { size: 8.5, maxWidth: colW - (p.laudos.length >= 2 ? 38 : 8) });
  });
  y += data.porTalhao.length ? 39 : 0;
  if (y > 230) {
    doc.addPage();
    y = 20;
  }
  text(doc, "Todos os laudos do período", M, y, { size: 13, bold: true });
  autoTable(doc, {
    startY: y + 4,
    margin: { left: M, right: M, bottom: 18 },
    head: [["Data", "Talhão", "Diagnóstico", "Confiança", "Risco", "Modelo"]],
    body: data.laudos.map((d) => [
      dataHora(d.timestamp),
      clean(d.talhaoNome || "Sem talhão"),
      clean(d.disease),
      pct(d.confidence),
      clean(riskOf(d.severity).label.replace("Risco ", "")),
      clean(d.modelUsed || "-"),
    ]),
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.2, textColor: INK, lineColor: LINE, lineWidth: 0.2 },
    headStyles: { fillColor: "#FFFFFF", textColor: SUB, fontStyle: "bold", lineWidth: { bottom: 0.5 }, lineColor: INK },
    columnStyles: { 3: { halign: "right" } },
    alternateRowStyles: { fillColor: "#F7F9F4" },
  });
  const after = doc.lastAutoTable?.finalY ?? y + 10;
  text(doc, "“Risco” é o risco associado à doença identificada, não a severidade medida na folha.", M, Math.min(after + 6, 278), { size: 8, color: SUB });
}

function laudoPage(doc, d, i, total, data, { foto, plano }) {
  doc.addPage();
  eyebrow(doc, `Seção 2 · Laudo ${String(i + 1).padStart(2, "0")} de ${String(total).padStart(2, "0")}`, 20);
  h1(doc, d.talhaoNome || "Sem talhão", 30);
  text(doc, dataHora(d.timestamp), W - M, 24, { size: 9, color: SUB, align: "right" });
  text(doc, `laudo #${String(d.id).slice(0, 8)}`, W - M, 29, { size: 9, color: SUB, align: "right" });
  doc.setDrawColor(INK);
  doc.setLineWidth(0.5);
  doc.line(M, 33, W - M, 33);

  // Foto | identificação
  if (foto) doc.addImage(foto, fmt(foto), M, 39, 78, 62, undefined, "FAST");
  else {
    doc.setFillColor("#EEF1EA");
    doc.roundedRect(M, 39, 78, 62, 3, 3, "F");
    text(doc, "Foto indisponível", M + 39, 71, { size: 9, color: SUB, align: "center" });
  }
  const x = M + 86;
  const r = riskOf(d.severity);
  chip(doc, r.rank === 3 ? `${r.label} · agir nesta semana` : r.label, x, 45, r);
  let y = 55;
  y += text(doc, d.disease || "Hipótese não informada", x, y, { size: 19, bold: true, maxWidth: W - M - x });
  if (d.scientificName) y += text(doc, d.scientificName, x, y - 1, { size: 10, color: SUB, italic: true });
  text(doc, pct(d.confidence), x, y + 8, { size: 24, bold: true });
  text(doc, "confiança", x, y + 13, { size: 8, color: SUB });
  text(doc, d.modelUsed === "ensemble" ? "Ensemble de 3 modelos" : `Modelo ${d.modelUsed || "não informado"}`, x + 30, y + 5, { size: 9.5 });
  if (d.modelUsed === "ensemble") text(doc, "ResNet-50 · EfficientNet-B4 · ViT-B/16", x + 30, y + 10, { size: 8, color: SUB });
  y += 21;
  const outras = (d.top3 || []).filter((t) => t.disease && t.disease !== d.disease).slice(0, 2);
  if (outras.length) {
    text(doc, "Outras hipóteses", x, y, { size: 9, bold: true, color: SUB });
    outras.forEach((o, k) => {
      const yy = y + 6 + k * 5.5;
      text(doc, o.disease, x, yy, { size: 8.5 });
      doc.setFillColor("#EEF1EA");
      doc.roundedRect(x + 30, yy - 2.6, 40, 2.8, 1, 1, "F");
      doc.setFillColor(SUB);
      doc.roundedRect(x + 30, yy - 2.6, Math.max(1, 40 * (o.confidence || 0)), 2.8, 1, 1, "F");
      text(doc, pct(o.confidence), W - M, yy, { size: 8.5, align: "right" });
    });
  }

  // Leitura | histórico do talhão
  y = 112;
  const colW = (W - 2 * M - 10) / 2;
  text(doc, "O que a análise indica", M, y, { size: 11.5, bold: true });
  const desc = d.description || `${d.disease} identificada com ${pct(d.confidence)} de confiança pelo modelo.`;
  const hl = text(doc, desc, M, y + 6, { size: 9.5, maxWidth: colW });
  text(doc, "Leitura anterior neste talhão", M + colW + 10, y, { size: 11.5, bold: true });
  const ant = data.anterior(d);
  const hr = text(
    doc,
    ant ? `${ant.disease}, ${pct(ant.confidence)}, em ${new Date(ant.timestamp).toLocaleDateString("pt-BR")} (${riskOf(ant.severity).label.toLowerCase()}).` : d.talhaoId ? "Esta é a primeira leitura deste talhão no período." : "Laudo sem talhão: não há leitura anterior para comparar.",
    M + colW + 10,
    y + 6,
    { size: 9.5, maxWidth: colW },
  );
  y += Math.max(hl, hr) + 12;

  // Plano de ação
  text(doc, "Plano de ação sugerido", M, y, { size: 11.5, bold: true });
  y += 4;
  const niveis = [
    ["ESSENCIAL", plano?.essencial],
    ["NO CAMPO", plano?.campo],
  ].filter(([, a]) => a?.length);
  if (!niveis.length) {
    text(doc, "Não há plano de ação cadastrado para este diagnóstico no seu plano.", M, y + 6, { size: 9.5, color: SUB });
    y += 12;
  } else {
    const bw = niveis.length === 1 ? W - 2 * M : (W - 2 * M - 6) / 2;
    let hmax = 0;
    niveis.forEach(([rot, acoes], k) => {
      const bx = M + k * (bw + 6);
      let by = y + 8;
      const start = y;
      text(doc, rot, bx + 4, by, { size: 8, bold: true, color: GREEN });
      by += 5;
      acoes.slice(0, 6).forEach((a) => {
        const t = typeof a === "string" ? a : a.description || a.title || "";
        doc.setDrawColor(INK);
        doc.setLineWidth(0.35);
        doc.rect(bx + 4, by - 2.8, 3, 3);
        by += text(doc, t, bx + 9, by, { size: 8.5, maxWidth: bw - 13 }) + 0.8;
      });
      hmax = Math.max(hmax, by - start);
    });
    niveis.forEach((_, k) => {
      doc.setDrawColor(LINE);
      doc.setLineWidth(0.3);
      doc.roundedRect(M + k * (bw + 6), y + 2, bw, hmax, 3, 3, "S");
    });
    y += hmax + 7;
  }
  const fontes = (plano?.sources || []).map((s) => (typeof s === "string" ? s : s.title || s.name || s.url)).filter(Boolean);
  if (fontes.length) y += text(doc, `Fontes do plano: ${fontes.slice(0, 4).join(" · ")}`, M, y, { size: 8, color: SUB, maxWidth: W - 2 * M }) + 3;
  notice(doc, Math.min(y + 2, 262), "Hipótese automática, não diagnóstico definitivo.", "Confirme com um engenheiro-agrônomo antes de aplicar qualquer produto.");
}

function metodoPage(doc, fazenda) {
  doc.addPage();
  eyebrow(doc, "Seção 3", 20);
  h1(doc, "Como o Zé chega no diagnóstico", 30);
  let y = 40;
  y += text(
    doc,
    `Cada foto passa por modelos de visão computacional treinados no ${DATASET.name} (${DATASET.fullName}): ${DATASET.totalImages.toLocaleString("pt-BR")} imagens de folhas de soja em ${DATASET.classes} classes, separadas em treino, validação e teste (${DATASET.split.ratio}). Os números abaixo vêm do conjunto de teste, com ${DATASET.split.test.toLocaleString("pt-BR")} imagens que os modelos nunca viram.`,
    M,
    y,
    { size: 10.5, maxWidth: W - 2 * M },
  );
  const obs = { ensemble: "Média das probabilidades dos 3", efficientnet_b4: "Melhor modelo único, o mais leve", vit_b16: "Plano Pro", resnet50: "Plano Gratuito" };
  autoTable(doc, {
    startY: y + 2,
    margin: { left: M, right: M },
    head: [["Modelo", "Acurácia", "F1-macro", "Observação"]],
    body: MODELS.slice()
      .reverse()
      .map((m) => [m.name, (m.accuracy * 100).toFixed(2).replace(".", ",") + "%", (m.f1 * 100).toFixed(2).replace(".", ",") + "%", obs[m.id] || ""]),
    styles: { font: "helvetica", fontSize: 9.5, cellPadding: 2.6, textColor: INK, lineColor: LINE, lineWidth: 0.2 },
    headStyles: { fillColor: "#FFFFFF", textColor: SUB, fontStyle: "bold", lineWidth: { bottom: 0.5 }, lineColor: INK },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    didParseCell: (c) => {
      if (c.section === "body" && c.row.index === MODELS.length - 1) c.cell.styles.fontStyle = "bold";
    },
  });
  y = (doc.lastAutoTable?.finalY ?? y + 40) + 10;
  const colW = (W - 2 * M - 10) / 2;
  text(doc, "Classes reconhecidas", M, y, { size: 11.5, bold: true });
  let cx = M;
  let cy = y + 7;
  CLASS_LABELS.forEach((c) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const w = doc.getTextWidth(c) + 6;
    if (cx + w > M + colW) {
      cx = M;
      cy += 7;
    }
    doc.setDrawColor(LINE);
    doc.roundedRect(cx, cy - 4.2, w, 6, 3, 3, "S");
    text(doc, c, cx + 3, cy, { size: 8.5 });
    cx += w + 2;
  });
  text(doc, "Como ler o risco", M, cy + 11, { size: 11.5, bold: true });
  text(doc, "O risco indica o quanto a doença identificada costuma exigir ação rápida. Ele não mede a área da folha atingida.", M, cy + 17, { size: 9, maxWidth: colW });
  text(doc, "Limites", M + colW + 10, y, { size: 11.5, bold: true });
  let ly = y + 7;
  [
    `Só soja, e só as ${DATASET.classes} classes ao lado. Outra doença pode ser confundida com uma delas.`,
    "Uma foto mostra uma folha, não o talhão inteiro.",
    "Luz ruim, foco ou folha fora da mira reduzem a confiança.",
    "O plano de ação é orientação geral, sem receituário.",
  ].forEach((l) => {
    ly += text(doc, "• " + l, M + colW + 10, ly, { size: 9, maxWidth: colW }) + 1;
  });
  y = Math.max(cy + 32, ly + 6);
  y += notice(doc, y, "O Zé Praga é um auxiliar, não fonte da verdade.", "Este relatório organiza hipóteses automáticas para apoiar a conversa com o agrônomo. Nenhuma aplicação deve ser feita só com base nele.") + 12;
  text(doc, "Revisão técnica", M, y, { size: 11.5, bold: true });
  y += 18;
  const cols = [
    [0, 92, fazenda?.agronomoNome, "Engenheiro-agrônomo responsável pela fazenda"],
    [100, 42, fazenda?.agronomoCrea, "CREA"],
    [148, 32, null, "Data"],
  ];
  cols.forEach(([dx, w, valor, rotulo]) => {
    if (valor) text(doc, valor, M + dx, y - 2, { size: 10 });
    doc.setDrawColor(INK);
    doc.setLineWidth(0.4);
    doc.line(M + dx, y, M + dx + w, y);
    text(doc, rotulo, M + dx, y + 5, { size: 8, color: SUB });
  });
}

/**
 * Gera o relatório. `planoDe(diseaseId)` busca o plano de ação (cacheado
 * aqui por doença); falhas de foto ou de plano não derrubam o PDF.
 */
export async function exportFarmReport({ fazenda, laudos, produtor, planoDe, save = true, now = new Date() }) {
  const data = buildReportData({ fazenda, laudos, now });
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({
    title: `Zé Praga - Relatório da lavoura${fazenda ? " - " + clean(fazenda.nome) : ""}`,
    author: "Zé Praga - IMT",
  });
  const [capaImg, fotos] = await Promise.all([
    loadImage(capa).then((img) => cover(img, W / 106)),
    Promise.all(data.laudos.map((d) => loadImage(d.imageUrl).then((img) => cover(img, 78 / 62, 900)))),
  ]);
  const planos = new Map();
  for (const id of new Set(data.laudos.map((d) => d.diseaseId).filter(Boolean))) {
    try {
      planos.set(id, planoDe ? await planoDe(id) : null);
    } catch {
      planos.set(id, null);
    }
  }
  capaPage(doc, data, { fazenda, produtor, capaImg });
  talhoesPage(doc, data);
  data.laudos.forEach((d, i) => laudoPage(doc, d, i, data.laudos.length, data, { foto: fotos[i], plano: planos.get(d.diseaseId) }));
  metodoPage(doc, fazenda);
  footers(doc, `Zé Praga · ${fazenda ? clean(fazenda.nome) : "Relatório da lavoura"} · ${data.periodo}`);
  if (save) doc.save(`ze-praga-relatorio${fazenda ? "-" + clean(fazenda.nome).toLowerCase().replace(/[^a-z0-9]+/g, "-") : ""}.pdf`);
  return { doc, data };
}
