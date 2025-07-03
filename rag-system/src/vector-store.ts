// Using require for ChromaDB

export interface Document {
  id: string;
  content: string;
  metadata: {
    title: string;
    url: string;
    site: string;
  };
}

export class VectorStore {
  private client: any;
  private collection: any;

  constructor(private azureEndpoint: string, private azureApiKey: string) {
    const { ChromaApi } = require('chromadb');
    this.client = new ChromaApi({ path: 'http://localhost:8000' });
  }

  async initialize(): Promise<void> {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: 'docs_collection'
      });
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      throw error;
    }
  }

  async addDocuments(documents: Document[]): Promise<void> {
    const ids = documents.map(doc => doc.id);
    const contents = documents.map(doc => doc.content);
    const metadatas = documents.map(doc => doc.metadata);

    await this.collection.add({
      ids,
      documents: contents,
      metadatas
    });
  }

  async search(query: string, nResults: number = 5): Promise<Document[]> {
    const results = await this.collection.query({
      queryTexts: [query],
      nResults
    });

    return results.ids[0].map((id: string, index: number) => ({
      id,
      content: results.documents[0][index],
      metadata: results.metadatas[0][index]
    }));
  }

  async clear(): Promise<void> {
    await this.client.deleteCollection({ name: 'docs_collection' });
  }
}