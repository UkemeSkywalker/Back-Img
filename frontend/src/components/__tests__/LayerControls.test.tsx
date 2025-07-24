import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LayerControls from '../LayerControls';
import { TextElement } from '../../types';

// Mock text elements for testing
const mockTextElements: TextElement[] = [
  {
    id: 'text-1',
    content: 'Test Text 1',
    layer: 'ontop',
    style: {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 400,
      fontStyle: 'normal',
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
    content: 'Test Text 2',
    layer: 'behind',
    style: {
      fontFamily: 'Arial',
      fontSize: 36,
      fontWeight: 400,
      fontStyle: 'normal',
      color: '#000000',
      opacity: 80,
      widthStretch: 100,
      heightStretch: 100
    },
    position: {
      x: 30,
      y: 70,
      rotation: 0
    }
  }
];

describe('LayerControls Component', () => {
  const mockOnTextUpdate = jest.fn();

  beforeEach(() => {
    mockOnTextUpdate.mockClear();
  });

  it('renders without crashing', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    expect(screen.getByText('Layer')).toBeInTheDocument();
  });

  it('shows no selection message when no text element is active', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId={null}
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    expect(screen.getByText('Select a text element to control its layer')).toBeInTheDocument();
  });

  it('displays layer toggle buttons when text element is selected', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    expect(screen.getByRole('button', { name: /behind image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /on top of image/i })).toBeInTheDocument();
  });

  it('shows correct active layer for "ontop" layer', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-1" // text-1 has layer 'ontop'
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    const onTopButton = screen.getByRole('button', { name: /on top of image/i });
    const behindButton = screen.getByRole('button', { name: /behind image/i });
    
    expect(onTopButton).toHaveClass('active');
    expect(behindButton).not.toHaveClass('active');
    
    // Check status indicator
    expect(screen.getByText('Current Layer:')).toBeInTheDocument();
    expect(screen.getByText('Text will appear as an overlay on top of the entire image')).toBeInTheDocument();
  });

  it('shows correct active layer for "behind" layer', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-2" // text-2 has layer 'behind'
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    const onTopButton = screen.getByRole('button', { name: /on top of image/i });
    const behindButton = screen.getByRole('button', { name: /behind image/i });
    
    expect(behindButton).toHaveClass('active');
    expect(onTopButton).not.toHaveClass('active');
    
    // Check status indicator
    expect(screen.getByText('Current Layer:')).toBeInTheDocument();
    expect(screen.getByText('Text will appear behind the main subject, creating a background effect')).toBeInTheDocument();
  });

  it('calls onTextUpdate when "Behind Image" button is clicked', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-1" // text-1 currently has layer 'ontop'
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    const behindButton = screen.getByRole('button', { name: /behind image/i });
    fireEvent.click(behindButton);
    
    expect(mockOnTextUpdate).toHaveBeenCalledWith('text-1', { layer: 'behind' });
  });

  it('calls onTextUpdate when "On Top of Image" button is clicked', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-2" // text-2 currently has layer 'behind'
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    const onTopButton = screen.getByRole('button', { name: /on top of image/i });
    fireEvent.click(onTopButton);
    
    expect(mockOnTextUpdate).toHaveBeenCalledWith('text-2', { layer: 'ontop' });
  });

  it('disables buttons when loading', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-1"
        onTextUpdate={mockOnTextUpdate}
        isLoading={true}
      />
    );
    
    const onTopButton = screen.getByRole('button', { name: /on top of image/i });
    const behindButton = screen.getByRole('button', { name: /behind image/i });
    
    expect(onTopButton).toBeDisabled();
    expect(behindButton).toBeDisabled();
  });

  it('does not call onTextUpdate when buttons are disabled', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-1"
        onTextUpdate={mockOnTextUpdate}
        isLoading={true}
      />
    );
    
    const behindButton = screen.getByRole('button', { name: /behind image/i });
    fireEvent.click(behindButton);
    
    expect(mockOnTextUpdate).not.toHaveBeenCalled();
  });

  it('shows visual indication of active layer with active class', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-1" // text-1 has layer 'ontop'
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    const onTopButton = screen.getByRole('button', { name: /on top of image/i });
    expect(onTopButton).toHaveClass('active');
  });

  it('handles empty text elements array', () => {
    render(
      <LayerControls
        textElements={[]}
        activeTextId="non-existent"
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    expect(screen.getByText('Select a text element to control its layer')).toBeInTheDocument();
  });

  it('handles non-existent activeTextId', () => {
    render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="non-existent-id"
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    expect(screen.getByText('Select a text element to control its layer')).toBeInTheDocument();
  });

  it('displays correct layer status styling', () => {
    const { rerender } = render(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-1" // ontop layer
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    let statusValue = screen.getAllByText('On Top of Image')[1]; // Get the status indicator, not the button text
    expect(statusValue).toHaveClass('ontop');
    
    // Switch to behind layer
    rerender(
      <LayerControls
        textElements={mockTextElements}
        activeTextId="text-2" // behind layer
        onTextUpdate={mockOnTextUpdate}
      />
    );
    
    statusValue = screen.getAllByText('Behind Image')[1]; // Get the status indicator, not the button text
    expect(statusValue).toHaveClass('behind');
  });
});