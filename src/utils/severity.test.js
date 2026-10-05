import { riskOf, riskTrend } from "./severity";

// O campo severity é o risco da doença, não a gravidade da lesão: os rótulos
// precisam falar em risco.
test("rótulos falam em risco, não em gravidade", () => {
  expect(riskOf("alta").label).toBe("Risco alto");
  expect(riskOf("nenhuma").label).toBe("Saudável");
  expect(riskOf("??").label).toBe("Sem classificação");
});

test("tendência compara a leitura mais antiga com a mais recente", () => {
  expect(riskTrend(["nenhuma", "media", "alta"]).key).toBe("subindo");
  expect(riskTrend(["alta", "baixa"]).key).toBe("caindo");
  expect(riskTrend(["media", "alta", "media"]).key).toBe("estavel");
});

test("sem duas leituras conhecidas não há tendência", () => {
  expect(riskTrend([])).toBeNull();
  expect(riskTrend(["alta"])).toBeNull();
  expect(riskTrend(["alta", "desconhecida"])).toBeNull();
});
