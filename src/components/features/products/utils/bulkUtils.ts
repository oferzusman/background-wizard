
import JSZip from "jszip";
import { ProductData } from "@/types/product.types";
import { applyBackgroundToCanvas } from "./backgroundUtils";

export const handleBulkDownloadWithBackground = async (
  selectedProducts: number[],
  products: ProductData[],
  selectedColor: string,
  opacity: number[],
  setIsDownloading: (value: boolean) => void,
  topPadding = 40,
  bottomPadding = 40
) => {
  if (selectedProducts.length === 0) {
    throw new Error("Please select products first");
  }

  setIsDownloading(true);
  let successCount = 0;
  let errorCount = 0;
  
  try {
    console.log('Starting bulk download process');
    const zip = new JSZip();
    
    const imgFolder = zip.folder("images");
    if (!imgFolder) {
      throw new Error("Failed to create images folder in zip");
    }
    
    let csvContent = "product_id,title,filename\n";
    
    console.log(`Starting to process ${selectedProducts.length} images for download`);
    
    for (const index of selectedProducts) {
      try {
        const product = products[index];
        if (!product.processedImageUrl) {
          console.log(`Skipping product at index ${index} - no processed image`);
          continue;
        }
        
        console.log(`Processing product: ${product.title} at index ${index}`);
        
        const productId = product.id || `item-${index}`;
        const filename = `${productId}.png`;
        console.log(`Generated filename: ${filename}`);
        
        csvContent += `${productId},"${product.title}",images/${filename}\n`;
        
        try {
          const response = await fetch(product.processedImageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          
          const imageBlob = await response.blob();
          const img = new Image();
          const imgLoaded = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(imageBlob);
          });
          await imgLoaded;
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height + topPadding + bottomPadding;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }
          
          if (selectedColor.startsWith('url')) {
            try {
              const bgImg = new Image();
              bgImg.crossOrigin = "anonymous";
              await new Promise((resolve, reject) => {
                bgImg.onload = resolve;
                bgImg.onerror = reject;
                bgImg.src = selectedColor.slice(4, -1).replace(/["']/g, '');
              });
              
              ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            } catch (err) {
              console.error('Error applying background image:', err);
              const opacityHex = Math.round(opacity[0] * 2.55).toString(16).padStart(2, "0");
              ctx.fillStyle = `#ffffff${opacityHex}`;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          } else {
            applyBackgroundToCanvas(ctx, canvas.width, canvas.height, selectedColor, opacity[0]);
          }
          
          // Draw the image with top padding
          ctx.drawImage(img, 0, topPadding);
          
          const processedBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(blob => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to create image blob'));
            }, 'image/png');
          });
          
          console.log(`Successfully created image with background, size: ${processedBlob.size} bytes`);
          
          imgFolder.file(filename, processedBlob);
          console.log(`Added ${filename} to zip folder`);
          
          URL.revokeObjectURL(img.src);
          successCount++;
        } catch (error) {
          console.error(`Error processing image at index ${index}:`, error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing product at index ${index}:`, error);
        errorCount++;
      }
    }
    
    zip.file("product_images.csv", csvContent);
    console.log('Added CSV to zip with content length:', csvContent.length);
    
    const zipBlob = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6
      }
    });
    console.log(`Generated ZIP blob of size: ${zipBlob.size} bytes`);
    
    if (zipBlob.size === 0) {
      throw new Error("Generated ZIP file is empty");
    }
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = "product_images.zip";
    document.body.appendChild(link);
    console.log('Starting download...');
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    return { successCount, errorCount };
  } catch (error) {
    console.error('Error creating bulk download:', error);
    throw error;
  } finally {
    setIsDownloading(false);
  }
};
