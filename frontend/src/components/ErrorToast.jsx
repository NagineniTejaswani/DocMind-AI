import { useEffect } from 'react'

export default function ErrorToast({ message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 4000)
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  if (!message) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px'
      }}
    >
      <div className="alert alert-danger d-flex align-items-center justify-content-between mb-0 shadow">
        <span>{message}</span>
        <button
          className="btn-close"
          onClick={onClose}
        />
      </div>
    </div>
  )
}