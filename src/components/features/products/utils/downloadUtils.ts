
import { applyBackgroundToCanvas } from "./backgroundUtils";

export const handleDownloadOriginal = (imageUrl: string, title: string) => {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = `${title}-processed.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const handleDownloadWithBackground = async (
  imageUrl: string,
  title: string,
  backgroundColor: string,
  opacity: number
) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    canvas.width = img.width;
    canvas.height = img.height;

    applyBackgroundToCanvas(ctx, canvas.width, canvas.height, backgroundColor, opacity);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}-with-background.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error creating image with background:', error);
    throw new Error('Failed to download image with background');
  }
};
