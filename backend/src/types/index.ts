export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    documentId: string;
    filename: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

export interface Document {
  id: string;
  filename: string;
  uploadedAt: Date;
  chunkCount: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QueryResult {
  answer: string;
  sources: Array<{
    filename: string;
    content: string;
  }>;
}
