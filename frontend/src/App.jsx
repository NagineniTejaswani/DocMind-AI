import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import UploadZone from './components/UploadZone'
import DocInfoSidebar from './components/DocInfoSidebar'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import ErrorToast from './components/ErrorToast'
import { useSession } from './hooks/useSession'
import { askQuestion, clearHistory } from './api/useApi'
import { verifyCollection } from './api/useApi'


export default function App() {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    getActiveSession,
    addMessage,
    deleteSession,
    clearSessionMessages
  } = useSession()

  const activeSession = getActiveSession()

  useEffect(() => {
  const verifySessions = async () => {
    for (const session of sessions) {
      const result = await verifyCollection(session.collectionName)
      if (!result.exists) {
        deleteSession(session.id)
      }
    }
  }

  if (sessions.length > 0) {
    verifySessions()
  }
}, [])

  const handleUploadSuccess = (result) => {
    const existingSession = sessions.find(
      s => s.collectionName === result.collection_name
    )

    if (existingSession) {
      setActiveSessionId(existingSession.id)
      setShowUpload(false)
      return
    }

    createSession(
      result.filename,
      result.collection_name,
      result.chunks_stored
    )
    setShowUpload(false)
  }

  const handleSendQuestion = async (question) => {
    if (!activeSession) return

    const userMessage = { role: 'user', content: question }
    addMessage(activeSession.id, userMessage)
    setIsLoading(true)

    try {
      const result = await askQuestion(
        question,
        activeSession.collectionName,
        activeSession.id
      )
      const aiMessage = { role: 'assistant', content: result.answer }
      addMessage(activeSession.id, aiMessage)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (!activeSession) return
    try {
      await clearHistory(activeSession.id)
      clearSessionMessages(activeSession.id)
    } catch {
      setError('Failed to clear chat history.')
    }
  }

  const handleDeleteSession = (sessionId) => {
    deleteSession(sessionId)
  }

  const handleNewUpload = () => {
    setShowUpload(true)
  }

  const showChatUI = sessions.length > 0 && activeSession && !showUpload
  const showUploadUI = sessions.length === 0 || showUpload

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <ErrorToast message={error} onClose={() => setError(null)} />

      {showUploadUI ? (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {sessions.length > 0 && (
            <div className="text-end p-2">
              <button
                className="btn btn-sm"
                onClick={() => setShowUpload(false)}
              >
                 Back to Chat →
              </button>
            </div>
          )} 
          <UploadZone
            onUploadSuccess={handleUploadSuccess}
            onError={setError}
          />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <DocInfoSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onDeleteSession={handleDeleteSession}
            onNewUpload={handleNewUpload}
            onError={setError}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #2a2a2a', backgroundColor: 'transparent' }}>
              <div>
                <span style={{ fontWeight: '600', color: '#e0e0e0' }}>
                  📄 {activeSession?.filename}
                </span>
                
              </div>
              <button
  onClick={handleClearChat}
  style={{
    backgroundColor: 'transparent',
    border:"none",
    color: '#888',
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '13px',
    cursor: 'pointer'
  }}
>
  Clear Chat
</button>
            </div>

            <ChatWindow
              messages={activeSession?.messages || []}
              isLoading={isLoading}
            />

            <InputBar
              onSend={handleSendQuestion}
              isLoading={isLoading}
              isDisabled={!activeSession}
            />
          </div>
        </div>
      )}
    </div>
  )
}