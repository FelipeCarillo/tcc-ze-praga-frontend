import { riskOf } from "./severity";

/**
 * Sugestões de continuação da conversa — m-Chat-Sugestoes do canvas.
 *
 * Montadas por regra a partir do que já está na tela (o laudo, os talhões
 * do usuário e os lembretes), sem chamar modelo de linguagem: cada sugestão
 * é uma pergunta que o Zé sabe responder com as ferramentas que tem, ou uma
 * ação da própria interface (`action`).
 *
 * @returns {Array<{label: string, text?: string, action?: "reminder"|"camera"}>}
 */
export function suggestionsFor(message, { talhoes = [], hasReminder = false } = {}) {
  if (!message || message.role !== "assistant" || message.isStreaming || message.isError) return [];
  const d = message.diagnosis;
  if (d) {
    const r = riskOf(d.severity);
    const out = [];
    if (r.rank === 0) {
      out.push({ label: "Como manter o talhão saudável?", text: "Como manter esse talhão saudável nas próximas semanas?" });
      out.push({ label: "Quando fotografar de novo?", text: "De quanto em quanto tempo devo fotografar esse talhão?" });
    } else {
      out.push({ label: "O que aplicar agora?", text: `O que devo fazer agora contra ${d.disease.toLowerCase()}?` });
      const vizinho = talhoes.find((t) => t.id !== d.talhaoId);
      out.push(
        vizinho
          ? { label: `Pode passar pro ${vizinho.nome}?`, text: `${d.disease} pode passar para o ${vizinho.nome}${vizinho.apelido ? " · " + vizinho.apelido : ""}?` }
          : { label: "Isso passa para outras áreas?", text: `${d.disease} pode passar para outras áreas da lavoura?` },
      );
      if (d.talhaoId)
        out.push({ label: "Comparar com o laudo anterior", text: `Compare este laudo com o anterior do ${d.talhaoNome || "mesmo talhão"}.` });
    }
    if (!hasReminder) out.push({ label: "Lembrar em 7 dias", action: "reminder" });
    return out;
  }
  if (message.content)
    return [
      { label: "Analisar uma folha", action: "camera" },
      { label: "Como reconhecer ferrugem?", text: "Como reconhecer a ferrugem-asiática na folha?" },
      { label: "O que é mancha-alvo?", text: "O que é a mancha-alvo e como ela aparece?" },
    ];
  return [];
}

/** As perguntas da conversa vazia (m-Chat-Vazio). */
export const STARTERS = [
  { label: "Como reconhecer ferrugem?", text: "Como reconhecer a ferrugem-asiática na folha?" },
  { label: "O que é mancha-alvo?", text: "O que é a mancha-alvo e como ela aparece?" },
];
