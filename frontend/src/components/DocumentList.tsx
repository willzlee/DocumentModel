import { useState } from 'react';
import { deleteDocument, type Document } from '../api/client';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    overflow: 'hidden'
  },
  header: {
    padding: '15px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    color: '#333'
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    maxHeight: '300px',
    overflowY: 'auto' as const
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 15px',
    borderBottom: '1px solid #f0f0f0'
  },
  itemInfo: {
    overflow: 'hidden'
  },
  filename: {
    fontSize: '14px',
    color: '#333',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  meta: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px'
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    padding: '5px 10px',
    fontSize: '14px'
  },
  empty: {
    padding: '30px',
    textAlign: 'center' as const,
    color: '#888'
  }
};

function DocumentList({ documents, loading, onDelete }: DocumentListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteDocument(id);
      onDelete(id);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Uploaded Documents ({documents.length})</h3>
      </div>

      {loading ? (
        <div style={styles.empty}>Loading...</div>
      ) : documents.length === 0 ? (
        <div style={styles.empty}>No documents uploaded yet</div>
      ) : (
        <ul style={styles.list}>
          {documents.map(doc => (
            <li key={doc.id} style={styles.item}>
              <div style={styles.itemInfo}>
                <div style={styles.filename}>{doc.filename}</div>
                <div style={styles.meta}>{doc.chunkCount} chunks</div>
              </div>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(doc.id)}
                disabled={deleting === doc.id}
              >
                {deleting === doc.id ? '...' : '✕'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DocumentList;
