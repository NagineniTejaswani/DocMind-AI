import { useEffect, useState } from 'react'
import { checkHealth } from '../api/useApi'
import document from '../assets/document.png'

export default function Navbar() {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await checkHealth()
        setIsOnline(true)
      } catch {
        setIsOnline(false)
      }
    }
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav
      style={{
        backgroundColor: '#161616',
        borderBottom: '1px solid #2a2a2a',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={document} alt="Document" style={{ width: '30px', height: '30px' }} />
        <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '16px' }}>DocMind AI</span>
      </div>
      <div
  title={isOnline ? 'Backend Online' : 'Backend Offline'}
  style={{
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isOnline ? '#22c55e' : '#ef4444',
    cursor: 'default'
  }}
/>
    </nav>
  )
}