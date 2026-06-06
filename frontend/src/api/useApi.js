const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const checkHealth = async () => {
  const response = await fetch(`${BASE_URL}/api/health`)
  if (!response.ok) throw new Error('Backend is offline')
  return response.json()
}

export const uploadPDF = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Upload failed')
  }

  return response.json()
}

export const askQuestion = async (question, collectionName, sessionId) => {
  const response = await fetch(`${BASE_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      collection_name: collectionName,
      session_id: sessionId
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to get answer')
  }

  return response.json()
}

export const clearHistory = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/api/clear-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  })

  if (!response.ok) throw new Error('Failed to clear history')
  return response.json()
}

export const verifyCollection = async (collectionName) => {
  const response = await fetch(`${BASE_URL}/api/verify-collection/${collectionName}`)
  if (!response.ok) return { exists: false }
  return response.json()
}

export const deleteCollection = async (collectionName) => {
  const response = await fetch(`${BASE_URL}/api/collection/${collectionName}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to delete document')
  }

  return response.json()
}