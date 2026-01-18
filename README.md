# Document Analysis RAG

A document analysis application using RAG (Retrieval Augmented Generation) with Claude. Upload PDFs and ask questions about their content.

## Features

- **PDF Upload**: Drag-and-drop or click to upload PDF documents
- **Smart Chunking**: Documents are automatically split into searchable chunks with overlap for context preservation
- **Semantic Search**: TF-IDF based retrieval finds the most relevant document sections for your questions
- **AI-Powered Analysis**: Claude analyzes retrieved content and provides insightful, structured answers
- **Source Citations**: See which documents were used to generate each response
- **Markdown Rendering**: Responses display with proper formatting (headings, lists, bold text)

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, Vite
- **LLM**: Claude (via Anthropic API)
- **Vector Store**: In-memory TF-IDF (no external database required)

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` folder:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Use the App

1. Open http://localhost:5173 in your browser
2. Upload a PDF using drag-and-drop or the file picker
3. Wait for processing (document is chunked and indexed)
4. Ask questions about your document in the chat interface
5. View AI-generated insights with source citations

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload and process a PDF |
| GET | `/api/documents` | List all uploaded documents |
| DELETE | `/api/documents/:id` | Remove a document |
| POST | `/api/chat` | Ask a question about documents |
| GET | `/health` | Health check |

## Project Structure

```
DocumentModel/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express server
│   │   ├── routes/
│   │   │   ├── documents.ts   # Upload/list/delete endpoints
│   │   │   └── chat.ts        # Question answering endpoint
│   │   ├── services/
│   │   │   ├── pdf.ts         # PDF text extraction & chunking
│   │   │   ├── vectorStore.ts # TF-IDF search implementation
│   │   │   └── claude.ts      # Claude API integration
│   │   └── types/
│   └── uploads/               # Uploaded PDF storage
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   └── Chat.tsx
│   │   └── api/
│       └── client.ts
└── README.md
```

## Notes

- Documents are stored in memory and will be lost when the server restarts
- Maximum file size: 10MB
- Supported format: PDF only
- The vector store uses TF-IDF for retrieval (no external vector database needed)
