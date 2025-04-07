
export const getBackgroundStyle = (selectedColor: string, opacity: number) => {
  if (selectedColor.startsWith('linear-gradient')) {
    return { background: selectedColor };
  } else if (selectedColor.startsWith('url')) {
    return {
      backgroundImage: selectedColor,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else {
    // Regular color with opacity
    const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, "0");
    return { backgroundColor: `${selectedColor}${opacityHex}` };
  }
};
