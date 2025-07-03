import OpenAI from 'openai';

export class AzureOpenAIService {
  private client: OpenAI;
  private deploymentName: string;

  constructor(endpoint: string, apiKey: string, deploymentName: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: `${endpoint}/openai/deployments/${deploymentName}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: {
        'api-key': apiKey,
      },
    });
    this.deploymentName = deploymentName;
  }

  async generateResponse(prompt: string, context: string): Promise<string> {
    const systemMessage = `You are a helpful assistant that answers questions based on the provided documentation context. 
Use only the information from the context to answer questions. If the context doesn't contain relevant information, say so.

Context:
${context}`;

    const response = await this.client.chat.completions.create({
      model: this.deploymentName,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content || 'No response generated';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    return response.data[0].embedding;
  }
}