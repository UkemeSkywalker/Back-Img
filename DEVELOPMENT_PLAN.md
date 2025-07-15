# Behind-Image Text Generator - Development Plan

## Project Overview
A web application that allows users to add custom text behind objects in images using AI-powered background segmentation with U²-Net.

## End-to-End Architecture

### System Architecture
```
Frontend (React + Canvas) ↔ FastAPI Backend ↔ U²-Net Model
```

### Data Flow
1. User uploads image → Frontend
2. Image sent to `/generate-mask` → Backend processes with U²-Net
3. Mask returned → Frontend displays preview
4. User adds text + styling → Frontend canvas manipulation
5. Composite request to `/composite` → Backend layer processing
6. Final image returned → User downloads

## Technical Stack

### Backend (FastAPI)
- **Framework**: FastAPI 0.104.1
- **AI Model**: U²-Net (PyTorch implementation)
- **Image Processing**: OpenCV, PIL, NumPy
- **Server**: Uvicorn
- **Port**: 8000

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Canvas Library**: Fabric.js for text manipulation
- **HTTP Client**: Axios
- **Styling**: CSS3 + CSS Grid/Flexbox
- **Port**: 3000

## Directory Structure
```
/Users/ukeme/Back-Img/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── models/
│   │   ├── __init__.py
│   │   ├── u2net.py           # U²-Net model wrapper
│   │   └── u2net_weights/     # Model weights (to be added)
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── image_processing.py # Image utilities
│   │   └── text_rendering.py   # Text layer creation
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageEditor.tsx     # Main editor component
│   │   │   ├── ImageUpload.tsx     # File upload
│   │   │   ├── TextControls.tsx    # Text styling controls
│   │   │   └── CanvasEditor.tsx    # Canvas manipulation
│   │   ├── services/
│   │   │   └── api.ts              # Backend API calls
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   └── App.tsx
│   └── package.json
└── DEVELOPMENT_PLAN.md
```

## API Endpoints

### Backend Endpoints
1. **GET /** - Health check
2. **GET /health** - Service status
3. **POST /generate-mask**
   - Input: `file: UploadFile`
   - Output: PNG mask image
   - Process: U²-Net segmentation
4. **POST /composite**
   - Input: `original: UploadFile, mask: UploadFile, text: str, font_size: int, text_color: str, x_pos: int, y_pos: int`
   - Output: Composite PNG image
   - Process: Layer composition

## Implementation Steps

### Phase 1: Backend Core (Priority 1)
1. **U²-Net Integration**
   - Download pre-trained U²-Net weights
   - Implement model loading in `models/u2net.py`
   - Add proper preprocessing/postprocessing
   - Test mask generation accuracy

2. **Image Processing Pipeline**
   - Create `utils/image_processing.py`
   - Implement mask refinement (smoothing, edge cleanup)
   - Add image format validation
   - Handle different image sizes/ratios

3. **Text Rendering System**
   - Create `utils/text_rendering.py`
   - Implement PIL-based text rendering
   - Support multiple fonts, sizes, colors
   - Add text positioning logic

4. **Layer Composition**
   - Implement 3-layer system:
     - Background layer (original image background)
     - Text layer (middle)
     - Foreground layer (segmented object)
   - Alpha blending for realistic integration
   - Edge feathering for smooth transitions

### Phase 2: Frontend Core (Priority 1)
1. **Image Upload Component**
   - Create `ImageUpload.tsx`
   - Drag & drop functionality
   - File validation (size, format)
   - Preview generation

2. **Canvas Editor**
   - Create `CanvasEditor.tsx` with Fabric.js
   - Display original image + mask overlay
   - Interactive text positioning
   - Real-time preview updates

3. **Text Controls**
   - Create `TextControls.tsx`
   - Font family selector
   - Size, color, opacity controls
   - Text input field
   - Position fine-tuning

4. **API Integration**
   - Create `services/api.ts`
   - Implement all backend API calls
   - Handle file uploads with progress
   - Error handling and loading states

### Phase 3: Advanced Features (Priority 2)
1. **Enhanced U²-Net**
   - Fine-tune model for better edge detection
   - Add multiple model support (U2NET, U2NETP)
   - Implement model switching based on image complexity

2. **Advanced Text Features**
   - Text effects (shadow, outline, gradient)
   - Multiple text layers
   - Text rotation and skewing
   - Font loading from Google Fonts

3. **UI/UX Improvements**
   - Responsive design
   - Loading animations
   - Progress indicators
   - Undo/redo functionality

### Phase 4: Optimization (Priority 3)
1. **Performance**
   - Image compression before processing
   - Async processing with WebSockets
   - Client-side image resizing
   - Caching for repeated operations

2. **Production Ready**
   - Docker containerization
   - Environment configuration
   - Error logging and monitoring
   - API rate limiting

## Key Technical Challenges & Solutions

### 1. U²-Net Model Integration
**Challenge**: Loading and serving large AI model efficiently
**Solution**: 
- Use model quantization for faster inference
- Implement model caching
- Add fallback traditional CV methods

### 2. Layer Composition
**Challenge**: Realistic text placement behind objects
**Solution**:
- Use alpha blending with mask gradients
- Implement edge feathering
- Add depth-aware positioning

### 3. Real-time Preview
**Challenge**: Fast preview updates during text editing
**Solution**:
- Client-side canvas manipulation
- Debounced API calls
- Cached mask reuse

### 4. Cross-browser Compatibility
**Challenge**: Canvas and file handling differences
**Solution**:
- Use Fabric.js for consistent canvas behavior
- Polyfills for older browsers
- Progressive enhancement

## Testing Strategy

### Backend Testing
- Unit tests for U²-Net model wrapper
- Integration tests for API endpoints
- Performance tests for image processing
- Mock tests for model predictions

### Frontend Testing
- Component unit tests with React Testing Library
- Canvas interaction tests
- API integration tests
- E2E tests with Cypress

## Deployment Architecture

### Development
- Backend: `uvicorn main:app --reload --port 8000`
- Frontend: `npm start` (port 3000)
- CORS enabled for localhost

### Production
- Backend: Docker container with Gunicorn + Uvicorn
- Frontend: Static build served by Nginx
- Reverse proxy for API routing
- CDN for static assets

## Performance Targets
- Image upload: < 2s for 5MB images
- Mask generation: < 5s for 1080p images
- Text compositing: < 1s
- Total workflow: < 10s end-to-end

## Security Considerations
- File upload validation (size, type, content)
- Rate limiting on API endpoints
- Input sanitization for text content
- CORS configuration for production
- No persistent storage of user images

## Next Steps for Implementation
1. Complete U²-Net model integration with actual weights
2. Implement complete image processing pipeline
3. Build React components with proper state management
4. Add comprehensive error handling
5. Implement testing suite
6. Optimize for production deployment

This plan provides a complete roadmap for building the Behind-Image Text Generator with clear priorities and technical specifications.