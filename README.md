# Back-Img
A web application that allows users to add custom text behind objects in images using AI-powered background segmentation.

## Features
- Upload images (JPEG/PNG)
- AI-powered object segmentation using U²-Net
- Add custom text behind objects
- Adjust text size, color, and position
- Download final composite image

## Setup Instructions

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate virtual environment:
   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Option 1: Using startup scripts
1. Start backend:
   ```bash
   ./start_backend.sh
   ```

2. Start frontend (in new terminal):
   ```bash
   ./start_frontend.sh
   ```

### Option 2: Manual startup
1. Start backend:
   ```bash
   cd backend
   source venv/bin/activate
   python main.py
   ```

2. Start frontend (in new terminal):
   ```bash
   cd frontend
   npm start
   ```

## Usage
1. Open http://localhost:3000 in your browser
2. Upload an image using drag-and-drop or file selector
3. Wait for AI segmentation to complete
4. Adjust text settings (content, size, color, position)
5. Click "Generate Image" to create the composite
6. Download the final result

## API Endpoints
- `GET /` - Health check
- `GET /health` - Service status
- `POST /generate-mask` - Generate object mask from image
- `POST /composite` - Create composite image with text behind object

## Technology Stack
- **Backend**: FastAPI, PyTorch, OpenCV, PIL
- **Frontend**: React, TypeScript, Fabric.js, Axios
- **AI Model**: U²-Net for background segmentation

## Current Implementation Status
✅ Backend API with FastAPI
✅ U²-Net model integration (with fallback)
✅ Image processing utilities
✅ Text rendering and compositing
✅ React frontend with TypeScript
✅ Image upload with drag-and-drop
✅ Text controls and canvas editor
✅ Complete workflow integration

## Notes
- The U²-Net model currently uses a fallback traditional CV method (GrabCut)
- For production use, download actual U²-Net pre-trained weights
- The application runs on localhost:3000 (frontend) and localhost:8000 (backend)