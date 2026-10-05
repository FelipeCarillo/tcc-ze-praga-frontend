jest.mock("react-router-dom", () => ({ Link: "a" }), { virtual: true });
jest.mock("../../config/runtime", () => ({ IS_DEMO: false }));
jest.mock("../../services/subscriptionService", () => ({ listPlans: jest.fn() }));
jest.mock("../../hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));
const { planFeatures } = require("../PlansPage");

test("recursos vêm dos dados do plano, sem nada inventado", () => {
  const free = planFeatures({
    name: "free",
    inference_daily_limit: 5,
    chat_daily_limit: 10,
    features: { diagnosis_models: ["resnet50"], action_plan_levels: ["essencial"], export_diagnoses: false, api_access: false },
  });
  expect(free).toEqual([
    "5 análises de foto por dia",
    "10 mensagens com o Zé por dia",
    "Modelo ResNet-50",
    "Plano de ação: essencial",
    "Histórico por talhão",
  ]);
});

test("plano sem limite e com tudo liberado", () => {
  const ent = planFeatures({
    name: "enterprise",
    inference_daily_limit: null,
    chat_daily_limit: null,
    features: { diagnosis_models: ["ensemble", "efficientnet", "vit"], action_plan_levels: ["essencial", "campo", "especialista"], export_diagnoses: true, api_access: true },
  });
  expect(ent).toContain("Análises de foto sem limite diário");
  expect(ent).toContain("Modelos Ensemble, EfficientNet-B4 e ViT-B/16");
  expect(ent).toContain("Plano de ação: essencial, no campo e especialista");
  expect(ent).toContain("Exportar laudos em PDF");
  expect(ent).toContain("Acesso à API por chave");
});
