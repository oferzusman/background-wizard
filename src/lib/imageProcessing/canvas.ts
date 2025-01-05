export const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const drawImageOnCanvas = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return ctx;
};

export const getImageData = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  return ctx.getImageData(0, 0, width, height);
};

export const createMaskedImage = (
  canvas: HTMLCanvasElement,
  mask: Uint8ClampedArray
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < mask.length; i++) {
    const pixelIndex = i * 4 + 3;
    data[pixelIndex] = mask[i];
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};