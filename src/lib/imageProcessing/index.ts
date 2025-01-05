export const removeBackground = async (image: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process with Stability AI...');
    
    // Create canvas and get image data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Set canvas dimensions to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Draw image to canvas
    ctx.drawImage(image, 0, 0);
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png'
      );
    });

    // Create FormData with the image blob
    const formData = new FormData();
    formData.append('image', blob);
    formData.append('output_format', 'png');

    console.log('Calling Stability AI API...');
    const response = await fetch(
      'https://kxyoayirtfroywgbecwx.supabase.co/functions/v1/remove-background',
      {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: image.src
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability AI API error:', response.status, errorText);
      throw new Error(`Failed to remove background: ${errorText}`);
    }

    const processedImageBlob = await response.blob();
    console.log('Successfully received processed image from Stability AI');
    return processedImageBlob;
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};