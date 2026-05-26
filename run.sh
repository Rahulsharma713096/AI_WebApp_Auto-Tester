#!/usr/bin/env bash
set -e

echo "============================================"
echo "  AI Web App Auto-Tester - Starting All Services"
echo "============================================"
echo ""

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "[ERROR] Python 3 not found. Install Python 3.11+"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js not found. Install Node.js 20+"; exit 1; }

# Create required directories
mkdir -p data runtime/screenshots reports/output

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    if [ -n "$BACKEND_PID" ]; then kill "$BACKEND_PID" 2>/dev/null; fi
    if [ -n "$FRONTEND_PID" ]; then kill "$FRONTEND_PID" 2>/dev/null; fi
    if [ -n "$ORCHESTRATOR_PID" ]; then kill "$ORCHESTRATOR_PID" 2>/dev/null; fi
    if [ -n "$RUNTIME_PID" ]; then kill "$RUNTIME_PID" 2>/dev/null; fi
    if command -v docker &> /dev/null; then
        docker stop tester-redis 2>/dev/null || true
        docker rm tester-redis 2>/dev/null || true
    fi
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Install backend dependencies
echo -e "${BLUE}[1/5]${NC} Installing backend dependencies..."
cd "$ROOT_DIR/backend"
pip3 install -r requirements.txt -q 2>/dev/null || pip install -r requirements.txt -q 2>/dev/null || echo -e "${YELLOW}  Warning: pip install had issues${NC}"

# Install frontend dependencies
echo -e "${BLUE}[2/5]${NC} Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    npm install --silent
else
    echo "     Frontend dependencies already installed."
fi

# Start Redis (via Docker if available)
echo -e "${BLUE}[3/5]${NC} Starting Redis..."
cd "$ROOT_DIR"
if command -v docker &> /dev/null; then
    if ! docker ps --format '{{.Names}}' | grep -q "^tester-redis$"; then
        echo "     Starting Redis container..."
        docker run --name tester-redis -p 6379:6379 -d redis:7-alpine >/dev/null 2>&1
    else
        echo "     Redis is already running."
    fi
else
    echo -e "${YELLOW}     Docker not found. Ensure Redis is running on localhost:6379${NC}"
fi

# Start backend
echo -e "${BLUE}[4/5]${NC} Starting Backend (FastAPI) on port 8000..."
cd "$ROOT_DIR/backend"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Start frontend
echo -e "${BLUE}[5/5]${NC} Starting Frontend (Next.js) on port 3000..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Optional: start AI orchestrator service
echo -e "${BLUE}[Optional]${NC} Starting AI Orchestrator on port 8001..."
cd "$ROOT_DIR/services/ai-orchestrator"
if [ -f "main.py" ]; then
    uvicorn main:app --reload --host 0.0.0.0 --port 8001 &
    ORCHESTRATOR_PID=$!
fi

# Optional: start Runtime service
echo -e "${BLUE}[Optional]${NC} Starting Runtime (Playwright) on port 8005..."
cd "$ROOT_DIR/runtime"
if [ -f "main.py" ]; then
    uvicorn main:app --reload --host 0.0.0.0 --port 8005 &
    RUNTIME_PID=$!
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  All services running!${NC}"
echo -e "${GREEN}  Backend:  http://localhost:8000${NC}"
echo -e "${GREEN}  Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}  API Docs: http://localhost:8000/docs${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Opening browser..."
sleep 3
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo "Press Ctrl+C to stop all services and exit."
wait
