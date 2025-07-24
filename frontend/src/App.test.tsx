import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders image editor application', () => {
  render(<App />);
  const uploadElement = screen.getByText(/Click to upload an image/i);
  expect(uploadElement).toBeInTheDocument();
});
