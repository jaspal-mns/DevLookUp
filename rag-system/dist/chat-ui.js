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
exports.ChatUI = void 0;
const readline = __importStar(require("readline"));
class ChatUI {
    constructor(ragSystem) {
        this.ragSystem = ragSystem;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    async start() {
        console.log('🤖 Documentation Assistant');
        console.log('Ask questions about Dynatrace, Terraform, or New Relic documentation');
        console.log('Type "exit" to quit, "index" to reindex documents\n');
        this.showPrompt();
    }
    showPrompt() {
        this.rl.question('You: ', async (input) => {
            const query = input.trim();
            if (query.toLowerCase() === 'exit') {
                console.log('Goodbye! 👋');
                this.rl.close();
                this.ragSystem.dispose();
                return;
            }
            if (query.toLowerCase() === 'index') {
                console.log('Indexing documents...');
                try {
                    await this.ragSystem.indexDocuments();
                    console.log('✅ Documents indexed successfully\n');
                }
                catch (error) {
                    console.error('❌ Failed to index documents:', error);
                }
                this.showPrompt();
                return;
            }
            if (!query) {
                this.showPrompt();
                return;
            }
            try {
                console.log('🤔 Thinking...');
                const response = await this.ragSystem.query(query);
                console.log(`\n🤖 Assistant: ${response}\n`);
            }
            catch (error) {
                console.error('❌ Error:', error);
            }
            this.showPrompt();
        });
    }
}
exports.ChatUI = ChatUI;
