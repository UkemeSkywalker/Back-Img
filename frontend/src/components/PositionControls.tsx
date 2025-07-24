import React, { useCallback } from 'react';
import { TextElement, Position } from '../types';

interface PositionControlsProps {
  textElements: TextElement[];
  activeTextId: string | null;
  onTextUpdate: (id: string, updates: Partial<TextElement>) => void;
  isLoading?: boolean;
}

const PositionControls: React.FC<PositionControlsProps> = ({
  textElements,
  activeTextId,
  onTextUpdate,
  isLoading = false
}) => {
  // Get the currently active text element
  const activeTextElement = textElements.find(element => element.id === activeTextId);

  // Handle position updates with real-time preview
  const handlePositionUpdate = useCallback((positionUpdates: Partial<Position>) => {
    if (!activeTextElement) return;
    
    onTextUpdate(activeTextElement.id, {
      position: { ...activeTextElement.position, ...positionUpdates }
    });
  }, [activeTextElement, onTextUpdate]);

  // If no text element is selected, show selection prompt
  if (!activeTextElement) {
    return (
      <div className="position-controls-container">
        <h4 className="section-title">Position</h4>
        <div className="no-selection-message">
          <p className="no-selection-text">Select a text element to control its position</p>
        </div>
      </div>
    );
  }

  return (
    <div className="position-controls-container">
      <h4 className="section-title">Position</h4>
      
      {/* Horizontal Position Slider */}
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
          title={`Horizontal position: ${activeTextElement.position.x}%`}
        />
        <div className="range-labels">
          <span>Left (0%)</span>
          <span>Right (100%)</span>
        </div>
      </div>

      {/* Vertical Position Slider */}
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
          title={`Vertical position: ${activeTextElement.position.y}%`}
        />
        <div className="range-labels">
          <span>Top (0%)</span>
          <span>Bottom (100%)</span>
        </div>
      </div>

      {/* Rotation Slider (0°-360°) */}
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
          title={`Rotation: ${activeTextElement.position.rotation}°`}
        />
        <div className="range-labels">
          <span>0°</span>
          <span>360°</span>
        </div>
      </div>

      {/* Position Preview Information */}
      <div className="position-preview">
        <div className="position-info">
          <h5>Current Position</h5>
          <div className="position-values">
            <div className="position-value">
              <span className="value-label">X:</span>
              <span className="value-number">{activeTextElement.position.x}%</span>
            </div>
            <div className="position-value">
              <span className="value-label">Y:</span>
              <span className="value-number">{activeTextElement.position.y}%</span>
            </div>
            <div className="position-value">
              <span className="value-label">Rotation:</span>
              <span className="value-number">{activeTextElement.position.rotation}°</span>
            </div>
          </div>
        </div>
        
        {/* Position Reset Button */}
        <div className="position-actions">
          <button
            type="button"
            className="reset-position-btn"
            onClick={() => handlePositionUpdate({ x: 50, y: 50, rotation: 0 })}
            disabled={isLoading}
            title="Reset position to center"
          >
            Reset to Center
          </button>
        </div>
      </div>

      {/* Position Help Text */}
      <div className="position-help">
        <p className="help-text">
          Use the sliders above to position your text, or drag the text directly on the canvas for precise placement.
        </p>
      </div>
    </div>
  );
};

export default PositionControls;