# DevLookUp - Documentation RAG System

AI-powered documentation assistant using MCP servers, Azure OpenAI, and vector search for Dynatrace, Terraform, and New Relic documentation.

## 🚀 Quick Start

```bash
# 1. Configure environment
cp rag-system/.env.example rag-system/.env
# Edit .env with your Azure OpenAI credentials

# 2. Start the application
./start.sh
```

## 📁 Project Structure

```
DevLookUp/
├── mcpserver/dynatrace/     # MCP server for documentation crawling
├── rag-system/             # RAG system with Azure OpenAI
└── start.sh                # Application launcher
```

## 🔧 Configuration

Create `rag-system/.env`:
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
```

## 💬 Usage

- **Ask questions**: "How to configure Dynatrace monitoring?"
- **`index`**: Reindex documentation
- **`exit`**: Quit application

## 🏗️ Architecture

1. **MCP Server**: Crawls documentation sites
2. **Vector Store**: In-memory vector database with semantic search
3. **Azure OpenAI**: Context-aware responses and embeddings
4. **Chat UI**: Interactive console interface

## ✨ Features

- **No external dependencies**: Uses in-memory vector store
- **Multi-site search**: Dynatrace, Terraform, New Relic
- **Semantic search**: Vector similarity matching
- **Real-time chat**: Interactive Q&A interface

## 📚 Supported Documentation

- Dynatrace (docs.dynatrace.com)
- Terraform (registry.terraform.io)
- New Relic (docs.newrelic.com)