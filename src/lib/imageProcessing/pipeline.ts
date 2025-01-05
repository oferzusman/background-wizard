import { pipeline } from "@huggingface/transformers";
import type { ImageSegmentationPipeline } from "@huggingface/transformers";

let segmenter: ImageSegmentationPipeline | null = null;

export const initializeSegmenter = async () => {
  if (!segmenter) {
    console.log('Initializing segmentation model...');
    segmenter = await pipeline("image-segmentation", "Xenova/segformer-b0-finetuned-ade-512-512", {
      device: 'webgpu',
    });
    console.log('Segmentation model initialized');
  }
  return segmenter;
};

export const getSegmenter = () => {
  if (!segmenter) {
    throw new Error('Segmenter not initialized');
  }
  return segmenter;
};