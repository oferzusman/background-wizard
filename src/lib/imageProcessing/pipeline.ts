import { pipeline } from "@huggingface/transformers";
import { ImageSegmentationPipeline } from "@huggingface/transformers";

let segmenter: ImageSegmentationPipeline | null = null;

export const initializeSegmenter = async () => {
  if (!segmenter) {
    console.log('Initializing segmentation model...');
    segmenter = await pipeline("image-segmentation", "Xenova/segformer-b2-finetuned-ade-512-512");
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