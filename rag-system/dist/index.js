"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const rag_system_js_1 = require("./rag-system.js");
const chat_ui_js_1 = require("./chat-ui.js");
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
        const ragSystem = new rag_system_js_1.RAGSystem(azureEndpoint, azureApiKey, deploymentName, mcpServerPath);
        await ragSystem.initialize();
        console.log('Starting chat interface...');
        const chatUI = new chat_ui_js_1.ChatUI(ragSystem);
        await chatUI.start();
    }
    catch (error) {
        console.error('Failed to start RAG system:', error);
        process.exit(1);
    }
}
main().catch(console.error);
