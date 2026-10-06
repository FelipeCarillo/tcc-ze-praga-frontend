/**
 * Checagens de captura da folha (m-Camera / m-Chat-Foto), calculadas sobre
 * uma amostra pequena da imagem: brilho médio (luz), variância do laplaciano
 * (foco) e proporção de pixels verdes (folha na mira). Não identificam a
 * espécie — isso é do servidor (inspect_image).
 */

export const SAMPLE = 96;

export function analyzeFrame(data, size = SAMPLE) {
  let lum = 0;
  let green = 0;
  const gray = new Float32Array(size * size);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[p] = y;
    lum += y;
    if (g > r * 1.08 && g > b * 1.08 && g > 40) green++;
  }
  const n = size * size;
  // Variância do laplaciano: borda nítida = variância alta.
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let yy = 1; yy < size - 1; yy++) {
    for (let xx = 1; xx < size - 1; xx++) {
      const p = yy * size + xx;
      const lap =
        4 * gray[p] -
        gray[p - 1] -
        gray[p + 1] -
        gray[p - size] -
        gray[p + size];
      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }
  const mean = sum / count;
  const sharpness = sumSq / count - mean * mean;
  const brightness = lum / n;
  return {
    luz: brightness > 70 && brightness < 215,
    foco: sharpness > 60,
    folha: green / n > 0.3,
  };
}


/** Mesmas checagens para uma foto já pronta (galeria). Falha → null. */
export function checkImageFile(file, size = SAMPLE) {
  return new Promise((resolve) => {
    if (!file || typeof document === "undefined") return resolve(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        // Recorte central quadrado, como a mira da câmera.
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
        resolve(analyzeFrame(ctx.getImageData(0, 0, size, size).data, size));
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
