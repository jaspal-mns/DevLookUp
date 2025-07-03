"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryVectorStore = void 0;
const azure_openai_js_1 = require("./azure-openai.js");
class MemoryVectorStore {
    constructor(azureEndpoint, azureApiKey, deploymentName) {
        this.documents = [];
        this.openaiService = new azure_openai_js_1.AzureOpenAIService(azureEndpoint, azureApiKey, deploymentName);
    }
    async initialize() {
        console.log('Using in-memory vector store');
    }
    async addDocuments(documents) {
        for (const doc of documents) {
            doc.embedding = await this.openaiService.generateEmbedding(doc.content);
            this.documents.push(doc);
        }
    }
    async search(query, nResults = 5) {
        if (this.documents.length === 0)
            return [];
        const queryEmbedding = await this.openaiService.generateEmbedding(query);
        const similarities = this.documents.map(doc => ({
            document: doc,
            similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
        }));
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, nResults)
            .map(item => item.document);
    }
    async clear() {
        this.documents = [];
    }
    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
}
exports.MemoryVectorStore = MemoryVectorStore;
