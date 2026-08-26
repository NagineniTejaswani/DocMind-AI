

import { useState, useRef } from 'react'
import { uploadPDF } from '../api/useApi'
import document from '../assets/document.png'

export default function UploadZone({ onUploadSuccess, onError }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const fileInputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return

    if (!file.name.endsWith('.pdf')) {
      onError('Only PDF files are accepted.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File too large. Maximum size is 10MB.')
      return
    }

    setIsUploading(true)
    setProgress('Uploading PDF...')

    try {
      setProgress('Processing and storing chunks...')
      const result = await uploadPDF(file)
      setProgress('')
      setIsUploading(false)
      onUploadSuccess(result)
    } catch (error) {
      setProgress('')
      setIsUploading(false)
      onError(error.message)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        backgroundColor: '#0f0f0f'
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%', padding: '0 24px' }}>
        <img src={document} alt="Document" style={{ marginBottom: '16px', width: '50px', height: '50px' }} />
        <h2 style={{ color: '#ffffff', fontWeight: '600', marginBottom: '8px' }}>DocMind AI</h2>
        <p style={{ color: '#555', marginBottom: '32px', fontSize: '14px' }}>
          Upload a PDF and start asking questions about it
        </p>

        <div onDrop={handleDrop} onDragOver={handleDragOver}  onDragLeave={handleDragLeave} onClick={() => !isUploading && fileInputRef.current.click()}
          style={{
            border: `2px dashed ${isDragging ? '#2f6feb' : '#2a2a2a'}`,
            borderRadius: '12px',
            padding: '48px 24px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            backgroundColor: isDragging ? '#1a2a3a' : '#161616',
            transition: 'all 0.2s'
          }}
        >
          {isUploading ? (
            <div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid #2a2a2a',
                  borderTop: '3px solid #2f6feb',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto'
                }}
              />
              <p style={{ color: '#7c9ef8', marginTop: '16px', marginBottom: 0, fontSize: '14px' }}>
                {progress}
              </p>
            </div>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
              <p style={{ color: '#888', fontWeight: '500', marginBottom: '4px', fontSize: '14px' }}>
                Drag and drop your PDF here
              </p>
              <p style={{ color: '#444', fontSize: '12px', marginBottom: '16px' }}>
                or click to browse
              </p>
              <span
                style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #2a2a2a',
                  color: '#555',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '12px'
                }}
              >
                Max 10MB • PDF only
              </span>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}