import { getActionPlan } from "./actionPlanService";
import { getCurrentUser } from "./authService";
import { listFazendas } from "./fazendasService";
import { getDiagnoses } from "./historyService";
import { pickActive } from "./activeFazenda";

/**
 * Junta o que o "Relatório da lavoura" precisa e gera o PDF (TCC-099).
 *
 * Sai por fazenda: a pedida em `fazendaId`, senão a ativa. Sem fazenda
 * cadastrada, o relatório cobre todos os laudos da conta.
 */
export async function exportReport({ fazendaId } = {}) {
  const [fazendas, laudos] = await Promise.all([listFazendas().catch(() => []), getDiagnoses()]);
  const fazenda = fazendaId ? fazendas.find((f) => f.id === fazendaId) || null : pickActive(fazendas);
  const { exportFarmReport } = await import("./farmReport");
  return exportFarmReport({
    fazenda,
    laudos,
    produtor: getCurrentUser()?.full_name || null,
    planoDe: getActionPlan,
  });
}
