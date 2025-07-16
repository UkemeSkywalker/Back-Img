import React, { useState, useCallback } from 'react';
import ImageUpload from './ImageUpload';
import TextControls from './TextControls';
import CanvasEditor from './CanvasEditor';
import { generateMask, compositeImage } from '../services/api';
import { TextConfig, ImageData } from '../types';

const ImageEditor: React.FC = () => {
  const [imageData, setImageData] = useState<ImageData>({
    original: null,
    mask: null,
    preview: null
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
      
      // Generate mask
      const maskBlob = await generateMask(file);
      const maskUrl = URL.createObjectURL(maskBlob);
      
      setImageData({
        original: file,
        mask: maskUrl,
        preview: imageUrl
      });
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateImage = useCallback(async () => {
    if (!imageData.original || !imageData.mask) return;
    
    setIsLoading(true);
    try {
      const maskResponse = await fetch(imageData.mask);
      const maskBlob = await maskResponse.blob();
      
      const resultBlob = await compositeImage(imageData.original, maskBlob, textConfig);
      const resultUrl = URL.createObjectURL(resultBlob);
      
      setResultImageUrl(resultUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [imageData, textConfig]);

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
          <ImageUpload onImageSelect={handleImageSelect} isLoading={isLoading} />
        ) : (
          <div>
            <CanvasEditor
              originalImage={originalImageUrl}
              maskImage={imageData.mask}
              resultImage={resultImageUrl}
              textConfig={textConfig}
              onTextMove={(x, y) => setTextConfig(prev => ({ ...prev, x, y }))}
            />
            {resultImageUrl && (
              <div className="action-buttons">
                <button className="download-btn" onClick={handleDownload}>
                  Download Result
                </button>
                <button 
                  className="reset-btn"
                  onClick={() => {
                    setImageData({ original: null, mask: null, preview: null });
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