
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
        colorStops.push({ color, position: -1 });
      } else {
        colorStops.push({ color, position });
      }
    }
    
    if (colorStops.length === 0) {
      colorStops = [{ color: '#ffffff', position: 0 }, { color: '#e2e2e2', position: 1 }];
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
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } catch (err) {
      console.error('Error applying background image:', err);
      const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, "0");
      ctx.fillStyle = `#ffffff${opacityHex}`;
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, "0");
    ctx.fillStyle = `${backgroundColor}${opacityHex}`;
    ctx.fillRect(0, 0, width, height);
  }
};
