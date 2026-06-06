import { v4 as uuidv4 } from 'uuid'
import { useLocalStorage } from './useLocalStorage'

export function useSession() {
  const [sessions, setSessions] = useLocalStorage('docmind_sessions', [])
  const [activeSessionId, setActiveSessionId] = useLocalStorage('docmind_active_session', null)

  const createSession = (filename, collectionName, chunksStored) => {
    const newSession = {
      id: uuidv4(),
      filename,
      collectionName,
      chunksStored,
      createdAt: new Date().toISOString(),
      messages: []
    }

    setSessions([newSession, ...sessions])
    setActiveSessionId(newSession.id)
    return newSession
  }

  const getActiveSession = () => {
    return sessions.find(s => s.id === activeSessionId) || null
  }

  const addMessage = (sessionId, message) => {
  setSessions(prevSessions => {
    const updated = prevSessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, messages: [...s.messages, message] }
      }
      return s
    })
    localStorage.setItem('docmind_sessions', JSON.stringify(updated))
    return updated
  })
}

  const deleteSession = (sessionId) => {
    const updated = sessions.filter(s => s.id !== sessionId)
    setSessions(updated)
    if (activeSessionId === sessionId) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null)
    }
  }

  const clearSessionMessages = (sessionId) => {
  setSessions(prevSessions => {
    const updated = prevSessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, messages: [] }
      }
      return s
    })
    localStorage.setItem('docmind_sessions', JSON.stringify(updated))
    return updated
  })
}

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    getActiveSession,
    addMessage,
    deleteSession,
    clearSessionMessages
  }
}