# Design Document

## Overview

This design document outlines the transformation of the existing "Behind-Image Text Generator" application into a professional, dark-themed image editor called "Back Image" that matches the reference UI design. The redesign focuses on creating a modern, intuitive interface with comprehensive text customization controls, multiple text layer management, and enhanced user experience.

**Critical Core Functionality Update**: The application requires a significant upgrade to its AI-powered image segmentation capabilities. The current U2Net model needs to be replaced with a more advanced AI model that can accurately identify and separate foreground objects from background, enabling proper text placement "behind" objects in images.

The application will maintain its core functionality of adding text behind or on top of images while significantly improving both the AI segmentation accuracy and the user interface, adding new features like multiple text elements, advanced positioning controls, and a more sophisticated design system.

## Architecture

### AI Model Integration

The application requires integration with a more advanced AI model for accurate foreground/background segmentation:

**Current Issue**: The existing U2Net model is insufficient for proper object detection and segmentation.

**Proposed Solutions**:
1. **SAM (Segment Anything Model)** - Meta's advanced segmentation model
2. **REMBG with improved models** - Updated background removal with better model options
3. **Custom API Integration** - Integration with services like Remove.bg, Clipdrop, or similar
4. **Local AI Model** - Deploy a more advanced segmentation model locally

**Recommended Approach**: Integrate SAM (Segment Anything Model) or a similar advanced segmentation model that can:
- Accurately identify foreground objects
- Generate precise masks for object boundaries
- Handle complex scenes with multiple objects
- Provide real-time or near real-time processing

### Component Structure

The redesigned application will follow a modular React architecture with the following key components:

```
App
├── Header (new)
├── MainEditor
    ├── ImageUploadArea
    ├── ImageCanvas
    └── TextCustomizationPanel
        ├── TextElementManager
        ├── TextControls
        ├── LayerControls
        ├── StyleControls
        └── PositionControls
```

### State Management

The application will use React's built-in state management with the following state structure:

```typescript
interface AppState {
  image: {
    original: File | null;
    processed: string | null;
    mask: string | null;
  };
  textElements: TextElement[];
  activeTextId: string | null;
  isProcessing: boolean;
}

interface TextElement {
  id: string;
  content: string;
  layer: 'behind' | 'ontop';
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    opacity: number;
    widthStretch: number;
    heightStretch: number;
  };
  position: {
    x: number;
    y: number;
    rotation: number;
  };
}
```

## Components and Interfaces

### 1. Header Component

A minimal header displaying the "Back Image" branding without user account features.

**Props:**
```typescript
interface HeaderProps {
  // No props needed for initial version
}
```

### 2. ImageUploadArea Component

Enhanced upload area with dashed border styling and improved visual feedback.

**Props:**
```typescript
interface ImageUploadAreaProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
}
```

**Features:**
- Dashed border styling matching reference design
- Drag and drop functionality
- File format validation (PNG, JPG, GIF up to 5MB)
- Loading states with visual feedback

### 3. ImageCanvas Component

Enhanced canvas component supporting multiple text elements and drag-to-position functionality.

**Props:**
```typescript
interface ImageCanvasProps {
  image: string | null;
  textElements: TextElement[];
  activeTextId: string | null;
  onTextPositionChange: (id: string, x: number, y: number) => void;
  onTextSelect: (id: string) => void;
}
```

**Features:**
- Interactive text positioning via drag and drop
- Visual indicators for selected text elements
- Real-time preview of text styling changes
- Support for both "behind" and "on top" text layers

### 4. TextCustomizationPanel Component

Comprehensive control panel matching the reference design layout.

**Props:**
```typescript
interface TextCustomizationPanelProps {
  textElements: TextElement[];
  activeTextId: string | null;
  onTextAdd: () => void;
  onTextRemove: (id: string) => void;
  onTextUpdate: (id: string, updates: Partial<TextElement>) => void;
  onTextSelect: (id: string) => void;
}
```

### 5. TextElementManager Component

Manages multiple text elements with tag-based interface.

**Features:**
- "Add Text" button for creating new text elements
- Removable text tags (e.g., "Ukeme" with X button)
- Active text element highlighting
- Text element selection

### 6. StyleControls Component

Advanced styling controls matching the reference design.

**Features:**
- Font family dropdown (Arial, etc.)
- Color picker with preset colors (black, white, red, green, blue, orange)
- Custom color picker option
- Font size slider
- Opacity slider with percentage display
- Width and height stretch sliders

### 7. LayerControls Component

Text layer management with toggle buttons.

**Features:**
- "Behind Image" / "On Top of Image" toggle buttons
- Visual indication of active layer
- Real-time layer switching

### 8. PositionControls Component

Comprehensive positioning controls with sliders.

**Features:**
- Horizontal position slider
- Vertical position slider
- Rotation slider (0°-360°)
- Real-time position updates

## Data Models

### TextElement Model

```typescript
interface TextElement {
  id: string;                    // Unique identifier
  content: string;               // Text content
  layer: 'behind' | 'ontop';     // Text layer
  style: {
    fontFamily: string;          // Font family
    fontSize: number;            // Font size in pixels
    color: string;               // Hex color code
    opacity: number;             // 0-100 percentage
    widthStretch: number;        // Width scaling factor
    heightStretch: number;       // Height scaling factor
  };
  position: {
    x: number;                   // Horizontal position (0-100%)
    y: number;                   // Vertical position (0-100%)
    rotation: number;            // Rotation in degrees (0-360)
  };
}
```

### ImageData Model

