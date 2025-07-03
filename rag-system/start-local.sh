#!/bin/bash

echo "🤖 Starting RAG System locally..."

# Check environment
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Check ChromaDB
if ! curl -s http://localhost:8000/api/v1/heartbeat > /dev/null; then
    echo "❌ ChromaDB not running on localhost:8000"
    exit 1
fi

echo "✅ Starting Documentation Assistant..."
npm start