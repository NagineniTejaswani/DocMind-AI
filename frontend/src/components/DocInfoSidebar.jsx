import { verifyCollection, deleteCollection } from '../api/useApi'
import { useState } from 'react'

export default function DocInfoSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewUpload,
  onError
}) {
  const [deletingId, setDeletingId] = useState(null)

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleSelectSession = async (session) => {
    try {
      const result = await verifyCollection(session.collectionName)
      if (!result.exists) {
        onError('Document no longer exists in database. Please re-upload.')
        onDeleteSession(session.id)
        return
      }
      onSelectSession(session.id)
    } catch {
      onError('Could not verify document. Please try again.')
    }
  }

  const handleDelete = async (e, session) => {
    e.stopPropagation()
    setDeletingId(session.id)
    try {
      await deleteCollection(session.collectionName)
      onDeleteSession(session.id)
    } catch {
      onError('Failed to delete document. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="sidebar d-flex flex-column" style={{ width: '260px', minWidth: '260px' }}>
      <div className="p-3" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <button
          onClick={onNewUpload}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #2f6feb',
            backgroundColor: 'transparent',
            color: '#7c9ef8',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          + New Document
        </button>
      </div>

      <div className="p-3 flex-grow-1 overflow-auto">
        <p style={{ color: '#555', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px' }}>
          Sessions ({sessions.length})
        </p>

        {sessions.length === 0 ? (
          <div className="text-center mt-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <p style={{ color: '#444', fontSize: '12px', marginTop: '8px' }}>No sessions yet</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`session-card ${activeSessionId === session.id ? 'active' : ''}`}
              onClick={() => handleSelectSession(session)}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: '500',
                      fontSize: '13px',
                      color: '#e0e0e0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    📄 {session.filename}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#555', marginTop: '2px' }}>
                    {formatDate(session.createdAt)}
                  </p>
                  
                </div>
                <button
                  onClick={(e) => handleDelete(e, session)}
                  disabled={deletingId === session.id}
                  style={{
                    background: 'none',
                    border: '1px solid #3a3a3a',
                    borderRadius: '4px',
                    color: '#666',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    fontSize: '11px',
                    marginLeft: '8px'
                  }}
                >
                  {deletingId === session.id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : '🗑'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}