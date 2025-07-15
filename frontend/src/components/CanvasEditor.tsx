import React, { useEffect, useRef } from 'react';

interface CanvasEditorProps {
  originalImage: string | null;
  maskImage: string | null;
  resultImage: string | null;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ 
  originalImage, 
  maskImage, 
  resultImage 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (resultImage) {
      // Show final result
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = resultImage;
    } else if (originalImage && maskImage) {
      // Show original with mask overlay
      const original = new Image();
      original.onload = () => {
        canvas.width = original.width;
        canvas.height = original.height;
        ctx.drawImage(original, 0, 0);

        const mask = new Image();
        mask.onload = () => {
          ctx.globalAlpha = 0.5;
          ctx.drawImage(mask, 0, 0);
          ctx.globalAlpha = 1.0;
        };
        mask.src = maskImage;
      };
      original.src = originalImage;
    } else if (originalImage) {
      // Show original only
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = originalImage;
    }
  }, [originalImage, maskImage, resultImage]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CanvasEditor;