```typescript
interface ImageData {
  original: File | null;         // Original uploaded file
  processed: string | null;      // Processed image URL
  mask: string | null;          // Mask image URL for behind-text effect
  dimensions: {
    width: number;
    height: number;
  } | null;
}
```

### AppConfig Model

```typescript
interface AppConfig {
  maxFileSize: number;           // Maximum file size in bytes
  supportedFormats: string[];    // Supported file formats
  defaultTextStyle: TextStyle;   // Default styling for new text elements
}
```

## AI Model Requirements

### Current Limitations

The existing U2Net model has significant limitations:
- Inaccurate object boundary detection
- Poor performance with complex backgrounds
- Inability to distinguish multiple foreground objects
- Limited accuracy with transparent or semi-transparent objects

### Required AI Model Capabilities

The new AI model must provide:

1. **Accurate Object Segmentation**
   - Precise boundary detection for foreground objects
   - Support for multiple objects in a single image
   - Handling of complex backgrounds and textures

2. **Real-time Performance**
   - Processing time under 5 seconds for typical images
   - Efficient memory usage
   - Scalable for multiple concurrent users

3. **Robust Object Detection**
   - Recognition of various object types (people, products, animals, etc.)
   - Handling of edge cases (reflections, shadows, transparency)
   - Consistent results across different image qualities

### Recommended AI Solutions

1. **SAM (Segment Anything Model)**
   - Pros: State-of-the-art accuracy, versatile object detection
   - Cons: Requires significant computational resources
   - Implementation: Local deployment or cloud API

2. **Improved REMBG Models**
   - Pros: Lightweight, easy integration, good for specific use cases
   - Cons: Limited to background removal, less flexible
   - Implementation: Update existing backend integration

3. **Commercial APIs**
   - Remove.bg API, Clipdrop API, or similar services
   - Pros: No local processing overhead, maintained by specialists
   - Cons: Ongoing costs, dependency on external service

4. **Custom Trained Model**
   - Train a model specifically for the application's use cases
   - Pros: Optimized for specific requirements
   - Cons: Requires ML expertise and training data

### Integration Strategy

The AI model integration should:
- Maintain backward compatibility during transition
- Provide fallback mechanisms for processing failures
- Include performance monitoring and quality metrics
- Support A/B testing between different models

## Error Handling

### File Upload Errors

- **File too large**: Display error message with size limit
- **Unsupported format**: Show supported formats list
- **Upload failure**: Retry mechanism with user feedback

### Image Processing Errors

- **Mask generation failure**: Fallback to overlay mode
- **API errors**: User-friendly error messages with retry options
- **Network errors**: Offline detection and appropriate messaging

### Text Rendering Errors

- **Invalid font**: Fallback to default font
- **Position out of bounds**: Automatic constraint to canvas bounds
- **Color parsing errors**: Fallback to default color

## Testing Strategy

### Unit Testing

- **Component Testing**: Test each component in isolation
- **State Management**: Test state updates and side effects
- **Utility Functions**: Test image processing and text rendering utilities
- **API Integration**: Mock API calls and test error scenarios

### Integration Testing

- **User Workflows**: Test complete user journeys
- **Component Interactions**: Test communication between components
- **File Upload Flow**: Test drag-and-drop and file selection
- **Text Manipulation**: Test text creation, editing, and positioning

### Visual Testing

- **UI Consistency**: Ensure components match reference design
- **Responsive Behavior**: Test on different screen sizes
- **Dark Theme**: Verify consistent dark theme implementation
- **Animation Smoothness**: Test hover states and transitions

### Performance Testing

- **Image Processing**: Test with various image sizes and formats
- **Multiple Text Elements**: Test performance with many text elements
- **Real-time Updates**: Test responsiveness of live preview
- **Memory Usage**: Monitor for memory leaks during extended use

## Implementation Approach

### Phase 1: AI Model Upgrade (Critical)
- Research and select advanced segmentation model (SAM, improved REMBG, or API service)
- Implement new AI model integration in backend
- Update API endpoints for improved segmentation
- Test segmentation accuracy with various image types

### Phase 2: Core UI Transformation
- Implement dark theme styling
- Create new component structure
- Update layout to match reference design

### Phase 3: Enhanced Text Controls
- Implement comprehensive text styling controls
- Add multiple text element support
- Create advanced positioning system

### Phase 4: Interactive Features
- Add drag-and-drop text positioning
- Implement layer management
- Add reset and download functionality

### Phase 5: Polish and Optimization
- Refine animations and transitions
- Optimize performance
- Add comprehensive error handling

## Design System

### Color Palette

```css
:root {
  --bg-primary: #1a1a1a;        /* Main background */
  --bg-secondary: #2a2a2a;      /* Panel backgrounds */
  --bg-tertiary: #3a3a3a;       /* Input backgrounds */
  --text-primary: #ffffff;       /* Primary text */
  --text-secondary: #cccccc;     /* Secondary text */
  --text-muted: #888888;         /* Muted text */
  --border-primary: #404040;     /* Primary borders */
  --border-dashed: #606060;      /* Dashed borders */
  --accent-blue: #4a9eff;        /* Blue accent */
  --accent-green: #4ade80;       /* Green accent */
  --accent-red: #ef4444;         /* Red accent */
  --accent-orange: #f97316;      /* Orange accent */
}
```

### Typography

```css
.font-primary {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
```

### Spacing System

```css
.space-xs { margin: 0.25rem; }
.space-sm { margin: 0.5rem; }
.space-md { margin: 1rem; }
.space-lg { margin: 1.5rem; }
.space-xl { margin: 2rem; }
```

This design provides a comprehensive foundation for transforming the existing application into a professional, feature-rich image editor that matches the reference design while maintaining excellent usability and performance.