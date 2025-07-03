import { AzureOpenAIService } from './azure-openai.js';

export interface Document {
  id: string;
  content: string;
  metadata: {
    title: string;
    url: string;
    site: string;
  };
  embedding?: number[];
}

export class MemoryVectorStore {
  private documents: Document[] = [];
  private openaiService: AzureOpenAIService;

  constructor(azureEndpoint: string, azureApiKey: string, deploymentName: string) {
    this.openaiService = new AzureOpenAIService(azureEndpoint, azureApiKey, deploymentName);
  }

  async initialize(): Promise<void> {
    console.log('Using in-memory vector store');
  }

  async addDocuments(documents: Document[]): Promise<void> {
    for (const doc of documents) {
      doc.embedding = await this.openaiService.generateEmbedding(doc.content);
      this.documents.push(doc);
    }
  }

  async search(query: string, nResults: number = 5): Promise<Document[]> {
    if (this.documents.length === 0) return [];

    const queryEmbedding = await this.openaiService.generateEmbedding(query);
    
    const similarities = this.documents.map(doc => ({
      document: doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding!)
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, nResults)
      .map(item => item.document);
  }

  async clear(): Promise<void> {
    this.documents = [];
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}