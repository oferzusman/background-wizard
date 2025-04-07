
import JSZip from "jszip";

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

export const applyBackgroundToCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string,
  opacity: number
) => {
  if (backgroundColor.startsWith('linear-gradient')) {
    const gradientString = backgroundColor;
    let gradientAngle = 0;
    
    // Parse the gradient string to extract angle
    const angleMatch = gradientString.match(/linear-gradient\((\d+)deg/);
    if (angleMatch && angleMatch[1]) {
      gradientAngle = parseInt(angleMatch[1], 10);
    } else if (gradientString.includes('to right')) {
      gradientAngle = 90;
    } else if (gradientString.includes('to left')) {
      gradientAngle = 270;
    } else if (gradientString.includes('to top')) {
      gradientAngle = 0;
    } else if (gradientString.includes('to bottom')) {
      gradientAngle = 180;
    }
    
    // Extract color stops
    const colorStopRegex = /(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))\s*(\d+%)?/gi;
    let match;
    let colorStops: {color: string, position: number}[] = [];
    
    while ((match = colorStopRegex.exec(gradientString)) !== null) {
      const color = match[1];
      let position = match[2] ? parseInt(match[2], 10) / 100 : null;
      
      if (position === null) {
        colorStops.push({ color, position: -1 }); // -1 is a placeholder
      } else {
        colorStops.push({ color, position });
      }
    }
    
    // Assign positions to stops without explicit positions
    const unpositionedStops = colorStops.filter(stop => stop.position === -1);
    if (unpositionedStops.length > 0) {
      const positionedCount = colorStops.length - unpositionedStops.length;
      const step = positionedCount > 0 ? 1 / (unpositionedStops.length + 1) : 1 / unpositionedStops.length;
      
      let current = 0;
      for (const stop of colorStops) {
        if (stop.position === -1) {
          current += step;
          stop.position = current;
        }
      }
    }
    
    // If no valid stops were found, fall back to a default gradient
    if (colorStops.length === 0) {
      colorStops = [{ color: '#ffffff', position: 0 }, { color: '#e2e2e2', position: 1 }];
    }
    
    // Convert angle to radians and calculate start/end points
    const angleRad = (angleMatch ? gradientAngle : 90) * Math.PI / 180;
    const startX = width / 2 - Math.cos(angleRad) * width;
    const startY = height / 2 - Math.sin(angleRad) * height;
    const endX = width / 2 + Math.cos(angleRad) * width;
    const endY = height / 2 + Math.sin(angleRad) * height;
    
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    
    // Add color stops to gradient
    colorStops.forEach(stop => {
      gradient.addColorStop(stop.position, stop.color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundColor.startsWith('url')) {
    try {
      // If it's a background image, we need to handle it separately
      // This would require loading the image first, then drawing it
      // This is handled asyncronously in the bulk download function
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } catch (err) {
      console.error('Error applying background image:', err);
      // Fallback to white if background image fails
      const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, "0");
      ctx.fillStyle = `#ffffff${opacityHex}`;
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    // If it's a solid color with opacity
    const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, "0");
    ctx.fillStyle = `${backgroundColor}${opacityHex}`;
    ctx.fillRect(0, 0, width, height);
  }
};

export const handleBulkDownloadWithBackground = async (
  selectedProducts: number[],
  products: ProductData[],
  selectedColor: string,
  opacity: number[],
  setIsDownloading: (value: boolean) => void
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
    
    // Create images folder
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
          // Fetch the transparent image
          const response = await fetch(product.processedImageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          
          // Create an image element from the blob
          const imageBlob = await response.blob();
          const img = new Image();
          const imgLoaded = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(imageBlob);
          });
          await imgLoaded;
          
          // Create a canvas to apply the background
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }
          
          // Apply the background based on type
          if (selectedColor.startsWith('url')) {
            try {
              // If it's a background image
              const bgImg = new Image();
              bgImg.crossOrigin = "anonymous";
              await new Promise((resolve, reject) => {
                bgImg.onload = resolve;
                bgImg.onerror = reject;
                bgImg.src = selectedColor.slice(4, -1).replace(/["']/g, '');
              });
              
              // Draw the background image stretched to fill canvas
              ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            } catch (err) {
              console.error('Error applying background image:', err);
              // Fallback to white if background image fails
              const opacityHex = Math.round(opacity[0] * 2.55).toString(16).padStart(2, "0");
              ctx.fillStyle = `#ffffff${opacityHex}`;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          } else {
            // For regular colors or gradients
            applyBackgroundToCanvas(ctx, canvas.width, canvas.height, selectedColor, opacity[0]);
          }
          
          // Draw the transparent image on top
          ctx.drawImage(img, 0, 0);
          
          // Convert canvas to blob
          const processedBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(blob => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to create image blob'));
            }, 'image/png');
          });
          
          console.log(`Successfully created image with background, size: ${processedBlob.size} bytes`);
          
          // Add the processed image blob to the zip
          imgFolder.file(filename, processedBlob);
          console.log(`Added ${filename} to zip folder`);
          
          // Cleanup
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
    
    // Add CSV file with product info
    zip.file("product_images.csv", csvContent);
    console.log('Added CSV to zip with content length:', csvContent.length);
    
    // Generate and download the zip file
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
