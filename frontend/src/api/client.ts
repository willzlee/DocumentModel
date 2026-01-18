import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export interface Document {
  id: string;
  filename: string;
  uploadedAt: string;
  chunkCount: number;
}

export interface ChatResponse {
  answer: string;
  sources: Array<{
    filename: string;
    content: string;
  }>;
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ document: Document }>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.document;
}

export async function getDocuments(): Promise<Document[]> {
  const response = await api.get<Document[]>('/documents');
  return response.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export async function sendQuestion(question: string): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>('/chat', { question });
  return response.data;
}
