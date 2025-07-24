import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageEditor from '../ImageEditor';

// Mock the child components to focus on testing the ImageEditor logic
jest.mock('../ImageUpload', () => {
  return function MockImageUpload({ onImageSelect, isLoading }: any) {
    return <div data-testid="image-upload">Image Upload Mock</div>;
  };
});

jest.mock('../TextControls', () => {
  return function MockTextControls(props: any) {
    return <div data-testid="text-controls">Text Controls Mock</div>;
  };
});

jest.mock('../CanvasEditor', () => {
  return function MockCanvasEditor(props: any) {
    return <div data-testid="canvas-editor">Canvas Editor Mock</div>;
  };
});

describe('ImageEditor', () => {
  test('renders without crashing', () => {
    render(<ImageEditor />);
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.getByTestId('text-controls')).toBeInTheDocument();
  });

  test('shows image upload area when no image is loaded', () => {
    render(<ImageEditor />);
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.queryByTestId('canvas-editor')).not.toBeInTheDocument();
  });
});