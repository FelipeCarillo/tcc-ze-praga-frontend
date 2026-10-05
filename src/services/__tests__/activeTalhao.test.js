jest.mock("../authService", () => ({ getCurrentUserId: () => "u-1" }));
const {
  getActiveTalhao,
  setActiveTalhao,
  ACTIVE_TALHAO_EVENT,
} = require("../activeTalhao");

beforeEach(() => localStorage.clear());

test("guarda o talhão ativo por usuário e avisa a tela", () => {
  const seen = jest.fn();
  window.addEventListener(ACTIVE_TALHAO_EVENT, seen);
  setActiveTalhao({ id: "t-1", nome: "Sede", extra: "ignorado" });
  expect(getActiveTalhao()).toEqual({ id: "t-1", nome: "Sede" });
  expect(localStorage.getItem("zepraga-talhao-ativo:u-1")).toContain("t-1");
  expect(seen).toHaveBeenCalledTimes(1);
  window.removeEventListener(ACTIVE_TALHAO_EVENT, seen);
});

test("null volta para sem talhão", () => {
  setActiveTalhao({ id: "t-1", nome: "Sede" });
  setActiveTalhao(null);
  expect(getActiveTalhao()).toBeNull();
});

test("valor corrompido no storage não quebra", () => {
  localStorage.setItem("zepraga-talhao-ativo:u-1", "{nao e json");
  expect(getActiveTalhao()).toBeNull();
});
