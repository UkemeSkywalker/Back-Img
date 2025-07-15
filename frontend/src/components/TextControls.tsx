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
    <>
      <h3>Text Settings</h3>
      
      <div className="control-group">
        <label>Text:</label>
        <input
          type="text"
          value={textConfig.text}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder="Enter your text"
        />
      </div>

      <div className="control-group">
        <label>Font Size: {textConfig.fontSize}px</label>
        <input
          className="range-input"
          type="range"
          min="20"
          max="100"
          value={textConfig.fontSize}
          onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label>Color:</label>
        <input
          type="color"
          value={textConfig.color}
          onChange={(e) => handleChange('color', e.target.value)}
          style={{ height: '50px' }}
        />
      </div>

      <div className="position-inputs">
        <div className="control-group">
          <label>X Position:</label>
          <input
            type="number"
            value={textConfig.x}
            onChange={(e) => handleChange('x', parseInt(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label>Y Position:</label>
          <input
            type="number"
            value={textConfig.y}
            onChange={(e) => handleChange('y', parseInt(e.target.value))}
          />
        </div>
      </div>

      <button
        className="generate-btn"
        onClick={onGenerate}
        disabled={isLoading || !textConfig.text}
      >
        {isLoading ? 'Generating...' : 'Generate Image'}
      </button>
    </>
  );
};

export default TextControls;