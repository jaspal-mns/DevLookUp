import { Document } from './vector-store.js';
import { MemoryVectorStore } from './memory-vector-store.js';
import { AzureOpenAIService } from './azure-openai.js';
import { McpClient } from './mcp-client.js';

export class RAGSystem {
  private vectorStore: MemoryVectorStore;
  private openaiService: AzureOpenAIService;
  private mcpClient: McpClient;
  private useMemoryStore: boolean = false;

  constructor(
    azureEndpoint: string,
    azureApiKey: string,
    deploymentName: string,
    mcpServerPath: string
  ) {
    this.openaiService = new AzureOpenAIService(azureEndpoint, azureApiKey, deploymentName);
    this.mcpClient = new McpClient(mcpServerPath);
    
    // Default to memory store (no ChromaDB dependency)
    this.vectorStore = new MemoryVectorStore(azureEndpoint, azureApiKey, deploymentName);
    this.useMemoryStore = true;
  }

  async initialize(): Promise<void> {
    await this.vectorStore.initialize();
    await this.mcpClient.initialize();
  }

  async indexDocuments(): Promise<void> {
    console.log('Crawling documentation...');
    
    // Crawl docs using MCP server
    await this.mcpClient.callTool('crawl_docs', { maxPages: 50 });
    
    // Search for all content to get documents
    const searchResult = await this.mcpClient.callTool('search_docs', { 
      query: 'documentation', 
      sites: ['all'] 
    });
    
    const searchData = JSON.parse(searchResult);
    const documents: Document[] = searchData.map((result: any, index: number) => ({
      id: `doc_${index}`,
      content: `${result.title}\n\n${result.snippet}`,
      metadata: {
        title: result.title,
        url: result.url,
        site: this.extractSiteFromTitle(result.title)
      }
    }));

    console.log(`Indexing ${documents.length} documents...`);
    await this.vectorStore.addDocuments(documents);
    console.log('Documents indexed successfully');
  }

  async query(question: string): Promise<string> {
    // Search for relevant documents
    const relevantDocs = await this.vectorStore.search(question, 3);
    
    // Build context from relevant documents
    const context = relevantDocs
      .map(doc => `[${doc.metadata.site}] ${doc.metadata.title}\n${doc.content}`)
      .join('\n\n---\n\n');

    // Generate response using Azure OpenAI
    const response = await this.openaiService.generateResponse(question, context);
    
    return response;
  }

  private extractSiteFromTitle(title: string): string {
    const match = title.match(/^\[([^\]]+)\]/);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  dispose(): void {
    this.mcpClient.dispose();
  }
}