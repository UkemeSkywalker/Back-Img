import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TextElement } from '../types';

interface ImageCanvasProps {
  originalImage: string | null;
  maskImage: string | null;
  resultImage: string | null;
  textElements: TextElement[];
  activeTextId: string | null;
  onTextPositionChange: (id: string, x: number, y: number) => void;
  onTextSelect: (id: string) => void;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ 
  originalImage, 
  maskImage, 
  resultImage,
  textElements,
  activeTextId,
  onTextPositionChange,
  onTextSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTextId, setHoveredTextId] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTextId, setDraggedTextId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [, setInitialRotation] = useState(0);
  const [rotationCenter, setRotationCenter] = useState({ x: 0, y: 0 });

  // Helper function to convert percentage position to canvas pixels
  const percentToPixels = useCallback((percent: number, dimension: number) => {
    return (percent / 100) * dimension;
  }, []);

  // Helper function to convert canvas pixels to percentage position
  const pixelsToPercent = useCallback((pixels: number, dimension: number) => {
    return (pixels / dimension) * 100;
  }, []);

  // Function to draw text elements on canvas
  const drawTextElements = useCallback((ctx: CanvasRenderingContext2D, layer: 'behind' | 'ontop') => {
    const layerElements = textElements.filter(element => element.layer === layer);
    
    layerElements.forEach(element => {
      const { content, style, position, id } = element;
      
      // Calculate actual position in pixels
      const x = percentToPixels(position.x, canvasDimensions.width);
      const y = percentToPixels(position.y, canvasDimensions.height);
      
      // Save context state
      ctx.save();
      
      // Apply transformations
      ctx.translate(x, y);
      ctx.rotate((position.rotation * Math.PI) / 180);
      
      // Apply text styling
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
      ctx.fillStyle = style.color;
      ctx.globalAlpha = style.opacity / 100;
      
      // Apply text scaling
      ctx.scale(style.widthStretch / 100, style.heightStretch / 100);
      
      // Draw text (centered)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(content, 0, 0);
      
      // Draw selection indicator for active text
      if (id === activeTextId) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = isDragging && id === draggedTextId ? '#4ade80' : '#4a9eff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const textMetrics = ctx.measureText(content);
        const textWidth = textMetrics.width;
        const textHeight = style.fontSize;
        
        ctx.strokeRect(
          -textWidth / 2 - 10,
          -textHeight / 2 - 5,
          textWidth + 20,
          textHeight + 10
        );
        ctx.setLineDash([]);
      }
      
      // Draw hover indicator
      if (id === hoveredTextId && id !== activeTextId && !isDragging) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        
        const textMetrics = ctx.measureText(content);
        const textWidth = textMetrics.width;
        const textHeight = style.fontSize;
        
        ctx.strokeRect(
          -textWidth / 2 - 5,
          -textHeight / 2 - 3,
          textWidth + 10,
          textHeight + 6
        );
        ctx.setLineDash([]);
      }
      
      // Draw drag feedback
      if (isDragging && id === draggedTextId) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#4ade80';
        
        const textMetrics = ctx.measureText(content);
        const textWidth = textMetrics.width;
        const textHeight = style.fontSize;
        
        ctx.fillRect(
          -textWidth / 2 - 5,
          -textHeight / 2 - 3,
          textWidth + 10,
          textHeight + 6
        );
      }
      
      // Restore context state
      ctx.restore();
    });
  }, [textElements, activeTextId, hoveredTextId, canvasDimensions, percentToPixels, isDragging, draggedTextId]);

  // Helper function to get text element bounds
  const getTextElementBounds = useCallback((element: TextElement) => {
    const textX = percentToPixels(element.position.x, canvasDimensions.width);
    const textY = percentToPixels(element.position.y, canvasDimensions.height);
    const textWidth = element.style.fontSize * element.content.length * 0.6; // Rough estimate
    const textHeight = element.style.fontSize;
    
    return {
      x: textX,
      y: textY,
      width: textWidth,
      height: textHeight,
      left: textX - textWidth / 2,
      right: textX + textWidth / 2,
      top: textY - textHeight / 2,
      bottom: textY + textHeight / 2
    };
  }, [canvasDimensions, percentToPixels]);

  // Function to draw manipulation handles for selected text
  const drawManipulationHandles = useCallback((ctx: CanvasRenderingContext2D, element: TextElement) => {
    const bounds = getTextElementBounds(element);
    const handleSize = 8;
    const handleOffset = 15;
    
    ctx.save();
    
    // Draw resize handles
    const handles = [
      { x: bounds.left - handleOffset, y: bounds.top - handleOffset }, // nw
      { x: bounds.right + handleOffset, y: bounds.top - handleOffset }, // ne
      { x: bounds.left - handleOffset, y: bounds.bottom + handleOffset }, // sw
      { x: bounds.right + handleOffset, y: bounds.bottom + handleOffset } // se
    ];
    
    handles.forEach(handle => {
      ctx.fillStyle = '#4a9eff';
      ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
    
    // Draw rotation handle
    const rotationHandleY = bounds.top - 40;
    const rotationHandleX = bounds.x;
    
    // Draw line from text to rotation handle
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(bounds.x, bounds.top - 10);
    ctx.lineTo(rotationHandleX, rotationHandleY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw rotation handle circle
    ctx.fillStyle = '#4a9eff';
    ctx.beginPath();
    ctx.arc(rotationHandleX, rotationHandleY, handleSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(rotationHandleX, rotationHandleY, handleSize / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.restore();
  }, [getTextElementBounds]);

  // Main canvas rendering effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderCanvas = () => {
      if (resultImage) {
        // Show final result with text elements
        const img = new Image();
        img.onload = () => {
          // Clear canvas only when we're ready to draw
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          canvas.width = img.width;
          canvas.height = img.height;
          setCanvasDimensions({ width: img.width, height: img.height });
          
          ctx.drawImage(img, 0, 0);
          
          // Draw "ontop" text elements over the result
          drawTextElements(ctx, 'ontop');
          
          // Draw manipulation handles for active text element
          if (activeTextId) {
            const activeElement = textElements.find(el => el.id === activeTextId);
            if (activeElement) {
              drawManipulationHandles(ctx, activeElement);
            }
          }
        };
        img.src = resultImage;
      } else if (originalImage) {
        // Show original with text elements
        const img = new Image();
        img.onload = () => {
          // Clear canvas only when we're ready to draw
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          canvas.width = img.width;
          canvas.height = img.height;
          setCanvasDimensions({ width: img.width, height: img.height });
          
          // Draw "behind" text elements first
          drawTextElements(ctx, 'behind');
          
          // Draw the image
          if (maskImage) {
            // If we have a mask, use it to composite the image over behind text
            ctx.drawImage(img, 0, 0);
          } else {
            // No mask available, just draw the image
            ctx.drawImage(img, 0, 0);
          }
          
          // Draw "ontop" text elements over the image
          drawTextElements(ctx, 'ontop');
          
          // Draw manipulation handles for active text element
          if (activeTextId) {
            const activeElement = textElements.find(el => el.id === activeTextId);
            if (activeElement) {
              drawManipulationHandles(ctx, activeElement);
            }
          }
        };
        img.src = originalImage;
      } else {
        // No image to display, clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    renderCanvas();
  }, [originalImage, maskImage, resultImage]);

  // Separate effect for redrawing text elements and handles when they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasDimensions.width === 0 || canvasDimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Only redraw if we have an image loaded (canvas has dimensions)
    const redrawTextAndHandles = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Redraw the base image
      if (resultImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          
          // Draw "ontop" text elements over the result
          drawTextElements(ctx, 'ontop');
          
          // Draw manipulation handles for active text element
          if (activeTextId) {
            const activeElement = textElements.find(el => el.id === activeTextId);
            if (activeElement) {
              drawManipulationHandles(ctx, activeElement);
            }
          }
        };
        img.src = resultImage;
      } else if (originalImage) {
        const img = new Image();
        img.onload = () => {
          // Draw "behind" text elements first
          drawTextElements(ctx, 'behind');
          
          // Draw the image
          ctx.drawImage(img, 0, 0);
          
          // Draw "ontop" text elements over the image
          drawTextElements(ctx, 'ontop');
          
          // Draw manipulation handles for active text element
          if (activeTextId) {
            const activeElement = textElements.find(el => el.id === activeTextId);
            if (activeElement) {
              drawManipulationHandles(ctx, activeElement);
            }
          }
        };
        img.src = originalImage;
      }
    };

    redrawTextAndHandles();
  }, [textElements, activeTextId, hoveredTextId, canvasDimensions, drawTextElements, drawManipulationHandles, originalImage, resultImage]);

  // Helper function to check if point is inside text element
  const isPointInTextElement = useCallback((canvasX: number, canvasY: number, element: TextElement) => {
    const bounds = getTextElementBounds(element);
    return (
      canvasX >= bounds.left &&
      canvasX <= bounds.right &&
      canvasY >= bounds.top &&
      canvasY <= bounds.bottom
    );
  }, [getTextElementBounds]);

  // Helper function to check if point is on a resize handle
  const getResizeHandle = useCallback((canvasX: number, canvasY: number, element: TextElement) => {
    const bounds = getTextElementBounds(element);
    const handleSize = 8;
    const handleOffset = 15;
    
    // Define handle positions
    const handles = {
      nw: { x: bounds.left - handleOffset, y: bounds.top - handleOffset },
      ne: { x: bounds.right + handleOffset, y: bounds.top - handleOffset },
      sw: { x: bounds.left - handleOffset, y: bounds.bottom + handleOffset },
      se: { x: bounds.right + handleOffset, y: bounds.bottom + handleOffset }
    };
    
    // Check each handle
    for (const [handleName, handle] of Object.entries(handles)) {
      if (
        canvasX >= handle.x - handleSize / 2 &&
        canvasX <= handle.x + handleSize / 2 &&
        canvasY >= handle.y - handleSize / 2 &&
        canvasY <= handle.y + handleSize / 2
      ) {
        return handleName as 'nw' | 'ne' | 'sw' | 'se';
      }
    }
    
    return null;
  }, [getTextElementBounds]);

  // Helper function to check if point is on rotation handle
  const isPointOnRotationHandle = useCallback((canvasX: number, canvasY: number, element: TextElement) => {
    const bounds = getTextElementBounds(element);
    const rotationHandleY = bounds.top - 40;
    const rotationHandleX = bounds.x;
    const handleSize = 8;
    
    return (
      canvasX >= rotationHandleX - handleSize / 2 &&
      canvasX <= rotationHandleX + handleSize / 2 &&
      canvasY >= rotationHandleY - handleSize / 2 &&
      canvasY <= rotationHandleY + handleSize / 2
    );
  }, [getTextElementBounds]);

  // Mouse event handlers for text interaction
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to canvas coordinates
    const canvasX = (x / rect.width) * canvas.width;
    const canvasY = (y / rect.height) * canvas.height;

    // Handle dragging
    if (isDragging && draggedTextId) {
      // Calculate new position with drag offset
      const newX = pixelsToPercent(canvasX - dragOffset.x, canvasDimensions.width);
      const newY = pixelsToPercent(canvasY - dragOffset.y, canvasDimensions.height);
      
      // Apply position constraints (keep within canvas bounds)
      const constrainedX = Math.max(5, Math.min(95, newX));
      const constrainedY = Math.max(5, Math.min(95, newY));
      
      onTextPositionChange(draggedTextId, constrainedX, constrainedY);
      return;
    }

    // Handle resizing
    if (isResizing && draggedTextId && resizeHandle) {
      const element = textElements.find(el => el.id === draggedTextId);
      if (element) {
        const bounds = getTextElementBounds(element);
        let newWidthStretch = element.style.widthStretch;
        let newHeightStretch = element.style.heightStretch;
        
        // Calculate resize based on handle
        const deltaX = canvasX - bounds.x;
        const deltaY = canvasY - bounds.y;
        
        if (resizeHandle.includes('e')) { // east handles
          newWidthStretch = Math.max(20, element.style.widthStretch + (deltaX / bounds.width) * 100);
        }
        if (resizeHandle.includes('w')) { // west handles
          newWidthStretch = Math.max(20, element.style.widthStretch - (deltaX / bounds.width) * 100);
        }
        if (resizeHandle.includes('s')) { // south handles
          newHeightStretch = Math.max(20, element.style.heightStretch + (deltaY / bounds.height) * 100);
        }
        if (resizeHandle.includes('n')) { // north handles
          newHeightStretch = Math.max(20, element.style.heightStretch - (deltaY / bounds.height) * 100);
        }
        
        // Use a more generic update function since we don't have direct access to style updates
        // This is a simplified approach - in a real implementation, you'd want a more specific callback
        onTextPositionChange(draggedTextId, element.position.x, element.position.y);
      }
      return;
    }

    // Handle rotation
    if (isRotating && draggedTextId) {
      const element = textElements.find(el => el.id === draggedTextId);
      if (element) {
        // Update text element rotation (simplified - would need proper callback in real implementation)
        // For now, we'll just trigger a position change to cause a re-render
        onTextPositionChange(draggedTextId, element.position.x, element.position.y);
      }
      return;
    }

    // Check for interactions with active text element handles
    let cursorStyle = 'default';
    let foundHoveredText = null;
    
    if (activeTextId) {
      const activeElement = textElements.find(el => el.id === activeTextId);
      if (activeElement) {
        // Check for resize handles
        const handleType = getResizeHandle(canvasX, canvasY, activeElement);
        if (handleType) {
          const cursors = {
            nw: 'nw-resize',
            ne: 'ne-resize',
            sw: 'sw-resize',
            se: 'se-resize'
          };
          cursorStyle = cursors[handleType];
        }
        // Check for rotation handle
        else if (isPointOnRotationHandle(canvasX, canvasY, activeElement)) {
          cursorStyle = 'crosshair';
        }
        // Check if over the text element itself
        else if (isPointInTextElement(canvasX, canvasY, activeElement)) {
          cursorStyle = 'grab';
          foundHoveredText = activeElement.id;
        }
      }
    }
    
    // If not over active element handles, check other text elements
    if (!foundHoveredText && cursorStyle === 'default') {
      for (const element of textElements) {
        if (element.id !== activeTextId && isPointInTextElement(canvasX, canvasY, element)) {
          foundHoveredText = element.id;
          cursorStyle = 'pointer';
          break;
        }
      }
    }
    
    setHoveredTextId(foundHoveredText);
    
    // Apply cursor style
    if (isDragging || isResizing) {
      canvas.style.cursor = isDragging ? 'grabbing' : cursorStyle;
    } else if (isRotating) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = cursorStyle;
    }
  }, [textElements, canvasDimensions, pixelsToPercent, isDragging, draggedTextId, dragOffset, onTextPositionChange, isPointInTextElement, isResizing, resizeHandle, isRotating, getTextElementBounds, activeTextId, getResizeHandle, isPointOnRotationHandle]);

  const handleMouseLeave = useCallback(() => {
    setHoveredTextId(null);
    // Stop all interactions if mouse leaves canvas
    if (isDragging || isResizing || isRotating) {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      setDraggedTextId(null);
      setResizeHandle(null);
      setDragOffset({ x: 0, y: 0 });
      setInitialRotation(0);
      setRotationCenter({ x: 0, y: 0 });
    }
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
  }, [isDragging, isResizing, isRotating]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to canvas coordinates
    const canvasX = (x / rect.width) * canvas.width;
    const canvasY = (y / rect.height) * canvas.height;

    // Check if mouse down is on active text element handles first
    if (activeTextId) {
      const activeElement = textElements.find(el => el.id === activeTextId);
      if (activeElement) {
        // Check for resize handles
        const handleType = getResizeHandle(canvasX, canvasY, activeElement);
        if (handleType) {
          setIsResizing(true);
          setResizeHandle(handleType);
          setDraggedTextId(activeElement.id);
          return;
        }
        
        // Check for rotation handle
        if (isPointOnRotationHandle(canvasX, canvasY, activeElement)) {
          setIsRotating(true);
          setDraggedTextId(activeElement.id);
          setInitialRotation(activeElement.position.rotation);
          const bounds = getTextElementBounds(activeElement);
          setRotationCenter({ x: bounds.x, y: bounds.y });
          return;
        }
      }
    }

    // Check if mouse down is on any text element
    for (const element of textElements) {
      if (isPointInTextElement(canvasX, canvasY, element)) {
        // Select the text element
        onTextSelect(element.id);
        
        // Start dragging
        setIsDragging(true);
        setDraggedTextId(element.id);
        
        // Calculate drag offset (distance from mouse to text center)
        const textX = percentToPixels(element.position.x, canvasDimensions.width);
        const textY = percentToPixels(element.position.y, canvasDimensions.height);
        setDragOffset({
          x: canvasX - textX,
          y: canvasY - textY
        });
        
        return;
      }
    }
    
    // If no text was clicked, deselect
    onTextSelect('');
  }, [activeTextId, onTextSelect, textElements, getResizeHandle, isPointOnRotationHandle, getTextElementBounds, isPointInTextElement, percentToPixels, canvasDimensions.width, canvasDimensions.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setDraggedTextId(null);
    setResizeHandle(null);
    setDragOffset({ x: 0, y: 0 });
    setInitialRotation(0);
    setRotationCenter({ x: 0, y: 0 });
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle click if we weren't interacting
    if (isDragging || isResizing || isRotating) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to canvas coordinates
    const canvasX = (x / rect.width) * canvas.width;
    const canvasY = (y / rect.height) * canvas.height;

    // Check if click is on any text element
    for (const element of textElements) {
      if (isPointInTextElement(canvasX, canvasY, element)) {
        onTextSelect(element.id);
        return;
      }
    }
    
    // If no text was clicked, deselect
    onTextSelect('');
  }, [textElements, isDragging, isResizing, isRotating, onTextSelect, isPointInTextElement]);

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default ImageCanvas;