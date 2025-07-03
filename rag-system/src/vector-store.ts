// This file is kept for interface compatibility but not used
// The system uses MemoryVectorStore instead

export interface Document {
  id: string;
  content: string;
  metadata: {
    title: string;
    url: string;
    site: string;
  };
}