"use strict";
// Using require for ChromaDB
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStore = void 0;
class VectorStore {
    constructor(azureEndpoint, azureApiKey) {
        this.azureEndpoint = azureEndpoint;
        this.azureApiKey = azureApiKey;
        const { ChromaApi } = require('chromadb');
        this.client = new ChromaApi({ path: 'http://localhost:8000' });
    }
    async initialize() {
        try {
            this.collection = await this.client.getOrCreateCollection({
                name: 'docs_collection'
            });
        }
        catch (error) {
            console.error('Failed to initialize vector store:', error);
            throw error;
        }
    }
    async addDocuments(documents) {
        const ids = documents.map(doc => doc.id);
        const contents = documents.map(doc => doc.content);
        const metadatas = documents.map(doc => doc.metadata);
        await this.collection.add({
            ids,
            documents: contents,
            metadatas
        });
    }
    async search(query, nResults = 5) {
        const results = await this.collection.query({
            queryTexts: [query],
            nResults
        });
        return results.ids[0].map((id, index) => ({
            id,
            content: results.documents[0][index],
            metadata: results.metadatas[0][index]
        }));
    }
    async clear() {
        await this.client.deleteCollection({ name: 'docs_collection' });
    }
}
exports.VectorStore = VectorStore;
