import React from 'react';
import { TextElement } from '../types';

interface TextElementManagerProps {
  textElements: TextElement[];
  activeTextId: string | null;
  onTextAdd: () => void;
  onTextRemove: (id: string) => void;
  onTextSelect: (id: string) => void;
}

const TextElementManager: React.FC<TextElementManagerProps> = ({
  textElements,
  activeTextId,
  onTextAdd,
  onTextRemove,
  onTextSelect
}) => {
  return (
    <div className="text-element-manager">
      <div className="text-manager-header">
        <h3 className="text-manager-title">Text Elements</h3>
        <button 
          className="add-text-btn"
          onClick={onTextAdd}
          type="button"
        >
          + Add Text
        </button>
      </div>
      
      {textElements.length > 0 && (
        <div className="text-elements-list">
          {textElements.map((element) => (
            <div
              key={element.id}
              className={`text-element-tag ${
                activeTextId === element.id ? 'active' : ''
              }`}
              onClick={() => onTextSelect(element.id)}
            >
              <span className="text-element-content">
                {element.content || 'Empty Text'}
              </span>
              <button
                className="remove-text-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the select
                  onTextRemove(element.id);
                }}
                type="button"
                aria-label={`Remove text element: ${element.content}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {textElements.length === 0 && (
        <div className="no-text-elements">
          <p className="no-text-message">No text elements yet</p>
          <p className="no-text-hint">Click "Add Text" to get started</p>
        </div>
      )}
    </div>
  );
};

export default TextElementManager;