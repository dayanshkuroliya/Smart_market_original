#!/bin/bash
# start.sh – Start both backend and frontend in one command

echo "🏬 Starting Smart Market Collection System..."

# Backend
echo "→ Starting FastAPI backend on :8000"
cd backend
python -m venv venv 2>/dev/null
source venv/bin/activate
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Frontend
echo "→ Starting React frontend on :3000"
cd ../frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers running!"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Login:    admin / admin123"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
