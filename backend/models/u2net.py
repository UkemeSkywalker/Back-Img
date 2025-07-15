import torch
import torch.nn as nn
import torchvision.transforms as transforms
import numpy as np
from PIL import Image
import cv2

class U2NetModel:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.transform = transforms.Compose([
            transforms.Resize((320, 320)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        self.load_model()
    
    def load_model(self):
        """Load pre-trained U2Net model"""
        try:
            print("Loading U2Net model...")
            # Use alternative U2Net implementation
            self.model = torch.hub.load('midasklr/U2Net', 'u2net', pretrained=True)
            self.model.to(self.device)
            self.model.eval()
            print(f"U2Net model loaded on {self.device}")
        except Exception as e:
            print(f"Error loading U2Net model: {e}")
            print("Using traditional CV fallback (GrabCut)")
            self.model = None
    
    def predict(self, image):
        """Generate mask for input image"""
        try:
            if self.model is None:
                return self._simple_segmentation(image)
            
            # Preprocess image
            img_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Generate prediction
            with torch.no_grad():
                pred = self.model(img_tensor)
                pred = torch.sigmoid(pred[0][0])
                pred = pred.cpu().numpy()
            
            # Resize to original size
            mask = cv2.resize(pred, image.size, interpolation=cv2.INTER_LINEAR)
            
            return mask
            
        except Exception as e:
            print(f"Error in prediction: {e}")
            return self._simple_segmentation(image)
    
    def _simple_segmentation(self, image):
        """Fallback segmentation using traditional CV methods"""
        # Convert PIL to OpenCV
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Simple background subtraction using GrabCut
        mask = np.zeros(img_cv.shape[:2], np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        
        # Define rectangle around the main object (center region)
        height, width = img_cv.shape[:2]
        rect = (width//4, height//4, width//2, height//2)
        
        cv2.grabCut(img_cv, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
        
        # Create binary mask
        mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('float32')
        
        return mask2