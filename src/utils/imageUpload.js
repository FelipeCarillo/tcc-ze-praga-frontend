export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export function validateImage(file) {
  if (!file) return "Escolha uma foto para continuar.";
  if (!IMAGE_ACCEPT.split(",").includes(file.type))
    return "Use uma foto JPG, PNG ou WebP.";
  if (file.size > MAX_IMAGE_BYTES)
    return "A foto precisa ter até 10 MB. Escolha uma versão menor.";
  if (!file.size) return "Este arquivo está vazio. Escolha outra foto.";
  return "";
}
