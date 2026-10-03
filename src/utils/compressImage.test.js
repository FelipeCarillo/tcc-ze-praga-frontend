import { compressImage, MAX_SIDE } from "./compressImage";

const realCreateImageBitmap = global.createImageBitmap;
const realCreateElement = document.createElement.bind(document);

function fakeCanvas(blobSize) {
  return {
    width: 0,
    height: 0,
    getContext: () => ({ fillRect: jest.fn(), drawImage: jest.fn(), fillStyle: "" }),
    toBlob: (cb) => cb(new Blob([new Uint8Array(blobSize)], { type: "image/jpeg" })),
  };
}

function setup({ width, height, blobSize }) {
  const canvas = fakeCanvas(blobSize);
  global.createImageBitmap = jest.fn().mockResolvedValue({ width, height, close: jest.fn() });
  jest
    .spyOn(document, "createElement")
    .mockImplementation((tag) => (tag === "canvas" ? canvas : realCreateElement(tag)));
  return canvas;
}

afterEach(() => {
  global.createImageBitmap = realCreateImageBitmap;
  jest.restoreAllMocks();
});

const photo = (bytes, type = "image/jpeg", name = "folha.jpeg") =>
  new File([new Uint8Array(bytes)], name, { type });

test("sem createImageBitmap devolve o arquivo original", async () => {
  global.createImageBitmap = undefined;
  const file = photo(5_000_000);
  expect(await compressImage(file)).toBe(file);
});

test("reduz foto grande para o lado máximo em JPEG", async () => {
  const canvas = setup({ width: 4000, height: 3000, blobSize: 300_000 });
  const out = await compressImage(photo(6_000_000, "image/png", "folha.png"));
  expect(canvas.width).toBe(MAX_SIDE);
  expect(canvas.height).toBe(1200);
  expect(out.type).toBe("image/jpeg");
  expect(out.name).toBe("folha.jpg");
  expect(out.size).toBe(300_000);
});

test("foto pequena e dentro do limite não é recomprimida", async () => {
  setup({ width: 800, height: 600, blobSize: 10 });
  const file = photo(100_000);
  expect(await compressImage(file)).toBe(file);
});

test("se o JPEG ficar maior que o original, mantém o original", async () => {
  setup({ width: 3000, height: 3000, blobSize: 900_000 });
  const file = photo(800_000);
  expect(await compressImage(file)).toBe(file);
});

test("erro ao decodificar (ex.: HEIC) devolve o original", async () => {
  global.createImageBitmap = jest.fn().mockRejectedValue(new Error("formato"));
  const file = photo(5_000_000);
  expect(await compressImage(file)).toBe(file);
});
