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
      style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isLoading ? '#f5f5f5' : 'white'
      }}
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
          <p>Processing...</p>
        ) : (
          <>
            <p>Drop an image here or click to select</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Supports JPEG and PNG files
            </p>
          </>
        )}
      </label>
    </div>
  );
};

export default ImageUpload;