import { allowedModelIds, defaultModelId } from "./diagnosisModels";

const free = { diagnosis_models: ["resnet50"] };
const pro = { diagnosis_models: ["resnet50", "efficientnet", "vit"] };

test("sem restrição de deploy, vale o plano", () => {
  expect([...allowedModelIds(pro, [])]).toEqual(["resnet50", "efficientnet", "vit"]);
  expect(defaultModelId(free, [])).toBe("resnet50");
});

test("deploy enxuto limita o seletor ao modelo carregado", () => {
  expect([...allowedModelIds(pro, ["efficientnet"])]).toEqual(["efficientnet"]);
  expect(defaultModelId(pro, ["efficientnet"])).toBe("efficientnet");
});

test("plano sem modelo carregado usa o do deploy, que é o que o servidor roda", () => {
  expect([...allowedModelIds(free, ["efficientnet"])]).toEqual(["efficientnet"]);
  expect(defaultModelId(free, ["efficientnet"])).toBe("efficientnet");
});
