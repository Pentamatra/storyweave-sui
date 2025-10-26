#!/bin/bash

# ChainMuse - Start All Services
# This script starts the backend and frontend services

echo "🚀 Starting ChainMuse Services..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Start Backend
echo "🔧 Starting Backend Service..."
cd backend
if [ ! -f .env ]; then
    echo "⚠️  Backend .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit backend/.env with your API keys before running again."
    exit 1
fi

npm run dev &
BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend Service..."
cd ../frontend
if [ ! -f .env.local ]; then
    echo "⚠️  Frontend .env.local file not found. Copying from .env.local.example..."
    cp .env.local.example .env.local
fi

npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started with PID: $FRONTEND_PID"

# Save PIDs for stop script
echo $BACKEND_PID > ../logs/backend.pid
echo $FRONTEND_PID > ../logs/frontend.pid

echo ""
echo "🎉 ChainMuse is now running!"
echo "📊 Backend: http://localhost:4000"
echo "🎨 Frontend: http://localhost:3000"
echo "📋 Health Check: http://localhost:4000/health"
echo ""
echo "To stop all services, run: ./stop-all.sh"