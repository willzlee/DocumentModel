import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPdf, chunkText } from '../services/pdf.js';
import { addDocumentChunks, deleteDocumentChunks } from '../services/vectorStore.js';
import type { Document, DocumentChunk } from '../types/index.js';

const router = Router();

// In-memory document store (in production, use a database)
const documents: Map<string, Document> = new Map();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload and process a PDF
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const documentId = uuidv4();

    // Extract text from PDF
    const text = await extractTextFromPdf(filePath);

    // Chunk the text
    const textChunks = chunkText(text);

    // Create document chunks with metadata
    const chunks: DocumentChunk[] = textChunks.map((content, index) => ({
      id: `${documentId}-chunk-${index}`,
      content,
      metadata: {
        documentId,
        filename: originalName,
        chunkIndex: index,
        totalChunks: textChunks.length
      }
    }));

    // Add chunks to vector store
    await addDocumentChunks(chunks);

    // Store document metadata
    const document: Document = {
      id: documentId,
      filename: originalName,
      uploadedAt: new Date(),
      chunkCount: chunks.length
    };
    documents.set(documentId, document);

    res.json({
      message: 'Document uploaded and processed successfully',
      document
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// List all documents
router.get('/', (req, res) => {
  const docs = Array.from(documents.values());
  res.json(docs);
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.get(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Remove chunks from vector store
    await deleteDocumentChunks(id);

    // Remove from document store
    documents.delete(id);

    // Try to delete the file (best effort)
    try {
      const files = await fs.readdir('uploads');
      for (const file of files) {
        if (file.startsWith(id)) {
          await fs.unlink(path.join('uploads', file));
          break;
        }
      }
    } catch {
      // File may already be deleted
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
