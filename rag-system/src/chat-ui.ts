import * as readline from 'readline';
import { RAGSystem } from './rag-system.js';

export class ChatUI {
  private rl: readline.Interface;
  private ragSystem: RAGSystem;

  constructor(ragSystem: RAGSystem) {
    this.ragSystem = ragSystem;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start(): Promise<void> {
    console.log('🤖 Documentation Assistant');
    console.log('Ask questions about Dynatrace, Terraform, or New Relic documentation');
    console.log('Type "exit" to quit, "index" to reindex documents\n');

    this.showPrompt();
  }

  private showPrompt(): void {
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
        } catch (error) {
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
      } catch (error) {
        console.error('❌ Error:', error);
      }

      this.showPrompt();
    });
  }
}