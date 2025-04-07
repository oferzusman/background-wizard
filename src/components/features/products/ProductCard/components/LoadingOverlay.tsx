
import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );
};
