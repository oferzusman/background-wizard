export const createBinaryMask = (
  segmentationResult: any,
  width: number,
  height: number
): Uint8ClampedArray => {
  console.log('Creating binary mask from segmentation result...');
  const mask = new Uint8ClampedArray(width * height);

  if (!segmentationResult || !Array.isArray(segmentationResult) || segmentationResult.length === 0) {
    throw new Error('Invalid segmentation result');
  }

  const maskData = segmentationResult[0].mask;
  if (!maskData || !maskData.data) {
    throw new Error('Invalid mask data in segmentation result');
  }

  for (let i = 0; i < maskData.data.length; i++) {
    // Invert the mask value to keep the foreground
    mask[i] = Math.round((1 - maskData.data[i]) * 255);
  }

  return mask;
};
