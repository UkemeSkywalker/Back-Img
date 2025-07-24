import React, { useState, useCallback } from 'react';
import ImageUploadArea from './ImageUpload';
import TextControls from './TextControls';
import CanvasEditor from './CanvasEditor';
import { generateMask, compositeImage } from '../services/api';
import { TextConfig, ImageData } from '../types';

const ImageEditor: React.FC = () => {
  const [imageData, setImageData] = useState<ImageData>({
    original: null,
    processed: null,
    mask: null,
    dimensions: null
  });
  
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
    <div className="editor-grid">
      <div>
        {!imageData.original ? (
          <ImageUploadArea onImageSelect={handleImageSelect} isLoading={isLoading} />
        ) : (
          <div>
            <CanvasEditor
              originalImage={originalImageUrl}
              maskImage={imageData.mask}
              resultImage={resultImageUrl}
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
                  }}
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {imageData.original && (
        <div className="controls-panel">
          <TextControls
            textConfig={textConfig}
            onChange={setTextConfig}
            onGenerate={handleGenerateImage}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default ImageEditor;