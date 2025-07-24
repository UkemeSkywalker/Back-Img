#!/bin/bash
cd backend
python3 -m venv venv
source venv/bin/activate
if ! python -c "import fastapi" 2>/dev/null; then
    pip install -r requirements.txt
fi
python main.py