jest.mock("../authService", () => ({ getCurrentUserId: () => "u-1" }));
const {
  addReminder,
  dueReminders,
  hasReminder,
  listReminders,
  removeReminder,
  REMINDERS_EVENT,
} = require("../reminders");

const DAY = 86400000;
const laudo = { id: "d1", disease: "Ferrugem", talhaoId: "t1", talhaoNome: "Sede" };

beforeEach(() => localStorage.clear());

test("lembrar em 7 dias guarda a data e o talhão do laudo", () => {
  const now = Date.UTC(2026, 9, 5);
  const r = addReminder(laudo, { now });
  expect(r).toMatchObject({ diagnosisId: "d1", talhaoNome: "Sede", disease: "Ferrugem" });
  expect(new Date(r.dueAt).getTime()).toBe(now + 7 * DAY);
  expect(hasReminder("d1")).toBe(true);
});

test("lembrar de novo o mesmo laudo só remarca, sem duplicar", () => {
  addReminder(laudo, { now: 0 });
  addReminder(laudo, { now: DAY });
  expect(listReminders()).toHaveLength(1);
});

test("vencidos são os de hoje para trás, do mais próximo ao mais distante", () => {
  addReminder({ ...laudo, id: "a" }, { now: 0, days: 1 });
  addReminder({ ...laudo, id: "b" }, { now: 0, days: 3 });
  addReminder({ ...laudo, id: "c" }, { now: 0, days: 10 });
  expect(dueReminders(5 * DAY).map((r) => r.id)).toEqual(["a", "b"]);
  expect(listReminders().map((r) => r.id)).toEqual(["a", "b", "c"]);
});

test("remover avisa a tela", () => {
  const seen = jest.fn();
  window.addEventListener(REMINDERS_EVENT, seen);
  addReminder(laudo);
  removeReminder("d1");
  expect(hasReminder("d1")).toBe(false);
  expect(seen).toHaveBeenCalledTimes(2);
  window.removeEventListener(REMINDERS_EVENT, seen);
});
