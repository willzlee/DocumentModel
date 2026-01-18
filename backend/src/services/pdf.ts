import pdf from 'pdf-parse';
import fs from 'fs/promises';

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

export async function extractTextFromPdf(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

export function chunkText(text: string): string[] {
  const chunks: string[] = [];

  // Clean up the text
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanedText.length <= CHUNK_SIZE) {
    return [cleanedText];
  }

  let start = 0;
  while (start < cleanedText.length) {
    let end = start + CHUNK_SIZE;

    // Try to break at a sentence or word boundary
    if (end < cleanedText.length) {
      const lastPeriod = cleanedText.lastIndexOf('.', end);
      const lastSpace = cleanedText.lastIndexOf(' ', end);

      if (lastPeriod > start + CHUNK_SIZE / 2) {
        end = lastPeriod + 1;
      } else if (lastSpace > start + CHUNK_SIZE / 2) {
        end = lastSpace;
      }
    }

    chunks.push(cleanedText.slice(start, end).trim());
    start = end - CHUNK_OVERLAP;

    // Prevent infinite loop
    if (start >= cleanedText.length - CHUNK_OVERLAP) {
      break;
    }
  }

  return chunks.filter(chunk => chunk.length > 0);
}
