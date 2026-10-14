/** Optimises NEW user uploads only. Never alters existing Storage objects. */
export async function optimisePhotoUpload(file, { maxDimension = 1920, quality = 0.85 } = {}) {
  if (!(file instanceof Blob)) throw new Error("No photograph was selected.");
  // Non-standard formats require a separate explicit conversion workflow.
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
  const image = await (async () => {
    if (typeof createImageBitmap === "function") {
      try {
        const bitmap = await createImageBitmap(file);
        return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
      } catch { /* Fall back to Image element for older mobile browsers. */ }
    }
    const url = URL.createObjectURL(file);
    try {
      const element = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Unable to read photograph."));
        img.src = url;
      });
      return { source: element, width: element.naturalWidth, height: element.naturalHeight, close: () => URL.revokeObjectURL(url) };
    } catch (error) { URL.revokeObjectURL(url); throw error; }
  })();
  try {
    if (!image.width || !image.height) throw new Error("Invalid photograph dimensions.");
    // Preserve transparent PNGs and avoid unnecessary re-encoding of already small JPEGs.
    // JPEG-only conversion is deliberate; opaque PNGs may become significantly smaller.
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    if (file.type === "image/jpeg" && scale === 1 && file.size <= 500 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: file.type === "image/png" });
    if (!ctx) throw new Error("Cannot prepare photograph on this device.");
    ctx.drawImage(image.source, 0, 0, canvas.width, canvas.height);
    if (file.type === "image/png") {
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] < 255) return file;
    }
    const blob = await new Promise((resolve, reject) => canvas.toBlob(
      result => result ? resolve(result) : reject(new Error("Photograph optimisation failed.")),
      "image/jpeg", quality
    ));
    if (blob.size >= file.size) return file;
    const base = (file.name || "photograph").replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: file.lastModified || Date.now() });
  } finally { image.close(); }
}
