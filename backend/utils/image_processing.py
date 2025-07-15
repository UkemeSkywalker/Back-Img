import cv2
import numpy as np
from PIL import Image

def refine_mask(mask, kernel_size=5):
    """Refine mask with morphological operations"""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    return mask

def smooth_mask_edges(mask, blur_radius=3):
    """Smooth mask edges with Gaussian blur"""
    return cv2.GaussianBlur(mask, (blur_radius*2+1, blur_radius*2+1), 0)

def validate_image(image_bytes, max_size_mb=10):
    """Validate uploaded image"""
    if len(image_bytes) > max_size_mb * 1024 * 1024:
        raise ValueError(f"Image too large. Max size: {max_size_mb}MB")
    
    try:
        img = Image.open(image_bytes)
        if img.format not in ['JPEG', 'PNG', 'JPG']:
            raise ValueError("Unsupported format. Use JPEG or PNG")
        return True
    except Exception as e:
        raise ValueError(f"Invalid image: {str(e)}")