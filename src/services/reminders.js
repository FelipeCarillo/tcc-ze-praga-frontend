import { getCurrentUserId } from "./authService";

/**
 * Lembretes do Zé (rebrand 2026): "voltar ao talhão e fotografar as mesmas
 * plantas" — criados pelo botão "Lembrar em 7 dias" do laudo e mostrados no
 * Início. Ficam no aparelho (localStorage, por usuário): é um lembrete pessoal
 * de campo, não um dado que precise ir para o servidor.
 */

export const REMINDERS_EVENT = "reminders-changed";
const DAY = 24 * 60 * 60 * 1000;
const key = () => "zepraga-lembretes:" + getCurrentUserId();

function read() {
  try {
    const list = JSON.parse(localStorage.getItem(key()));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(key(), JSON.stringify(list));
  } catch {
    // Sem storage: o lembrete vale só nesta sessão.
  }
  window.dispatchEvent(new CustomEvent(REMINDERS_EVENT));
}

/** Lembretes do mais próximo para o mais distante. */
export function listReminders() {
  return read().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}

/** Um lembrete por laudo: lembrar de novo só remarca a data. */
export function addReminder(diagnosis, { days = 7, now = Date.now() } = {}) {
  const reminder = {
    id: diagnosis.id,
    diagnosisId: diagnosis.id,
    disease: diagnosis.disease || null,
    talhaoId: diagnosis.talhaoId || null,
    talhaoNome: diagnosis.talhaoNome || null,
    dueAt: new Date(now + days * DAY).toISOString(),
  };
  write([...read().filter((r) => r.id !== reminder.id), reminder]);
  return reminder;
}

export function removeReminder(id) {
  write(read().filter((r) => r.id !== id));
}

export function hasReminder(diagnosisId) {
  return read().some((r) => r.diagnosisId === diagnosisId);
}

/** Lembretes vencidos (hoje ou antes). */
export function dueReminders(now = Date.now()) {
  return listReminders().filter((r) => new Date(r.dueAt).getTime() <= now);
}
