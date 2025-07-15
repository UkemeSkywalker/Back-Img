from PIL import Image, ImageDraw, ImageFont
import numpy as np

def create_text_layer(size, text, font_size=48, color="#FFFFFF", x_pos=100, y_pos=100):
    """Create text layer with specified parameters"""
    text_layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_layer)
    
    try:
        # Try to use a system font
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    # Parse color
    if color.startswith('#'):
        color = tuple(int(color[i:i+2], 16) for i in (1, 3, 5)) + (255,)
    else:
        color = (255, 255, 255, 255)  # Default white
    
    draw.text((x_pos, y_pos), text, font=font, fill=color)
    return text_layer

def composite_layers(background, text_layer, mask, foreground):
    """Composite all layers with proper alpha blending"""
    # Ensure all images are RGBA
    if background.mode != 'RGBA':
        background = background.convert('RGBA')
    if text_layer.mode != 'RGBA':
        text_layer = text_layer.convert('RGBA')
    
    # Create inverted mask for background
    mask_array = np.array(mask) / 255.0
    inv_mask = 1.0 - mask_array
    
    # Composite text behind object
    result = background.copy()
    
    # Apply text layer to background areas only
    text_array = np.array(text_layer)
    result_array = np.array(result)
    
    # Blend text with background using inverted mask
    for c in range(3):  # RGB channels
        result_array[:, :, c] = (
            result_array[:, :, c] * (1 - text_array[:, :, 3] / 255.0 * inv_mask) +
            text_array[:, :, c] * (text_array[:, :, 3] / 255.0 * inv_mask)
        )
    
    # Apply foreground (original object) on top
    for c in range(3):
        result_array[:, :, c] = (
            result_array[:, :, c] * (1 - mask_array) +
            result_array[:, :, c] * mask_array
        )
    
    return Image.fromarray(result_array.astype(np.uint8))