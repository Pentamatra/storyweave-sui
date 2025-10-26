#!/bin/bash

# ChainMuse - Stop All Services
# This script stops all running ChainMuse services

echo "🛑 Stopping ChainMuse Services..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop Backend
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🔧 Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "✅ Backend stopped"
    else
        echo "⚠️  Backend process not found"
    fi
    rm -f logs/backend.pid
else
    echo "⚠️  Backend PID file not found"
fi

# Stop Frontend
if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🎨 Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "✅ Frontend stopped"
    else
        echo "⚠️  Frontend process not found"
    fi
    rm -f logs/frontend.pid
else
    echo "⚠️  Frontend PID file not found"
fi

# Kill any remaining Node.js processes (be careful with this)
echo "🧹 Cleaning up any remaining Node.js processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "ts-node-dev" 2>/dev/null || true

echo "🎉 All ChainMuse services stopped!"