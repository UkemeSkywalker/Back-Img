import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImageUploadArea from "../ImageUpload";
import ImageEditor from "../ImageEditor";

// Mock file for testing
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File(["test content"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("ImageUploadArea Component", () => {
  const mockOnImageSelect = jest.fn();

  beforeEach(() => {
    mockOnImageSelect.mockClear();
  });

  test("renders with dashed border and upload icon", () => {
    render(<ImageUploadArea onImageSelect={mockOnImageSelect} />);

    // Check for upload area with dashed border styling
    const uploadArea = document.querySelector(".image-upload-area");
    expect(uploadArea).toBeInTheDocument();
    expect(uploadArea).toHaveClass("image-upload-area");

    // Check for upload icon
    const uploadIcon = document.querySelector(".upload-icon");
    expect(uploadIcon).toBeInTheDocument();
  });

  test("displays instructional text and file format specifications", () => {
    render(<ImageUploadArea onImageSelect={mockOnImageSelect} />);

    // Check for instructional text
    expect(screen.getByText("Click to upload an image")).toBeInTheDocument();
    expect(screen.getByText("or drag and drop")).toBeInTheDocument();
    expect(screen.getByText("PNG, JPG, GIF up to 5MB")).toBeInTheDocument();
  });

  test("provides drag-and-drop visual feedback", () => {
    render(<ImageUploadArea onImageSelect={mockOnImageSelect} />);

    const uploadArea = document.querySelector(".image-upload-area");

    // Simulate drag enter
    fireEvent.dragEnter(uploadArea!, {
      dataTransfer: {
        files: [createMockFile("test.jpg", 1000000, "image/jpeg")],
      },
    });

    // Check for drag-over class and visual feedback
    expect(uploadArea).toHaveClass("drag-over");

    // Check for drag overlay
    const dragOverlay = document.querySelector(".drag-overlay");
    expect(dragOverlay).toBeInTheDocument();

    // Check for multiple instances of "Drop your image here" (one in main content, one in overlay)
    const dropTexts = screen.getAllByText("Drop your image here");
    expect(dropTexts).toHaveLength(2);
  });

  test("validates file format correctly", async () => {
    render(<ImageUploadArea onImageSelect={mockOnImageSelect} />);

    const fileInput = screen.getByLabelText("Upload image file");

    // Test valid file format
    const validFile = createMockFile("test.jpg", 1000000, "image/jpeg");
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Should not show error for valid file
    await waitFor(() => {
      expect(
        screen.queryByText(/Unsupported file format/)
      ).not.toBeInTheDocument();
    });
  });

  test("validates file size correctly", async () => {
    render(<ImageUploadArea onImageSelect={mockOnImageSelect} />);

    const fileInput = screen.getByLabelText("Upload image file");

    // Test file too large (6MB > 5MB limit)
    const largeFile = createMockFile(
      "large.jpg",
      6 * 1024 * 1024,
      "image/jpeg"
    );
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    // Should show error for large file
    await waitFor(() => {
      expect(screen.getByText(/File too large/)).toBeInTheDocument();
    });
  });

  test("shows loading state correctly", () => {
    render(
      <ImageUploadArea onImageSelect={mockOnImageSelect} isLoading={true} />
    );

    // Check for loading state
    const uploadArea = document.querySelector(".image-upload-area");
    expect(uploadArea).toHaveClass("loading");
    expect(screen.getByText("Processing Image...")).toBeInTheDocument();

    // Check for loading spinner
    const loadingSpinner = document.querySelector(".loading-spinner");
    expect(loadingSpinner).toBeInTheDocument();
  });

  test("handles keyboard accessibility", () => {
    render(<ImageUploadArea onImageSelect={mockOnImageSelect} />);

    const uploadArea = document.querySelector(".image-upload-area");

    // Check for accessibility attributes
    expect(uploadArea).toHaveAttribute("role", "button");
    expect(uploadArea).toHaveAttribute("tabIndex", "0");
    expect(uploadArea).toHaveAttribute("aria-label");
  });
});

describe("ImageEditor Integration", () => {
  test("shows both upload area and text controls from the start", () => {
    render(<ImageEditor />);

    // Should show upload area
    const uploadArea = document.querySelector(".image-upload-area");
    expect(uploadArea).toBeInTheDocument();

    // Should show text element manager
    expect(screen.getByText("Text Elements")).toBeInTheDocument();
    expect(screen.getByText("+ Add Text")).toBeInTheDocument();

    // Should show text customization panel
    expect(screen.getByText("Text Customization")).toBeInTheDocument();
    
    // Should show no selection message initially
    expect(screen.getByText("Select a text element to customize its properties")).toBeInTheDocument();

    // Should show no text elements message
    expect(screen.getByText("No text elements yet")).toBeInTheDocument();
    expect(screen.getByText("Click \"Add Text\" to get started")).toBeInTheDocument();
  });

  test("shows integrated layout with upload and controls", () => {
    render(<ImageEditor />);

    // Should show all sections in the three-column grid layout
    const canvasSection = document.querySelector(".canvas-section");
    const textControlsPanel = document.querySelector(".text-controls-panel");
    const layoutControlsPanel = document.querySelector(".layout-controls-panel");

    expect(canvasSection).toBeInTheDocument();
    expect(textControlsPanel).toBeInTheDocument();
    expect(layoutControlsPanel).toBeInTheDocument();

    // Upload area should be in canvas section
    const uploadArea = canvasSection?.querySelector(".image-upload-area");
    expect(uploadArea).toBeInTheDocument();

    // Text element manager should be in text controls panel
    const textElementManager = textControlsPanel?.querySelector(".text-element-manager");
    expect(textElementManager).toBeInTheDocument();
    
    // Text controls should be in text controls panel
    const textControls = textControlsPanel?.querySelector(".text-controls-container");
    expect(textControls).toBeInTheDocument();
    
    // Layer controls should be in layout controls panel
    const layerControls = layoutControlsPanel?.querySelector(".layer-controls-container");
    expect(layerControls).toBeInTheDocument();
    
    // Position controls should be in layout controls panel
    const positionControls = layoutControlsPanel?.querySelector(".position-controls-container");
    expect(positionControls).toBeInTheDocument();
  });
});
