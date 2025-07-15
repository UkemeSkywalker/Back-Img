export interface TextConfig {
  text: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
}

export interface ImageData {
  original: File | null;
  mask: string | null;
  preview: string | null;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}