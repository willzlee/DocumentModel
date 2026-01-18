import type { DocumentChunk } from '../types/index.js';

// Simple in-memory vector store with TF-IDF-like similarity
// No external server required

interface StoredChunk {
  id: string;
  content: string;
  metadata: {
    documentId: string;
    filename: string;
    chunkIndex: number;
    totalChunks: number;
  };
  terms: Map<string, number>; // term -> TF-IDF score
}

const chunks: Map<string, StoredChunk> = new Map();
const documentFrequency: Map<string, number> = new Map();

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize by document length
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

function updateDocumentFrequency(terms: Set<string>): void {
  for (const term of terms) {
    documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
  }
}

function computeTFIDF(tf: Map<string, number>, totalDocs: number): Map<string, number> {
  const tfidf = new Map<string, number>();
  for (const [term, tfScore] of tf) {
    const df = documentFrequency.get(term) || 1;
    const idf = Math.log(totalDocs / df) + 1;
    tfidf.set(term, tfScore * idf);
  }
  return tfidf;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, score] of a) {
    normA += score * score;
    if (b.has(term)) {
      dotProduct += score * b.get(term)!;
    }
  }

  for (const [, score] of b) {
    normB += score * score;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function initializeVectorStore(): Promise<void> {
  console.log('In-memory vector store initialized');
}

export async function addDocumentChunks(newChunks: DocumentChunk[]): Promise<void> {
  // First pass: compute TF and update document frequency
  const chunkTerms: Array<{ chunk: DocumentChunk; tf: Map<string, number> }> = [];

  for (const chunk of newChunks) {
    const tokens = tokenize(chunk.content);
    const tf = computeTF(tokens);
    const uniqueTerms = new Set(tf.keys());
    updateDocumentFrequency(uniqueTerms);
    chunkTerms.push({ chunk, tf });
  }

  // Second pass: compute TF-IDF and store
  const totalDocs = chunks.size + newChunks.length;
  for (const { chunk, tf } of chunkTerms) {
    const tfidf = computeTFIDF(tf, totalDocs);
    chunks.set(chunk.id, {
      id: chunk.id,
      content: chunk.content,
      metadata: chunk.metadata,
      terms: tfidf
    });
  }
}

export async function queryDocuments(
  query: string,
  nResults: number = 5
): Promise<Array<{ content: string; metadata: Record<string, unknown> }>> {
  if (chunks.size === 0) {
    return [];
  }

  const queryTokens = tokenize(query);
  const queryTF = computeTF(queryTokens);
  const queryTFIDF = computeTFIDF(queryTF, chunks.size);

  // Compute similarity with all chunks
  const similarities: Array<{ chunk: StoredChunk; score: number }> = [];
  for (const chunk of chunks.values()) {
    const score = cosineSimilarity(queryTFIDF, chunk.terms);
    similarities.push({ chunk, score });
  }

  // Sort by similarity and return top results
  similarities.sort((a, b) => b.score - a.score);

  return similarities.slice(0, nResults).map(({ chunk }) => ({
    content: chunk.content,
    metadata: chunk.metadata
  }));
}

export async function deleteDocumentChunks(documentId: string): Promise<void> {
  const toDelete: string[] = [];
  for (const [id, chunk] of chunks) {
    if (chunk.metadata.documentId === documentId) {
      toDelete.push(id);
    }
  }
  for (const id of toDelete) {
    chunks.delete(id);
  }
}

export async function getCollectionCount(): Promise<number> {
  return chunks.size;
}
