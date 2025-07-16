from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import numpy as np
from PIL import Image
import cv2
from models.u2net import U2NetModel
from utils.image_processing import refine_mask, smooth_mask_edges
from utils.text_rendering import create_text_layer, composite_layers

app = FastAPI(title="Behind-Image Text Generator", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize U2Net model
u2net_model = U2NetModel()

@app.get("/")
async def root():
    return {"message": "Behind-Image Text Generator API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/generate-mask")
async def generate_mask(file: UploadFile = File(...)):
    """Generate object mask using U2Net"""
    try:
        # Read uploaded image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Generate mask using U2Net
        mask = u2net_model.predict(image)
        
        # Convert mask to bytes
        mask_pil = Image.fromarray((mask * 255).astype(np.uint8))
        img_byte_arr = io.BytesIO()
        mask_pil.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.getvalue()),
            media_type="image/png"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/composite")
async def composite_image(
    original: UploadFile = File(...),
    mask: UploadFile = File(...),
    text: str = "Sample Text",
    font_size: int = 48,
    text_color: str = "#FFFFFF",
    x_pos: int = 100,
    y_pos: int = 100
):
    """Composite image with text behind object"""
    try:
        # Read images
        original_img = Image.open(io.BytesIO(await original.read())).convert("RGBA")
        mask_img = Image.open(io.BytesIO(await mask.read())).convert("L")
        
        # Refine mask
        mask_array = np.array(mask_img)
        mask_array = refine_mask(mask_array)
        mask_array = smooth_mask_edges(mask_array)
        mask_refined = Image.fromarray(mask_array)
        
        # Create text layer
        text_layer = create_text_layer(
            original_img.size, text, font_size, text_color, x_pos, y_pos
        )
        
        # Composite layers
        result = composite_layers(original_img, text_layer, mask_refined, original_img)
        
        # Return composite image
        img_byte_arr = io.BytesIO()
        result.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.getvalue()),
            media_type="image/png"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)