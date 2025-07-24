import React, { useCallback, useState } from 'react';

interface ImageUploadAreaProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({ onImageSelect, isLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      // Check file type - supporting PNG, JPG, GIF as per requirements 2.1, 2.2
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      
      const fileName = file.name.toLowerCase();
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!validTypes.includes(file.type) && !hasValidExtension) {
        resolve('Unsupported file format. Please select a PNG, JPG, or GIF image.');
        return;
      }

      // Check file size (5MB limit as per requirements 2.1, 2.2)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        resolve(`File too large (${fileSizeMB}MB). Maximum size is 5MB.`);
        return;
      }

      // Check minimum dimensions to ensure it's a valid image
      const img = new Image();
      img.onload = () => {
        if (img.width < 50 || img.height < 50) {
          resolve('Image too small. Minimum size is 50x50 pixels.');
        } else {
          resolve(null);
        }
      };
      img.onerror = () => {
        resolve('Invalid image file. Please select a valid image.');
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const validationError = await validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      onImageSelect(file);
    } catch (error) {
      setError('Error validating file. Please try again.');
    }
  }, [onImageSelect]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    // Only set drag over to false if we're leaving the upload area entirely
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    // Check if mouse is outside the element bounds
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isLoading) {
        document.getElementById('image-upload-input')?.click();
      }
    }
  }, [isLoading]);

  const UploadIcon = () => (
    <svg 
      width="80" 
      height="80" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="upload-icon"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );

  const LoadingSpinner = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="loading-spinner"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="error-icon"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );

  return (
    <div className="image-upload-area-container">
      <div 
        className={`image-upload-area ${isDragOver ? 'drag-over' : ''} ${error ? 'error' : ''} ${isLoading ? 'loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Upload image area - click to select or drag and drop an image file"
        onKeyDown={handleKeyDown}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          onChange={handleFileChange}
          className="upload-input"
          id="image-upload-input"
          disabled={isLoading}
          aria-label="Upload image file"
        />
        <label htmlFor="image-upload-input" className="upload-label">
          {isLoading ? (
            <div className="upload-content loading-content">
              <LoadingSpinner />
              <h3 className="upload-title">Processing Image...</h3>
              <p className="upload-description">
                Generating AI mask for background separation
              </p>
            </div>
          ) : (
            <div className="upload-content">
              <UploadIcon />
              <h3 className="upload-title">
                {isDragOver ? 'Drop your image here' : 'Click to upload an image'}
              </h3>
              <p className="upload-description">
                {isDragOver ? 'Release to upload' : 'or drag and drop'}
              </p>
              <div className="upload-formats">
                <span className="format-text">Supports:</span>
                <span className="format-list">PNG, JPG, GIF up to 5MB</span>
              </div>
            </div>
          )}
        </label>
        
        {/* Drag overlay for enhanced visual feedback */}
        {isDragOver && (
          <div className="drag-overlay">
            <div className="drag-overlay-content">
              <div className="drag-icon-container">
                <UploadIcon />
                <div className="drag-pulse"></div>
              </div>
              <h3 className="drag-title">Drop your image here</h3>
              <p className="drag-subtitle">Release to upload</p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="upload-error">
          <ErrorIcon />
          <span className="error-message">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploadArea;