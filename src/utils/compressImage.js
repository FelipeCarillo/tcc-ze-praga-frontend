/**
 * Reduz a foto no próprio aparelho antes do upload.
 *
 * Foto de celular sai com 3–12 MB; o classificador usa 380 px e o gate de
 * visão usa a versão "low" da imagem. Mandar 1600 px em JPEG deixa o envio
 * várias vezes mais rápido no 4G do campo, economiza storage e mantém o
 * request abaixo do limite de 6 MB de payload do AWS Lambda.
 *
 * Qualquer falha (navegador sem createImageBitmap, HEIC, canvas indisponível)
 * devolve o arquivo original — comprimir é otimização, nunca bloqueio.
 */
export const MAX_SIDE = 1600;
export const JPEG_QUALITY = 0.85;
// Abaixo disso e já dentro do lado máximo, recomprimir não compensa.
const SKIP_BELOW_BYTES = 400 * 1024;

export async function compressImage(
  file,
  { maxSide = MAX_SIDE, quality = JPEG_QUALITY } = {},
) {
  if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type || "")) return file;
  if (
    typeof createImageBitmap !== "function" ||
    typeof document === "undefined"
  )
    return file;
  try {
    // "from-image" aplica a rotação do EXIF: foto em retrato chega em pé.
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
      bitmap.close?.();
      return file;
    }
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    // Fundo branco: PNG/WebP com transparência viraria preto no JPEG.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || blob.size >= file.size) return file;
    const name = (file.name || "foto").replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
