#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MultiDocsCrawler } from './crawler.js';

class MultiDocsServer {
  private server: Server;
  private crawler: MultiDocsCrawler;

  constructor() {
    this.server = new Server(
      {
        name: 'multi-docs-mcp-server',
        version: '1.0.0',
      }
    );

    this.crawler = new MultiDocsCrawler();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_docs',
            description: 'Search documentation for specific topics',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for documentation',
                },
                sites: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['dynatrace', 'terraform', 'newrelic', 'all']
                  },
                  description: 'Sites to search (default: ["all"])',
                  default: ['all']
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_page_content',
            description: 'Get content from a specific documentation page',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL of the documentation page',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'crawl_docs',
            description: 'Crawl and index documentation (admin operation)',
            inputSchema: {
              type: 'object',
              properties: {
                maxPages: {
                  type: 'number',
                  description: 'Maximum number of pages to crawl (default: 100)',
                },
                siteName: {
                  type: 'string',
                  description: 'Optional: specific site to crawl',
                },
              },
            },
          },
          {
            name: 'add_doc_site',
            description: 'Add a new documentation site to crawl',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name identifier for the site',
                },
                baseUrl: {
                  type: 'string',
                  description: 'Base URL to start crawling from',
                },
                allowedDomains: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Allowed domains for this site',
                },
              },
              required: ['name', 'baseUrl', 'allowedDomains'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_docs':
            return await this.handleSearchDocs(args?.query as string, args?.sites as string[] || ['all']);
          
          case 'get_page_content':
            return await this.handleGetPage(args?.url as string);
          
          case 'crawl_docs':
            return await this.handleCrawlDocs(args?.maxPages as number, args?.siteName as string);
          
          case 'add_doc_site':
            return await this.handleAddDocSite(args?.name as string, args?.baseUrl as string, args?.allowedDomains as string[]);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async handleSearchDocs(query: string, sites: string[] = ['all']) {
    const results = await this.crawler.search(query, sites);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  private async handleGetPage(url: string) {
    const content = await this.crawler.getPageContent(url);
    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  }

  private async handleCrawlDocs(maxPages: number = 100, siteName?: string) {
    const result = await this.crawler.crawlDocs(maxPages, siteName);
    return {
      content: [
        {
          type: 'text',
          text: `Crawled ${result.pagesProcessed} pages. Found ${result.totalLinks} links.`,
        },
      ],
    };
  }

  private async handleAddDocSite(name: string, baseUrl: string, allowedDomains: string[]) {
    this.crawler.addDocSite(name, baseUrl, allowedDomains);
    return {
      content: [
        {
          type: 'text',
          text: `Added documentation site: ${name} (${baseUrl})`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Dynatrace Docs MCP server running on stdio');
  }
}

const server = new MultiDocsServer();
server.run().catch(console.error);