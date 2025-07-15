import axios from 'axios';
import { TextConfig } from '../types';

const API_BASE = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
});

export const generateMask = async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/generate-mask', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob'
  });
  
  return response.data;
};

export const compositeImage = async (
  original: File,
  mask: Blob,
  textConfig: TextConfig
): Promise<Blob> => {
  const formData = new FormData();
  formData.append('original', original);
  formData.append('mask', new File([mask], 'mask.png'));
  formData.append('text', textConfig.text);
  formData.append('font_size', textConfig.fontSize.toString());
  formData.append('text_color', textConfig.color);
  formData.append('x_pos', textConfig.x.toString());
  formData.append('y_pos', textConfig.y.toString());
  
  const response = await api.post('/composite', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob'
  });
  
  return response.data;
};