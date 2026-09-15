import { MAX_IMAGE_BYTES, validateImage } from "./imageUpload";
test("rejeita formato inválido, vazio e imagem acima do limite", () => {
  expect(
    validateImage(new File(["x"], "a.svg", { type: "image/svg+xml" })),
  ).toMatch("JPG");
  expect(validateImage(new File([], "a.jpg", { type: "image/jpeg" }))).toMatch(
    "vazio",
  );
  expect(
    validateImage({ type: "image/png", size: MAX_IMAGE_BYTES + 1 }),
  ).toMatch("10 MB");
});
test("aceita formatos documentados e limite exato", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"])
    expect(validateImage({ type, size: MAX_IMAGE_BYTES })).toBe("");
});
