import { spawn, ChildProcess } from 'child_process';

export class McpClient {
  private process: ChildProcess | null = null;
  private requestId = 1;

  constructor(private serverPath: string) {}

  async initialize(): Promise<void> {
    this.process = spawn('node', [this.serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Initialize MCP connection
    const initRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'rag-client', version: '1.0.0' }
      }
    };

    await this.sendRequest(initRequest);
  }

  async callTool(toolName: string, args: any): Promise<string> {
    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    return await this.sendRequest(request);
  }

  private async sendRequest(request: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        reject(new Error('MCP process not initialized'));
        return;
      }

      const requestJson = JSON.stringify(request) + '\n';
      this.process.stdin?.write(requestJson);

      this.process.stdout?.once('data', (data) => {
        const response = data.toString().trim();
        // Filter out server startup messages
        if (response.includes('MCP server running')) {
          resolve('{}'); // Return empty response for startup messages
        } else {
          resolve(response);
        }
      });

      setTimeout(() => resolve('{}'), 1000); // Timeout fallback
    });
  }

  dispose(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}