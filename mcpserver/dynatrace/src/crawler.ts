import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import * as fs from 'fs';
import * as path from 'path';

interface DocPage {
  url: string;
  title: string;
  content: string;
  links: string[];
}

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  relevance: number;
}

interface DocSite {
  name: string;
  baseUrl: string;
  allowedDomains: string[];
}

export class MultiDocsCrawler {
  private docSites: DocSite[] = [
    {
      name: 'dynatrace',
      baseUrl: 'https://docs.dynatrace.com/docs',
      allowedDomains: ['docs.dynatrace.com']
    },
    {
      name: 'terraform',
      baseUrl: 'https://registry.terraform.io/providers',
      allowedDomains: ['registry.terraform.io', 'developer.hashicorp.com']
    },
    {
      name: 'newrelic',
      baseUrl: 'https://docs.newrelic.com',
      allowedDomains: ['docs.newrelic.com']
    }
  ];
  private crawledPages = new Map<string, DocPage>();
  private visitedUrls = new Set<string>();
  private cacheFile = path.join(__dirname, '..', 'docs-cache.json');
  private initialized = false;

  addDocSite(name: string, baseUrl: string, allowedDomains: string[]): void {
    this.docSites.push({ name, baseUrl, allowedDomains });
  }

  async crawlDocs(maxPages: number = 100, siteName?: string): Promise<{ pagesProcessed: number; totalLinks: number }> {
    const sitesToCrawl = siteName 
      ? this.docSites.filter(s => s.name === siteName)
      : this.docSites;
    
    const queue = sitesToCrawl.map(s => s.baseUrl);
    let pagesProcessed = 0;
    let totalLinks = 0;

    while (queue.length > 0 && pagesProcessed < maxPages) {
      const url = queue.shift()!;
      
      if (this.visitedUrls.has(url)) continue;
      this.visitedUrls.add(url);

      try {
        const page = await this.crawlPage(url);
        this.crawledPages.set(url, page);
        
        // Add new links to queue
        for (const link of page.links) {
          if (!this.visitedUrls.has(link) && this.isValidDocsUrl(link)) {
            queue.push(link);
          }
        }
        
        pagesProcessed++;
        totalLinks += page.links.length;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
      }
    }

    await this.saveCache();
    return { pagesProcessed, totalLinks };
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.loadCache();
      this.initialized = true;
    }
  }

  private async loadCache(): Promise<void> {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        this.crawledPages = new Map(data.pages || []);
        this.visitedUrls = new Set(data.urls || []);
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const data = {
        pages: Array.from(this.crawledPages.entries()),
        urls: Array.from(this.visitedUrls),
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  async crawlPage(url: string): Promise<DocPage> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DynatraceMCPBot/1.0)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    
    // Extract title
    const title = $('title').text() || $('h1').first().text() || 'Untitled';
    
    // Extract main content
    const content = this.extractContent($);
    
    // Extract links
    const links = this.extractLinks($, url);

    return { url, title, content, links };
  }

  private extractContent($: cheerio.CheerioAPI): string {
    // Remove navigation, footer, and other non-content elements
    $('nav, footer, .sidebar, .toc, script, style').remove();
    
    // Focus on main content areas
    const contentSelectors = [
      'main',
      '.content',
      '.documentation',
      'article',
      '.main-content'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }
    
    // Fallback to body if no specific content area found
    if (!content) {
      content = $('body').text();
    }
    
    // Clean up whitespace
    return content.replace(/\s+/g, ' ').trim();
  }

  private extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];
    
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).toString();
          if (this.isValidDocsUrl(absoluteUrl)) {
            links.push(absoluteUrl);
          }
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });
    
    return [...new Set(links)]; // Remove duplicates
  }

  private isValidDocsUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return this.docSites.some(site => 
        site.allowedDomains.includes(parsedUrl.hostname)
      );
    } catch {
      return false;
    }
  }

  async search(query: string, sites: string[] = ['all']): Promise<SearchResult[]> {
    await this.ensureInitialized();
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    
    const targetSites = sites.includes('all') 
      ? this.docSites.map(s => s.name)
      : sites;
    
    for (const [url, page] of this.crawledPages) {
      const siteName = this.getSiteNameFromUrl(url);
      if (!targetSites.includes(siteName)) continue;
      
      const titleMatch = page.title.toLowerCase().includes(queryLower);
      const contentMatch = page.content.toLowerCase().includes(queryLower);
      
      if (titleMatch || contentMatch) {
        const relevance = this.calculateRelevance(query, page);
        const snippet = this.extractSnippet(query, page.content);
        
        results.push({
          url,
          title: `[${siteName.toUpperCase()}] ${page.title}`,
          snippet,
          relevance,
        });
      }
    }
    
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  private calculateRelevance(query: string, page: DocPage): number {
    const queryLower = query.toLowerCase();
    const titleLower = page.title.toLowerCase();
    const contentLower = page.content.toLowerCase();
    
    let score = 0;
    
    // Title matches are more important
    if (titleLower.includes(queryLower)) {
      score += 10;
    }
    
    // Count occurrences in content
    const matches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
    score += matches;
    
    // Boost score for exact matches
    if (titleLower === queryLower) {
      score += 20;
    }
    
    return score;
  }

  private extractSnippet(query: string, content: string, maxLength: number = 200): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(queryLower);
    
    if (index === -1) {
      return content.substring(0, maxLength) + '...';
    }
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 150);
    
    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }

  async getPageContent(url: string): Promise<string> {
    await this.ensureInitialized();
    if (this.crawledPages.has(url)) {
      return this.crawledPages.get(url)!.content;
    }
    
    try {
      const page = await this.crawlPage(url);
      this.crawledPages.set(url, page);
      return page.content;
    } catch (error) {
      throw new Error(`Failed to fetch page content: ${error}`);
    }
  }

  private getSiteNameFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const site = this.docSites.find(s => 
        s.allowedDomains.includes(parsedUrl.hostname)
      );
      return site?.name || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}