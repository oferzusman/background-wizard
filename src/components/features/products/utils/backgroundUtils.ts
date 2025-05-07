
import { ProductData } from "@/types/product.types";

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
    
    let match;
    let colorStops: {color: string, position: number}[] = [];
    
    const colorStopRegex = /(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))\s*(\d+%)?/gi;
    while ((match = colorStopRegex.exec(gradientString)) !== null) {
      const color = match[1];
      let position = match[2] ? parseInt(match[2], 10) / 100 : null;
      
      if (position === null) {
        // If no position is specified, we need to calculate it based on the position in the array
        if (colorStops.length === 0) {
          position = 0; // First color starts at 0
        } else if (match === colorStopRegex.lastMatch) {
          position = 1; // Last color ends at 1
        } else {
          position = colorStops.length / (colorStopRegex.exec.length - 1);
        }
      }
      
      colorStops.push({ color, position: position as number });
    }
    
    if (colorStops.length === 0) {
      colorStops = [{ color: '#ffffff', position: 0 }, { color: '#e2e2e2', position: 1 }];
    } else if (colorStops.length === 1) {
      // If only one color stop is found, add a second one
      colorStops.push({ color: colorStops[0].color, position: 1 });
    }
    
    const angleRad = (angleMatch ? gradientAngle : 90) * Math.PI / 180;
    const startX = width / 2 - Math.cos(angleRad) * width;
    const startY = height / 2 - Math.sin(angleRad) * height;
    const endX = width / 2 + Math.cos(angleRad) * width;
    const endY = height / 2 + Math.sin(angleRad) * height;
    
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    
    colorStops.forEach(stop => {
      gradient.addColorStop(stop.position, stop.color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundColor.startsWith('url')) {
    try {
      // For image backgrounds, we'll use a white background as fallback
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // We could potentially load the image and use it as background,
      // but for simplicity we'll just use a white background
    } catch (err) {
      console.error('Error applying background image:', err);
      const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, "0");
      ctx.fillStyle = `#ffffff${opacityHex}`;
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    // For regular colors, ensure opacity is applied correctly
    // Convert opacity from percentage (0-100) to hex (00-FF)
    const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, "0");
    ctx.fillStyle = `${backgroundColor}${opacityHex}`;
    ctx.fillRect(0, 0, width, height);
  }
};
