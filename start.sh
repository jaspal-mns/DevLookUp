#!/bin/bash

echo "🚀 Starting DevLookUp Documentation Assistant..."

# Using in-memory vector store (no ChromaDB required)
echo "📊 Using in-memory vector database"

# Check environment file
if [ ! -f "rag-system/.env" ]; then
    echo "❌ Environment file not found. Please create rag-system/.env"
    echo "   cp rag-system/.env.example rag-system/.env"
    echo "   # Edit with your Azure OpenAI credentials"
    exit 1
fi

# Build and start MCP server
echo "📚 Building MCP server..."
cd mcpserver/dynatrace
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1
cd ../..

# Build and start RAG system
echo "🤖 Building RAG system..."
cd rag-system
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1

echo "✅ Starting Documentation Assistant..."
echo ""
# Run from rag-system directory to load .env properly
npm start