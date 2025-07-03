import * as dotenv from 'dotenv';
import * as path from 'path';
import { RAGSystem } from './rag-system.js';
import { ChatUI } from './chat-ui.js';

// Load .env from rag-system directory
dotenv.config();

console.log('Current directory:', process.cwd());
console.log('Environment variables:');
console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT);
console.log('AZURE_OPENAI_API_KEY exists:', !!process.env.AZURE_OPENAI_API_KEY);
console.log('AZURE_OPENAI_DEPLOYMENT_NAME:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);

async function main() {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
  const mcpServerPath = '../mcpserver/dynatrace/dist/index.js';

  if (!azureEndpoint || !azureApiKey) {
    console.error('Missing Azure OpenAI configuration. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY');
    process.exit(1);
  }

  try {
    console.log('Initializing RAG system...');
    const ragSystem = new RAGSystem(azureEndpoint, azureApiKey, deploymentName, mcpServerPath);
    await ragSystem.initialize();
    
    console.log('Starting chat interface...');
    const chatUI = new ChatUI(ragSystem);
    await chatUI.start();
  } catch (error) {
    console.error('Failed to start RAG system:', error);
    process.exit(1);
  }
}

main().catch(console.error);