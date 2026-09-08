// Miniatura local para a demonstração: evita persistir URLs blob que expiram.
export function demoImagePreview(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file),
      img = new Image();
    img.onload = () => {
      try {
        const ratio = Math.min(1, 800 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível abrir esta foto."));
    };
    img.src = url;
  });
}
