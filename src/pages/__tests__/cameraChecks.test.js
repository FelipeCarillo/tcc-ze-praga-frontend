// As checagens da câmera (luz, foco, folha na mira) são calculadas de verdade
// sobre os pixels; estes testes fixam o comportamento com imagens sintéticas.
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }), {
  virtual: true,
});
jest.mock("../../components/Talhao/TalhaoPicker", () => () => null);
const { analyzeFrame } = require("../CameraPage");

const SIZE = 96;
function frame(fn) {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b] = fn(x, y);
      const i = (y * SIZE + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  return data;
}

test("folha verde com textura: luz, foco e folha ok", () => {
  const leaf = frame((x, y) => ((x + y) % 4 < 2 ? [60, 150, 50] : [40, 110, 35]));
  expect(analyzeFrame(leaf, SIZE)).toEqual({ luz: true, foco: true, folha: true });
});

test("imagem escura falha na luz", () => {
  const dark = frame(() => [10, 20, 10]);
  expect(analyzeFrame(dark, SIZE).luz).toBe(false);
});

test("imagem lisa (borrada) falha no foco", () => {
  const flat = frame(() => [70, 140, 60]);
  expect(analyzeFrame(flat, SIZE).foco).toBe(false);
});

test("céu ou solo, sem verde, falha na folha", () => {
  const soil = frame((x) => (x % 2 ? [140, 90, 60] : [120, 80, 50]));
  expect(analyzeFrame(soil, SIZE).folha).toBe(false);
});
