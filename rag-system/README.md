# Documentation RAG System

RAG (Retrieval-Augmented Generation) system using Azure OpenAI and in-memory vector storage for querying documentation.

## Setup

1. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Azure OpenAI credentials
   ```

2. **Install Dependencies**:
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