// Position interface for text element positioning
export interface Position {
  x: number;                   // Horizontal position (0-100%)
  y: number;                   // Vertical position (0-100%)
  rotation: number;            // Rotation in degrees (0-360)
}

// TextStyle interface for comprehensive text styling
export interface TextStyle {
  fontFamily: string;          // Font family
  fontSize: number;            // Font size in pixels
  color: string;               // Hex color code
  opacity: number;             // 0-100 percentage
  widthStretch: number;        // Width scaling factor
  heightStretch: number;       // Height scaling factor
}

// Enhanced TextElement interface with layer, style, and position
export interface TextElement {
  id: string;                    // Unique identifier
  content: string;               // Text content
  layer: 'behind' | 'ontop';     // Text layer
  style: TextStyle;              // Text styling properties
  position: Position;            // Text positioning properties
}

// Updated ImageData interface to support multiple text elements
export interface ImageData {
  original: File | null;         // Original uploaded file
  processed: string | null;      // Processed image URL
  mask: string | null;          // Mask image URL for behind-text effect
  dimensions: {
    width: number;
    height: number;
  } | null;
}

// AppConfig interface for application settings
export interface AppConfig {
  maxFileSize: number;           // Maximum file size in bytes
  supportedFormats: string[];    // Supported file formats
  defaultTextStyle: TextStyle;   // Default styling for new text elements
}

// Legacy TextConfig interface (kept for backward compatibility)
export interface TextConfig {
  text: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}