import React, { useState, useCallback } from 'react';
import { TextElement, TextStyle, Position } from '../types';

interface TextControlsProps {
  textElements: TextElement[];
  activeTextId: string | null;
  onTextUpdate: (id: string, updates: Partial<TextElement>) => void;
  isLoading?: boolean;
  hasImage?: boolean;
}

const TextControls: React.FC<TextControlsProps> = ({ 
  textElements,
  activeTextId,
  onTextUpdate,
  isLoading = false,
  hasImage = false
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Get the currently active text element
  const activeTextElement = textElements.find(element => element.id === activeTextId);

  // Character limit for text content
  const MAX_TEXT_LENGTH = 100;

  // Validation function for text content
  const validateTextContent = useCallback((content: string): string | null => {
    if (content.length === 0) {
      return 'Text content cannot be empty';
    }
    if (content.length > MAX_TEXT_LENGTH) {
      return `Text must be ${MAX_TEXT_LENGTH} characters or less`;
    }
    if (content.trim().length === 0) {
      return 'Text content cannot be only whitespace';
    }
    return null;
  }, []);

  // Validation function for color values
  const validateColor = useCallback((color: string): string => {
    // Check if it's a valid hex color
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexColorRegex.test(color)) {
      return color;
    }
    
    // Check if it's a valid CSS color name
    const validColorNames = [
      'black', 'white', 'red', 'green', 'blue', 'orange', 'yellow', 'purple',
      'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
      'maroon', 'olive', 'teal', 'silver', 'aqua', 'fuchsia'
    ];
    
    if (validColorNames.includes(color.toLowerCase())) {
      return color;
    }
    
    // Fallback to white if invalid
    console.warn(`Invalid color value: ${color}. Falling back to white.`);
    return '#FFFFFF';
  }, []);

  // Handle text content changes with validation
  const handleContentChange = useCallback((content: string) => {
    if (!activeTextElement) return;

    const error = validateTextContent(content);
    setValidationErrors(prev => ({
      ...prev,
      content: error || ''
    }));

    // Update the text element even if there's a validation error (for real-time preview)
    onTextUpdate(activeTextElement.id, { content });
  }, [activeTextElement, onTextUpdate, validateTextContent]);

  // Handle style updates with color validation
  const handleStyleUpdate = useCallback((styleUpdates: Partial<TextStyle>) => {
    if (!activeTextElement) return;
    
    // Validate color if it's being updated
    if (styleUpdates.color) {
      styleUpdates.color = validateColor(styleUpdates.color);
    }
    
    onTextUpdate(activeTextElement.id, {
      style: { ...activeTextElement.style, ...styleUpdates }
    });
  }, [activeTextElement, onTextUpdate, validateColor]);

  // Handle position updates
  const handlePositionUpdate = useCallback((positionUpdates: Partial<Position>) => {
    if (!activeTextElement) return;
    
    onTextUpdate(activeTextElement.id, {
      position: { ...activeTextElement.position, ...positionUpdates }
    });
  }, [activeTextElement, onTextUpdate]);

  // If no text element is selected, show selection prompt
  if (!activeTextElement) {
    return (
      <div className="text-controls-container">
        <h3>Text Customization</h3>
        <div className="no-selection-message">
          <p className="no-selection-text">Select a text element to customize its properties</p>
          <p className="no-selection-hint">Click on a text tag above or add a new text element to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-controls-container">
      <h3>Text Customization</h3>
      
      {/* Text Content Input */}
      <div className="control-group">
        <label htmlFor="text-content-input">
          Text Content ({activeTextElement.content.length}/{MAX_TEXT_LENGTH})
        </label>
        <div className="input-wrapper">
          <input
            id="text-content-input"
            type="text"
            value={activeTextElement.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter your text"
            maxLength={MAX_TEXT_LENGTH}
            className={validationErrors.content ? 'input-error' : ''}
            disabled={isLoading}
          />
          {validationErrors.content && (
            <div className="validation-error">
              <span className="error-icon">⚠</span>
              <span className="error-message">{validationErrors.content}</span>
            </div>
          )}
        </div>
        <div className="input-hint">
          Real-time preview updates as you type
        </div>
      </div>

      {/* Font Style Controls Section */}
      <div className="font-style-section">
        <h4 className="section-title">Font Style</h4>
        
        {/* Font Family Selection */}
        <div className="control-group">
          <label htmlFor="font-family-select">Font Family</label>
          <select
            id="font-family-select"
            value={activeTextElement.style.fontFamily}
            onChange={(e) => handleStyleUpdate({ fontFamily: e.target.value })}
            disabled={isLoading}
            className="font-family-select"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Impact">Impact</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>

        {/* Font Weight Selection */}
        <div className="control-group">
          <label htmlFor="font-weight-select">Font Weight</label>
          <select
            id="font-weight-select"
            value={activeTextElement.style.fontWeight}
            onChange={(e) => handleStyleUpdate({ fontWeight: parseInt(e.target.value) })}
            disabled={isLoading}
            className="font-weight-select"
          >
            <option value={100}>Thin (100)</option>
            <option value={200}>Extra Light (200)</option>
            <option value={300}>Light (300)</option>
            <option value={400}>Normal (400)</option>
            <option value={500}>Medium (500)</option>
            <option value={600}>Semi Bold (600)</option>
            <option value={700}>Bold (700)</option>
            <option value={800}>Extra Bold (800)</option>
            <option value={900}>Black (900)</option>
          </select>
        </div>

        {/* Font Style Toggle */}
        <div className="control-group">
          <label>Font Style</label>
          <div className="font-style-toggle">
            <button
              type="button"
              className={activeTextElement.style.fontStyle === 'normal' ? 'active' : ''}
              onClick={() => handleStyleUpdate({ fontStyle: 'normal' })}
              disabled={isLoading}
            >
              Normal
            </button>
            <button
              type="button"
              className={activeTextElement.style.fontStyle === 'italic' ? 'active' : ''}
              onClick={() => handleStyleUpdate({ fontStyle: 'italic' })}
              disabled={isLoading}
            >
              Italic
            </button>
          </div>
        </div>
      </div>

      {/* Font Size Slider */}
      <div className="control-group">
        <label htmlFor="font-size-slider">
          Font Size: {activeTextElement.style.fontSize}px
        </label>
        <input
          id="font-size-slider"
          type="range"
          min="12"
          max="120"
          step="1"
          value={activeTextElement.style.fontSize}
          onChange={(e) => handleStyleUpdate({ fontSize: parseInt(e.target.value) })}
          className="range-input"
          disabled={isLoading}
        />
        <div className="range-labels">
          <span>12px</span>
          <span>120px</span>
        </div>
      </div>

      {/* Color Selection */}
      <div className="control-group">
        <label>Text Color</label>
        <div className="color-selection-container">
          {/* Current Color Display */}
          <div className="current-color-display">
            <div 
              className="current-color-swatch"
              style={{ backgroundColor: activeTextElement.style.color }}
              title={`Current color: ${activeTextElement.style.color}`}
            />
            <span className="current-color-value">{activeTextElement.style.color.toUpperCase()}</span>
          </div>
          
          {/* Preset Colors */}
          <div className="color-preset-section">
            <label className="preset-label">Preset Colors</label>
            <div className="color-preset-grid">
              {[
                { name: 'Black', value: '#000000' },
                { name: 'White', value: '#FFFFFF' },
                { name: 'Red', value: '#EF4444' },
                { name: 'Green', value: '#4ADE80' },
                { name: 'Blue', value: '#4A9EFF' },
                { name: 'Orange', value: '#F97316' },
                { name: 'Purple', value: '#A855F7' },
                { name: 'Yellow', value: '#EAB308' },
                { name: 'Pink', value: '#EC4899' }
              ].map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`color-preset ${activeTextElement.style.color.toUpperCase() === color.value ? 'active' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleStyleUpdate({ color: color.value })}
                  title={`${color.name} (${color.value})`}
                  disabled={isLoading}
                >
                  {activeTextElement.style.color.toUpperCase() === color.value && (
                    <span className="color-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Color Picker */}
          <div className="custom-color-picker">
            <label htmlFor="custom-color-input">Custom Color</label>
            <div className="color-input-wrapper">
              <input
                id="custom-color-input"
                type="color"
                value={activeTextElement.style.color}
                onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                disabled={isLoading}
                className="color-input"
              />
              <input
                type="text"
                value={activeTextElement.style.color}
                onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                disabled={isLoading}
                className="color-text-input"
                placeholder="#FFFFFF"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Opacity Slider */}
      <div className="control-group">
        <label htmlFor="opacity-slider">
          Opacity: {activeTextElement.style.opacity}%
        </label>
        <input
          id="opacity-slider"
          type="range"
          min="0"
          max="100"
          step="1"
          value={activeTextElement.style.opacity}
          onChange={(e) => handleStyleUpdate({ opacity: parseInt(e.target.value) })}
          className="range-input"
          disabled={isLoading}
        />
        <div className="range-labels">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Width Stretch Slider */}
      <div className="control-group">
        <label htmlFor="width-stretch-slider">
          Width Stretch: {activeTextElement.style.widthStretch}%
        </label>
        <input
          id="width-stretch-slider"
          type="range"
          min="50"
          max="200"
          step="1"
          value={activeTextElement.style.widthStretch}
          onChange={(e) => handleStyleUpdate({ widthStretch: parseInt(e.target.value) })}
          className="range-input"
          disabled={isLoading}
        />
        <div className="range-labels">
          <span>50%</span>
          <span>200%</span>
        </div>
      </div>

      {/* Height Stretch Slider */}
      <div className="control-group">
        <label htmlFor="height-stretch-slider">
          Height Stretch: {activeTextElement.style.heightStretch}%
        </label>
        <input
          id="height-stretch-slider"
          type="range"
          min="50"
          max="200"
          step="1"
          value={activeTextElement.style.heightStretch}
          onChange={(e) => handleStyleUpdate({ heightStretch: parseInt(e.target.value) })}
          className="range-input"
          disabled={isLoading}
        />
        <div className="range-labels">
          <span>50%</span>
          <span>200%</span>
        </div>
      </div>

      {/* Position Controls */}
      <div className="position-controls">
        <h4 className="section-title">Position</h4>
        
        {/* Horizontal Position */}
        <div className="control-group">
          <label htmlFor="horizontal-position-slider">
            Horizontal: {activeTextElement.position.x}%
          </label>
          <input
            id="horizontal-position-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={activeTextElement.position.x}
            onChange={(e) => handlePositionUpdate({ x: parseInt(e.target.value) })}
            className="range-input"
            disabled={isLoading}
          />
          <div className="range-labels">
            <span>Left</span>
            <span>Right</span>
          </div>
        </div>

        {/* Vertical Position */}
        <div className="control-group">
          <label htmlFor="vertical-position-slider">
            Vertical: {activeTextElement.position.y}%
          </label>
          <input
            id="vertical-position-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={activeTextElement.position.y}
            onChange={(e) => handlePositionUpdate({ y: parseInt(e.target.value) })}
            className="range-input"
            disabled={isLoading}
          />
          <div className="range-labels">
            <span>Top</span>
            <span>Bottom</span>
          </div>
        </div>

        {/* Rotation */}
        <div className="control-group">
          <label htmlFor="rotation-slider">
            Rotation: {activeTextElement.position.rotation}°
          </label>
          <input
            id="rotation-slider"
            type="range"
            min="0"
            max="360"
            step="1"
            value={activeTextElement.position.rotation}
            onChange={(e) => handlePositionUpdate({ rotation: parseInt(e.target.value) })}
            className="range-input"
            disabled={isLoading}
          />
          <div className="range-labels">
            <span>0°</span>
            <span>360°</span>
          </div>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="layer-controls">
        <h4 className="section-title">Layer</h4>
        <div className="layer-toggle">
          <button
            type="button"
            className={activeTextElement.layer === 'behind' ? 'active' : ''}
            onClick={() => onTextUpdate(activeTextElement.id, { layer: 'behind' })}
            disabled={isLoading}
          >
            Behind Image
          </button>
          <button
            type="button"
            className={activeTextElement.layer === 'ontop' ? 'active' : ''}
            onClick={() => onTextUpdate(activeTextElement.id, { layer: 'ontop' })}
            disabled={isLoading}
          >
            On Top of Image
          </button>
        </div>
      </div>

      {!hasImage && (
        <div className="upload-hint">
          Upload an image to see text preview
        </div>
      )}
    </div>
  );
};

export default TextControls;