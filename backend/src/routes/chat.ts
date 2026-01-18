import { Router } from 'express';
import { queryDocuments } from '../services/vectorStore.js';
import { queryWithContext } from '../services/claude.js';

const router = Router();

// Query documents with a question
router.post('/', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Retrieve relevant document chunks
    const relevantChunks = await queryDocuments(question, 5);

    if (relevantChunks.length === 0) {
      return res.json({
        answer: 'No documents have been uploaded yet. Please upload a PDF document first.',
        sources: []
      });
    }

    // Query Claude with the context
    const answer = await queryWithContext(question, relevantChunks);

    // Extract unique sources
    const sources = relevantChunks.map(chunk => ({
      filename: chunk.metadata.filename as string,
      content: chunk.content.substring(0, 200) + '...'
    }));

    res.json({
      answer,
      sources
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

export default router;
