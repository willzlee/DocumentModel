import { useState, useRef } from 'react';
import { uploadDocument, type Document } from '../api/client';

interface FileUploadProps {
  onUploadSuccess: (doc: Document) => void;
}

const styles = {
  container: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '30px',
    textAlign: 'center' as const,
    backgroundColor: '#fafafa',
    transition: 'all 0.2s ease'
  },
  containerDragOver: {
    borderColor: '#007bff',
    backgroundColor: '#f0f7ff'
  },
  icon: {
    fontSize: '48px',
    marginBottom: '10px'
  },
  text: {
    color: '#666',
    marginBottom: '15px'
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  input: {
    display: 'none'
  },
  error: {
    color: '#dc3545',
    marginTop: '10px',
    fontSize: '14px'
  },
  success: {
    color: '#28a745',
    marginTop: '10px',
    fontSize: '14px'
  }
};

function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const doc = await uploadDocument(file);
      setSuccess(`Uploaded "${doc.filename}" (${doc.chunkCount} chunks)`);
      onUploadSuccess(doc);
    } catch (err) {
      setError('Failed to upload document. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(isDragOver ? styles.containerDragOver : {})
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div style={styles.icon}>📄</div>
      <p style={styles.text}>
        {uploading ? 'Processing document...' : 'Drag & drop a PDF here'}
      </p>
      <button
        style={{
          ...styles.button,
          ...(uploading ? styles.buttonDisabled : {})
        }}
        onClick={handleClick}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Select File'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={styles.input}
        onChange={handleInputChange}
      />
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
    </div>
  );
}

export default FileUpload;
