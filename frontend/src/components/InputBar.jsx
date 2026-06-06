import { useState } from 'react'

export default function InputBar({ onSend, isLoading, isDisabled }) {
  const [question, setQuestion] = useState('')

  const handleSend = () => {
    if (!question.trim() || isLoading || isDisabled) return
    onSend(question.trim())
    setQuestion('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        borderTop: '1px solid #2a2a2a',
        padding: '12px 16px',
        backgroundColor: '#161616'
      }}
    >
      <div className="d-flex gap-2">
        <textarea
          rows={2}
          placeholder={isDisabled ? 'Upload a PDF first...' : 'Ask a question about your document...'}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled || isLoading}
          style={{
            flex: 1,
            resize: 'none',
            borderRadius: '10px',
            border: '1px solid #2a2a2a',
            backgroundColor: '#1e1e1e',
            color: '#e0e0e0',
            height: '38px',
            padding: '8px 12px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSend}
          disabled={isDisabled || isLoading || !question.trim()}
          style={{
            borderRadius: '10px',
            minWidth: '48px',
            backgroundColor: question.trim() && !isDisabled ? '#2f6feb' : '#2a2a2a',
            border: 'none',
            color: 'white',
            cursor: question.trim() && !isDisabled ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm text-light" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
          )}
        </button>
      </div>
      <p style={{ color: '#444', fontSize: '11px', marginTop: '6px', marginBottom: 0 }}>
        Enter to send • Shift+Enter for new line
      </p>
    </div>
  )
}