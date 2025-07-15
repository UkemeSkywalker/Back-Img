#!/bin/bash
cd backend
source venv/bin/activate
if ! python -c "import fastapi" 2>/dev/null; then
    pip install -r requirements.txt
fi
python main.py