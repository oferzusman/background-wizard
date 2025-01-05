import { initializeSegmenter, getSegmenter } from './pipeline';
import { createCanvas, drawImageOnCanvas, getImageData, createMaskedImage } from './canvas';
import { createBinaryMask } from './mask';

export const removeBackground = async (image: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    // Initialize the segmentation model
    await initializeSegmenter();
    const segmenter = getSegmenter();

    // Create canvas and get image data
    const canvas = createCanvas(image.width, image.height);
    const ctx = drawImageOnCanvas(canvas, image);
    
    // Instead of using ImageData, we'll pass the canvas directly
    // The segmenter will handle the conversion internally
    console.log('Processing with segmentation model...');
    const result = await segmenter(canvas, {
      threshold: 0.5,
    });
    
    console.log('Segmentation result:', result);

    // Create and apply binary mask
    const mask = createBinaryMask(result, canvas.width, canvas.height);
    const maskedCanvas = createMaskedImage(canvas, mask);

    // Convert to blob
    return new Promise((resolve, reject) => {
      maskedCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Background removal completed successfully');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/png'
      );
    });
  } catch (error) {
    console.error('Error in removeBackground:', error);
    throw error;
  }
};