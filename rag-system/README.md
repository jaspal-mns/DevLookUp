# Documentation RAG System

RAG (Retrieval-Augmented Generation) system using Azure OpenAI and ChromaDB for querying documentation.

## Setup

1. **Install ChromaDB**:
   ```bash
   pip install chromadb
   chroma run --host localhost --port 8000
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Azure OpenAI credentials
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   npm run build
   ```

## Usage

```bash
npm start
```

## Commands

- **Ask questions**: Type any question about documentation
- **`index`**: Reindex documentation from MCP server
- **`exit`**: Quit the application

## Example Queries

- "How do I configure Dynatrace monitoring?"
- "What are Terraform providers?"
- "How to set up New Relic alerts?"