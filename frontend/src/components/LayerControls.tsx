import React from 'react';
import { TextElement } from '../types';

interface LayerControlsProps {
  textElements: TextElement[];
  activeTextId: string | null;
  onTextUpdate: (id: string, updates: Partial<TextElement>) => void;
  isLoading?: boolean;
}

const LayerControls: React.FC<LayerControlsProps> = ({
  textElements,
  activeTextId,
  onTextUpdate,
  isLoading = false
}) => {
  // Get the currently active text element
  const activeTextElement = textElements.find(element => element.id === activeTextId);

  // Handle layer switching functionality
  const handleLayerChange = (layer: 'behind' | 'ontop') => {
    if (!activeTextElement) return;
    
    onTextUpdate(activeTextElement.id, { layer });
  };

  // If no text element is selected, show selection prompt
  if (!activeTextElement) {
    return (
      <div className="layer-controls-container">
        <h4 className="section-title">Layer</h4>
        <div className="no-selection-message">
          <p className="no-selection-text">Select a text element to control its layer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layer-controls-container">
      <h4 className="section-title">Layer</h4>
      
      {/* Layer Toggle Buttons */}
      <div className="layer-toggle-buttons">
        <button
          type="button"
          className={`layer-button ${activeTextElement.layer === 'behind' ? 'active' : ''}`}
          onClick={() => handleLayerChange('behind')}
          disabled={isLoading}
          title="Place text behind the main subject in the image"
        >
          <span className="layer-icon">🔙</span>
          <span className="layer-text">Behind Image</span>
          {activeTextElement.layer === 'behind' && (
            <span className="active-indicator">✓</span>
          )}
        </button>
        
        <button
          type="button"
          className={`layer-button ${activeTextElement.layer === 'ontop' ? 'active' : ''}`}
          onClick={() => handleLayerChange('ontop')}
          disabled={isLoading}
          title="Place text on top of the image as an overlay"
        >
          <span className="layer-icon">🔝</span>
          <span className="layer-text">On Top of Image</span>
          {activeTextElement.layer === 'ontop' && (
            <span className="active-indicator">✓</span>
          )}
        </button>
      </div>
      
      {/* Visual indication of active layer */}
      <div className="layer-status">
        <div className="layer-status-indicator">
          <span className="status-label">Current Layer:</span>
          <span className={`status-value ${activeTextElement.layer}`}>
            {activeTextElement.layer === 'behind' ? 'Behind Image' : 'On Top of Image'}
          </span>
        </div>
        
        {/* Layer description */}
        <div className="layer-description">
          {activeTextElement.layer === 'behind' ? (
            <p className="layer-help-text">
              Text will appear behind the main subject, creating a background effect
            </p>
          ) : (
            <p className="layer-help-text">
              Text will appear as an overlay on top of the entire image
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayerControls;