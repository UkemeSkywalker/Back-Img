import React from 'react';
import { TextConfig } from '../types';

interface TextControlsProps {
  textConfig: TextConfig;
  onChange: (config: TextConfig) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

const TextControls: React.FC<TextControlsProps> = ({ 
  textConfig, 
  onChange, 
  onGenerate, 
  isLoading 
}) => {
  const handleChange = (field: keyof TextConfig, value: string | number) => {
    onChange({ ...textConfig, [field]: value });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Text Settings</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Text:</label>
        <input
          type="text"
          value={textConfig.text}
          onChange={(e) => handleChange('text', e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          placeholder="Enter your text"
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Font Size:</label>
        <input
          type="range"
          min="20"
          max="100"
          value={textConfig.fontSize}
          onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
          style={{ width: '100%', marginTop: '5px' }}
        />
        <span>{textConfig.fontSize}px</span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Color:</label>
        <input
          type="color"
          value={textConfig.color}
          onChange={(e) => handleChange('color', e.target.value)}
          style={{ width: '100%', height: '40px', marginTop: '5px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label>X Position:</label>
          <input
            type="number"
            value={textConfig.x}
            onChange={(e) => handleChange('x', parseInt(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Y Position:</label>
          <input
            type="number"
            value={textConfig.y}
            onChange={(e) => handleChange('y', parseInt(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !textConfig.text}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? 'Generating...' : 'Generate Image'}
      </button>
    </div>
  );
};

export default TextControls;