import { useState } from 'react';
import Markdown from 'react-markdown';
import { sendQuestion, type ChatResponse } from '../api/client';

interface ChatProps {
  hasDocuments: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatResponse['sources'];
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '600px',
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
  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px'
  },
  message: {
    marginBottom: '15px',
    maxWidth: '85%'
  },
  userMessage: {
    marginLeft: 'auto',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '18px 18px 4px 18px'
  },
  assistantMessage: {
    backgroundColor: '#f1f1f1',
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 4px',
    lineHeight: '1.6'
  },
  markdown: {
    '& h1, & h2, & h3': {
      marginTop: '12px',
      marginBottom: '8px'
    },
    '& p': {
      margin: '8px 0'
    },
    '& ul, & ol': {
      marginLeft: '20px',
      marginBottom: '8px'
    },
    '& li': {
      marginBottom: '4px'
    },
    '& strong': {
      fontWeight: 600
    }
  },
  sources: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '12px'
  },
  sourcesTitle: {
    fontWeight: 'bold' as const,
    marginBottom: '5px',
    color: '#666'
  },
  sourceItem: {
    color: '#888',
    marginBottom: '5px'
  },
  inputArea: {
    display: 'flex',
    padding: '15px',
    borderTop: '1px solid #e0e0e0',
    gap: '10px'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none'
  },
  sendBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  sendBtnDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#888',
    textAlign: 'center' as const,
    padding: '20px'
  }
};

function Chat({ hasDocuments }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const response = await sendQuestion(question);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          sources: response.sources
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your question. Please try again.'
        }
      ]);
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Chat with Your Documents</h3>
      </div>

      <div style={styles.messages}>
        {messages.length === 0 ? (
          <div style={styles.empty}>
            {hasDocuments
              ? 'Ask a question about your uploaded documents'
              : 'Upload a document to start chatting'}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? { marginLeft: 'auto' } : {})
              }}
            >
              <div
                style={
                  msg.role === 'user'
                    ? styles.userMessage
                    : styles.assistantMessage
                }
              >
                {msg.role === 'assistant' ? (
                  <Markdown>{msg.content}</Markdown>
                ) : (
                  msg.content
                )}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div style={styles.sources}>
                  <div style={styles.sourcesTitle}>Sources:</div>
                  {msg.sources.map((s, j) => (
                    <div key={j} style={styles.sourceItem}>
                      {s.filename}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div style={styles.message}>
            <div style={styles.assistantMessage}>Thinking...</div>
          </div>
        )}
      </div>

      <form style={styles.inputArea} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            hasDocuments
              ? 'Ask a question about your documents...'
              : 'Upload a document first...'
          }
          disabled={!hasDocuments || loading}
        />
        <button
          type="submit"
          style={{
            ...styles.sendBtn,
            ...(!hasDocuments || loading || !input.trim()
              ? styles.sendBtnDisabled
              : {})
          }}
          disabled={!hasDocuments || loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
