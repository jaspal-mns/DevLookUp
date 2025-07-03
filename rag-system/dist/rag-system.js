"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGSystem = void 0;
const memory_vector_store_js_1 = require("./memory-vector-store.js");
const azure_openai_js_1 = require("./azure-openai.js");
const mcp_client_js_1 = require("./mcp-client.js");
class RAGSystem {
    constructor(azureEndpoint, azureApiKey, deploymentName, mcpServerPath) {
        this.useMemoryStore = false;
        this.openaiService = new azure_openai_js_1.AzureOpenAIService(azureEndpoint, azureApiKey, deploymentName);
        this.mcpClient = new mcp_client_js_1.McpClient(mcpServerPath);
        // Default to memory store (no ChromaDB dependency)
        this.vectorStore = new memory_vector_store_js_1.MemoryVectorStore(azureEndpoint, azureApiKey, deploymentName);
        this.useMemoryStore = true;
    }
    async initialize() {
        await this.vectorStore.initialize();
        await this.mcpClient.initialize();
    }
    async indexDocuments() {
        console.log('Crawling documentation...');
        // Crawl docs using MCP server
        await this.mcpClient.callTool('crawl_docs', { maxPages: 50 });
        // Search for all content to get documents
        const searchResult = await this.mcpClient.callTool('search_docs', {
            query: 'documentation',
            sites: ['all']
        });
        const searchData = JSON.parse(searchResult);
        const documents = searchData.map((result, index) => ({
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
    async query(question) {
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
    extractSiteFromTitle(title) {
        const match = title.match(/^\[([^\]]+)\]/);
        return match ? match[1].toLowerCase() : 'unknown';
    }
    dispose() {
        this.mcpClient.dispose();
    }
}
exports.RAGSystem = RAGSystem;
