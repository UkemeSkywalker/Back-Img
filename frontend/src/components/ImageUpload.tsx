import React, { useCallback } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, isLoading }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div 
      className="upload-area"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-input"
        disabled={isLoading}
      />
      <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
        {isLoading ? (
          <div>
            <h3>Processing...</h3>
            <p>Generating mask with AI segmentation</p>
          </div>
        ) : (
          <div>
            <h3>Drop an image here or click to select</h3>
            <p style={{ fontSize: '16px', color: '#666', marginTop: '10px' }}>
              Supports JPEG and PNG files up to 10MB
            </p>
          </div>
        )}
      </label>
    </div>
  );
};

export default ImageUpload;