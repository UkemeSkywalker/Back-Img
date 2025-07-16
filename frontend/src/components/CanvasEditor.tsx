import React, { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText } from 'react-konva';
import { TextConfig } from '../types';
import Konva from 'konva';

interface CanvasEditorProps {
  originalImage: string | null;
  maskImage: string | null;
  resultImage: string | null;
  textConfig: TextConfig;
  onTextMove: (x: number, y: number) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ 
  originalImage, 
  maskImage, 
  resultImage,
  textConfig,
  onTextMove
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
  const [resultImg, setResultImg] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 });
  const [scale, setScale] = useState(1);

  const calculateSize = (imgWidth: number, imgHeight: number) => {
    const maxWidth = 600;
    const maxHeight = 400;
    const scaleX = maxWidth / imgWidth;
    const scaleY = maxHeight / imgHeight;
    const newScale = Math.min(scaleX, scaleY, 1);
    
    return {
      width: imgWidth * newScale,
      height: imgHeight * newScale,
      scale: newScale
    };
  };

  useEffect(() => {
    if (resultImage) {
      const img = new window.Image();
      img.onload = () => {
        setResultImg(img);
        const size = calculateSize(img.width, img.height);
        setStageSize({ width: size.width, height: size.height });
        setScale(size.scale);
      };
      img.src = resultImage;
    } else if (originalImage) {
      const img = new window.Image();
      img.onload = () => {
        setImage(img);
        const size = calculateSize(img.width, img.height);
        setStageSize({ width: size.width, height: size.height });
        setScale(size.scale);
      };
      img.src = originalImage;
    }
  }, [originalImage, resultImage]);

  useEffect(() => {
    if (maskImage) {
      const img = new window.Image();
      img.onload = () => {
        setMaskImg(img);
      };
      img.src = maskImage;
    }
  }, [maskImage]);

  const handleTextDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onTextMove(node.x() / scale, node.y() / scale);
  };

  return (
    <div className="canvas-container">
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {/* Background image */}
          {resultImg ? (
            <KonvaImage image={resultImg} scaleX={scale} scaleY={scale} />
          ) : image ? (
            <KonvaImage image={image} scaleX={scale} scaleY={scale} />
          ) : null}
          
          {/* Mask overlay */}
          {maskImg && !resultImg && (
            <KonvaImage 
              image={maskImg} 
              opacity={0.3}
              scaleX={scale} 
              scaleY={scale}
            />
          )}
          
          {/* Draggable text */}
          {!resultImg && (
            <KonvaText
              text={textConfig.text}
              x={textConfig.x * scale}
              y={textConfig.y * scale}
              fontSize={textConfig.fontSize * scale}
              fill={textConfig.color}
              fontFamily="Arial"
              draggable={true}
              onDragEnd={handleTextDragEnd}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEditor;