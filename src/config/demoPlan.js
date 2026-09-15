export function demoPlan(name = "free") {
  const pro = name !== "free",
    enterprise = name === "enterprise";
  return {
    name,
    display_name: enterprise ? "Enterprise" : pro ? "Pro" : "Gratuito",
    features: {
      tier_name: name,
      diagnosis_models: enterprise
        ? ["resnet50", "efficientnet", "vit", "ensemble"]
        : pro
          ? ["resnet50", "efficientnet", "vit"]
          : ["resnet50"],
      action_plan_levels: enterprise
        ? ["essencial", "campo", "especialista"]
        : pro
          ? ["essencial", "campo"]
          : ["essencial"],
      search_web: pro,
      search_scientific: enterprise,
      identify_crop_auto: enterprise,
      api_access: enterprise,
      export_diagnoses: pro,
      multi_account: enterprise,
    },
  };
}
