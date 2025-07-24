import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextElementManager from '../TextElementManager';
import { TextElement } from '../../types';

// Mock text elements for testing
const mockTextElements: TextElement[] = [
  {
    id: 'text-1',
    content: 'Sample Text 1',
    layer: 'ontop',
    style: {
      fontFamily: 'Arial',
      fontSize: 48,
      color: '#FFFFFF',
      opacity: 100,
      widthStretch: 100,
      heightStretch: 100
    },
    position: {
      x: 50,
      y: 50,
      rotation: 0
    }
  },
  {
    id: 'text-2',
    content: 'Sample Text 2',
    layer: 'behind',
    style: {
      fontFamily: 'Arial',
      fontSize: 36,
      color: '#FF0000',
      opacity: 80,
      widthStretch: 120,
      heightStretch: 90
    },
    position: {
      x: 30,
      y: 70,
      rotation: 15
    }
  }
];

describe('TextElementManager', () => {
  const mockProps = {
    textElements: [],
    activeTextId: null,
    onTextAdd: jest.fn(),
    onTextRemove: jest.fn(),
    onTextSelect: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component with title and add button', () => {
    render(<TextElementManager {...mockProps} />);
    
    expect(screen.getByText('Text Elements')).toBeInTheDocument();
    expect(screen.getByText('+ Add Text')).toBeInTheDocument();
  });

  test('shows empty state when no text elements exist', () => {
    render(<TextElementManager {...mockProps} />);
    
    expect(screen.getByText('No text elements yet')).toBeInTheDocument();
    expect(screen.getByText('Click "Add Text" to get started')).toBeInTheDocument();
  });

  test('calls onTextAdd when add button is clicked', () => {
    render(<TextElementManager {...mockProps} />);
    
    const addButton = screen.getByText('+ Add Text');
    fireEvent.click(addButton);
    
    expect(mockProps.onTextAdd).toHaveBeenCalledTimes(1);
  });

  test('renders text elements when they exist', () => {
    const propsWithElements = {
      ...mockProps,
      textElements: mockTextElements
    };
    
    render(<TextElementManager {...propsWithElements} />);
    
    expect(screen.getByText('Sample Text 1')).toBeInTheDocument();
    expect(screen.getByText('Sample Text 2')).toBeInTheDocument();
    expect(screen.queryByText('No text elements yet')).not.toBeInTheDocument();
  });

  test('highlights active text element', () => {
    const propsWithActiveElement = {
      ...mockProps,
      textElements: mockTextElements,
      activeTextId: 'text-1'
    };
    
    render(<TextElementManager {...propsWithActiveElement} />);
    
    const activeElement = screen.getByText('Sample Text 1').closest('.text-element-tag');
    const inactiveElement = screen.getByText('Sample Text 2').closest('.text-element-tag');
    
    expect(activeElement).toHaveClass('active');
    expect(inactiveElement).not.toHaveClass('active');
  });

  test('calls onTextSelect when text element is clicked', () => {
    const propsWithElements = {
      ...mockProps,
      textElements: mockTextElements
    };
    
    render(<TextElementManager {...propsWithElements} />);
    
    const textElement = screen.getByText('Sample Text 1').closest('.text-element-tag');
    fireEvent.click(textElement!);
    
    expect(mockProps.onTextSelect).toHaveBeenCalledWith('text-1');
  });

  test('calls onTextRemove when remove button is clicked', () => {
    const propsWithElements = {
      ...mockProps,
      textElements: mockTextElements
    };
    
    render(<TextElementManager {...propsWithElements} />);
    
    const removeButtons = screen.getAllByLabelText(/Remove text element/);
    fireEvent.click(removeButtons[0]);
    
    expect(mockProps.onTextRemove).toHaveBeenCalledWith('text-1');
  });

  test('prevents event propagation when remove button is clicked', () => {
    const propsWithElements = {
      ...mockProps,
      textElements: mockTextElements
    };
    
    render(<TextElementManager {...propsWithElements} />);
    
    const removeButtons = screen.getAllByLabelText(/Remove text element/);
    fireEvent.click(removeButtons[0]);
    
    // onTextSelect should not be called when remove button is clicked
    expect(mockProps.onTextSelect).not.toHaveBeenCalled();
    expect(mockProps.onTextRemove).toHaveBeenCalledWith('text-1');
  });

  test('displays "Empty Text" for text elements with no content', () => {
    const emptyTextElement: TextElement = {
      ...mockTextElements[0],
      content: ''
    };
    
    const propsWithEmptyElement = {
      ...mockProps,
      textElements: [emptyTextElement]
    };
    
    render(<TextElementManager {...propsWithEmptyElement} />);
    
    expect(screen.getByText('Empty Text')).toBeInTheDocument();
  });

  test('renders remove buttons with correct accessibility labels', () => {
    const propsWithElements = {
      ...mockProps,
      textElements: mockTextElements
    };
    
    render(<TextElementManager {...propsWithElements} />);
    
    expect(screen.getByLabelText('Remove text element: Sample Text 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove text element: Sample Text 2')).toBeInTheDocument();
  });
});