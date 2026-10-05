jest.mock("../../../services/sessionsService", () => ({ listSessions: jest.fn() }));
const { groupSessions } = require("../SessionsList");

test("agrupa as conversas por quando aconteceram", () => {
  const now = new Date("2026-10-05T15:00:00").getTime();
  const groups = groupSessions(
    [
      { id: "a", updatedAt: "2026-10-05T09:00:00" },
      { id: "b", updatedAt: "2026-10-02T09:00:00" },
      { id: "c", updatedAt: "2026-09-01T09:00:00" },
      { id: "d", createdAt: "2026-10-05T08:00:00" },
    ],
    now,
  );
  expect(groups.map((g) => [g.label, g.items.map((s) => s.id)])).toEqual([
    ["Hoje", ["a", "d"]],
    ["Últimos 7 dias", ["b"]],
    ["Antes", ["c"]],
  ]);
});

test("grupos vazios não aparecem", () => {
  const now = Date.now();
  expect(groupSessions([{ id: "a", updatedAt: new Date(now).toISOString() }], now).map((g) => g.label)).toEqual(["Hoje"]);
});
