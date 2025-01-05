export const createBinaryMask = (
  segmentationResult: any,
  width: number,
  height: number
): Uint8ClampedArray => {
  console.log('Creating binary mask from segmentation result...');
  const mask = new Uint8ClampedArray(width * height);

  for (let i = 0; i < segmentationResult.length; i++) {
    const segment = segmentationResult[i];
    if (segment.label === 'background') {
      const segmentMask = segment.mask;
      for (let j = 0; j < mask.length; j++) {
        if (segmentMask[j] === 1) {
          mask[j] = 0;
        } else {
          mask[j] = 255;
        }
      }
    }
  }

  return mask;
};