import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import Chat from './components/Chat';
import { getDocuments, type Document } from './api/client';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px'
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '30px'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  }
};

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = (doc: Document) => {
    setDocuments(prev => [...prev, doc]);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Document Analysis RAG</h1>
        <p style={styles.subtitle}>
          Upload PDFs and ask questions about their content using Claude
        </p>
      </header>

      <div style={styles.grid}>
        <div style={styles.sidebar}>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          <DocumentList
            documents={documents}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>
        <Chat hasDocuments={documents.length > 0} />
      </div>
    </div>
  );
}

export default App;
