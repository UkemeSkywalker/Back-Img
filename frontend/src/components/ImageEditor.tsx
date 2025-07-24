import React, { useState, useCallback } from 'react';
import ImageUploadArea from './ImageUpload';
import TextControls from './TextControls';
import CanvasEditor from './CanvasEditor';
import TextElementManager from './TextElementManager';
import LayerControls from './LayerControls';
import PositionControls from './PositionControls';
import { TextConfig, ImageData, TextElement, TextStyle } from '../types';

// Default text style for new text elements
const defaultTextStyle: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 48,
  fontWeight: 400,
  fontStyle: 'normal',
  color: '#FFFFFF',
  opacity: 100,
  widthStretch: 100,
  heightStretch: 100
};

// Text element ID generation system
const generateTextElementId = (): string => {
  return `text-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const ImageEditor: React.FC = () => {
  const [imageData, setImageData] = useState<ImageData>({
    original: null,
    processed: null,
    mask: null,
    dimensions: null
  });
  
  // Updated state management for multiple text elements
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  
  // Legacy textConfig for backward compatibility (will be removed later)
  const [textConfig, setTextConfig] = useState<TextConfig>({
    text: 'Sample Text',
    fontSize: 48,
    color: '#FFFFFF',
    x: 100,
    y: 100
  });

  const [isLoading, setIsLoading] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  // Text element CRUD operations
  const addTextElement = useCallback(() => {
    const newTextElement: TextElement = {
      id: generateTextElementId(),
      content: 'New Text',
      layer: 'ontop',
      style: { ...defaultTextStyle },
      position: {
        x: 50, // Center horizontally
        y: 50, // Center vertically
        rotation: 0
      }
    };
    
    setTextElements(prev => [...prev, newTextElement]);
    setActiveTextId(newTextElement.id);
  }, []);

  const removeTextElement = useCallback((id: string) => {
    setTextElements(prev => prev.filter(element => element.id !== id));
    
    // If the removed element was active, clear active selection or select another
    if (activeTextId === id) {
      const remainingElements = textElements.filter(element => element.id !== id);
      setActiveTextId(remainingElements.length > 0 ? remainingElements[0].id : null);
    }
  }, [activeTextId, textElements]);

  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => 
      prev.map(element => 
        element.id === id 
          ? { ...element, ...updates }
          : element
      )
    );
  }, []);

  const selectTextElement = useCallback((id: string) => {
    setActiveTextId(id);
  }, []);

  // Get the currently active text element (for future use)
  // const activeTextElement = textElements.find(element => element.id === activeTextId) || null;

  const handleImageSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setOriginalImageUrl(imageUrl);
      
      // Skip AI mask generation for now - just use the original image
      setImageData({
        original: file,
        processed: imageUrl,
        mask: null, // No mask for now
        dimensions: null
      });
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateImage = useCallback(async () => {
    if (!imageData.original) return;
    
    setIsLoading(true);
    try {
      // For now, just simulate processing and use the original image as result
      // This will be replaced with actual AI processing later
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      
      const resultUrl = originalImageUrl; // Use original image as placeholder result
      setResultImageUrl(resultUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [imageData, originalImageUrl]);

  const handleDownload = useCallback(() => {
    if (!resultImageUrl) return;
    
    const link = document.createElement('a');
    link.href = resultImageUrl;
    link.download = 'behind-text-image.png';
    link.click();
  }, [resultImageUrl]);

  return (
    <div className="editor-grid-three-column">
      <div className="canvas-section">
        {!imageData.original ? (
          <ImageUploadArea onImageSelect={handleImageSelect} isLoading={isLoading} />
        ) : (
          <div>
            <CanvasEditor
              originalImage={originalImageUrl}
              maskImage={imageData.mask}
              resultImage={resultImageUrl}
              // TODO: Add these props when CanvasEditor is updated in future tasks
              // textElements={textElements}
              // activeTextId={activeTextId}
              // onTextPositionChange={(id: string, x: number, y: number) => {
              //   updateTextElement(id, {
              //     position: {
              //       ...textElements.find(el => el.id === id)?.position || { x: 0, y: 0, rotation: 0 },
              //       x,
              //       y
              //     }
              //   });
              // }}
              // onTextSelect={selectTextElement}
            />
            {resultImageUrl && (
              <div className="action-buttons">
                <button className="download-btn" onClick={handleDownload}>
                  Download Result
                </button>
                <button 
                  className="reset-btn"
                  onClick={() => {
                    setImageData({ original: null, processed: null, mask: null, dimensions: null });
                    setOriginalImageUrl(null);
                    setResultImageUrl(null);
                    setTextElements([]);
                    setActiveTextId(null);
                  }}
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="text-controls-panel">
        <TextElementManager
          textElements={textElements}
          activeTextId={activeTextId}
          onTextAdd={addTextElement}
          onTextRemove={removeTextElement}
          onTextSelect={selectTextElement}
        />
        
        <TextControls
          textElements={textElements}
          activeTextId={activeTextId}
          onTextUpdate={updateTextElement}
          isLoading={isLoading}
          hasImage={!!imageData.original}
        />
      </div>
      
      <div className="layout-controls-panel">
        <LayerControls
          textElements={textElements}
          activeTextId={activeTextId}
          onTextUpdate={updateTextElement}
          isLoading={isLoading}
        />
        
        <PositionControls
          textElements={textElements}
          activeTextId={activeTextId}
          onTextUpdate={updateTextElement}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ImageEditor;