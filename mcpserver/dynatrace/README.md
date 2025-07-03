# Dynatrace Documentation MCP Server

An MCP (Model Context Protocol) server that crawls and indexes Dynatrace documentation to help developers with queries.

## Features

- **Web Crawling**: Crawls all pages under https://docs.dynatrace.com/docs
- **Content Search**: Search through crawled documentation content
- **Page Retrieval**: Get specific page content by URL
- **Rate Limited**: Respectful crawling with built-in delays

## Installation

```bash
cd mcpserver
npm install
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

### Available Tools

1. **search_dynatrace_docs**: Search documentation for specific topics
2. **get_dynatrace_page**: Get content from a specific documentation page
3. **crawl_dynatrace_docs**: Crawl and index documentation (admin operation)

### Integration with MCP Clients

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "dynatrace-docs": {
      "command": "node",
      "args": ["/path/to/mcpserver/dist/index.js"]
    }
  }
}
```

## Development

```bash
npm run dev
```

## Example Queries

- "How to configure synthetic monitoring?"
- "API authentication methods"
- "Dashboard creation guide"