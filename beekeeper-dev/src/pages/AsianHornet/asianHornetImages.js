export const MAX_ASIAN_HORNET_PHOTOS = 6;

export async function compressHornetImage(
  file,
  {
    maxWidth = 2400,
    maxHeight = 2400,
    quality = 0.88,
  } = {}
) {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(
    1,
    maxWidth / bitmap.width,
    maxHeight / bitmap.height
  );

  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  context.drawImage(bitmap, 0, 0, width, height);

  bitmap.close?.();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Unable to process photograph."));
      },
      "image/jpeg",
      quality
    );
  });

  return blob;
}

export async function createReportingCopy(file) {
  let quality = 0.82;
  let maxDimension = 1800;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const blob = await compressHornetImage(file, {
      maxWidth: maxDimension,
      maxHeight: maxDimension,
      quality,
    });

    if (blob.size <= 950 * 1024) {
      return blob;
    }

    quality -= 0.1;
    maxDimension -= 200;
  }

  return compressHornetImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.62,
  });
}

export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}