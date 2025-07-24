import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PositionControls from '../PositionControls';
import { TextElement } from '../../types';

// Mock text elements for testing
const mockTextElements: TextElement[] = [
  {
    id: 'test-1',
    content: 'Test Text',
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
      y: 30,
      rotation: 45
    }
  }
];

describe('PositionControls', () => {
  const mockOnTextUpdate = jest.fn();

  beforeEach(() => {
    mockOnTextUpdate.mockClear();
  });

  it('renders position controls when text element is selected', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId="test-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );

    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Horizontal: 50%')).toBeInTheDocument();
    expect(screen.getByText('Vertical: 30%')).toBeInTheDocument();
    expect(screen.getByText('Rotation: 45°')).toBeInTheDocument();
  });

  it('shows selection prompt when no text element is selected', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId={null}
        onTextUpdate={mockOnTextUpdate}
      />
    );

    expect(screen.getByText('Select a text element to control its position')).toBeInTheDocument();
  });

  it('updates horizontal position when slider changes', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId="test-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );

    const horizontalSlider = screen.getByLabelText('Horizontal: 50%');
    fireEvent.change(horizontalSlider, { target: { value: '75' } });

    expect(mockOnTextUpdate).toHaveBeenCalledWith('test-1', {
      position: { x: 75, y: 30, rotation: 45 }
    });
  });

  it('updates vertical position when slider changes', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId="test-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );

    const verticalSlider = screen.getByLabelText('Vertical: 30%');
    fireEvent.change(verticalSlider, { target: { value: '80' } });

    expect(mockOnTextUpdate).toHaveBeenCalledWith('test-1', {
      position: { x: 50, y: 80, rotation: 45 }
    });
  });

  it('updates rotation when slider changes', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId="test-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );

    const rotationSlider = screen.getByLabelText('Rotation: 45°');
    fireEvent.change(rotationSlider, { target: { value: '180' } });

    expect(mockOnTextUpdate).toHaveBeenCalledWith('test-1', {
      position: { x: 50, y: 30, rotation: 180 }
    });
  });

  it('resets position to center when reset button is clicked', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId="test-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );

    const resetButton = screen.getByText('Reset to Center');
    fireEvent.click(resetButton);

    expect(mockOnTextUpdate).toHaveBeenCalledWith('test-1', {
      position: { x: 50, y: 50, rotation: 0 }
    });
  });

  it('disables controls when loading', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId="test-1"
        onTextUpdate={mockOnTextUpdate}
        isLoading={true}
      />
    );

    const horizontalSlider = screen.getByLabelText('Horizontal: 50%');
    const verticalSlider = screen.getByLabelText('Vertical: 30%');
    const rotationSlider = screen.getByLabelText('Rotation: 45°');
    const resetButton = screen.getByText('Reset to Center');

    expect(horizontalSlider).toBeDisabled();
    expect(verticalSlider).toBeDisabled();
    expect(rotationSlider).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });

  it('displays current position values correctly', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId="test-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );

    expect(screen.getByText('Current Position')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument(); // X value
    expect(screen.getByText('30%')).toBeInTheDocument(); // Y value
    expect(screen.getByText('45°')).toBeInTheDocument(); // Rotation value
  });

  it('shows help text for user guidance', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId="test-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );

    expect(screen.getByText(/Use the sliders above to position your text/)).toBeInTheDocument();
  });

  it('has proper slider ranges', () => {
    render(
      <PositionControls
        textElements={mockTextElements}
        activeTextId="test-1"
        onTextUpdate={mockOnTextUpdate}
      />
    );

    const horizontalSlider = screen.getByLabelText('Horizontal: 50%');
    const verticalSlider = screen.getByLabelText('Vertical: 30%');
    const rotationSlider = screen.getByLabelText('Rotation: 45°');

    expect(horizontalSlider).toHaveAttribute('min', '0');
    expect(horizontalSlider).toHaveAttribute('max', '100');
    expect(verticalSlider).toHaveAttribute('min', '0');
    expect(verticalSlider).toHaveAttribute('max', '100');
    expect(rotationSlider).toHaveAttribute('min', '0');
    expect(rotationSlider).toHaveAttribute('max', '360');
  });
});