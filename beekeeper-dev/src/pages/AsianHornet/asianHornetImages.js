export const MAX_ASIAN_HORNET_PHOTOS = 6;

async function loadHornetImage(file) {
  // createImageBitmap is fast and memory-efficient when the browser can
  // decode the selected image. Some Android/Chrome image-provider paths can
  // still reject otherwise valid photographs, so fall back to a normal
  // HTMLImageElement before treating the image as unreadable.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);

      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup() {
          bitmap.close?.();
        },
      };
    } catch (bitmapError) {
      console.warn(
        "Asian Hornet createImageBitmap decode failed; trying image-element fallback:",
        bitmapError
      );
    }
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();

      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new Error("The selected photograph could not be decoded."));

      element.src = objectUrl;
    });

    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error("The selected photograph has no readable image dimensions.");
    }

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup() {
        URL.revokeObjectURL(objectUrl);
      },
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);

    throw new Error(
      "This photograph could not be processed on this device. Please remove it and choose or take another photograph."
    );
  }
}

export async function compressHornetImage(
  file,
  {
    maxWidth = 2400,
    maxHeight = 2400,
    quality = 0.88,
  } = {}
) {
  const decoded = await loadHornetImage(file);

  try {
    const scale = Math.min(
      1,
      maxWidth / decoded.width,
      maxHeight / decoded.height
    );

    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to prepare the photograph.");
    }

    context.drawImage(decoded.source, 0, 0, width, height);

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
  } finally {
    decoded.cleanup();
  }
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
