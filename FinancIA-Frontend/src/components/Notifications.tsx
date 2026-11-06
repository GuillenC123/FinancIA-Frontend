import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { getNotificationsWebSocketUrl, type NotificationMessage } from '../api'

type VisibleNotification = NotificationMessage & { id: number }

function notificationType(type: string) {
  const normalized = type.toLowerCase()
  return ['success', 'error', 'warning'].includes(normalized) ? normalized : 'info'
}

function normalizeNotification(data: unknown): NotificationMessage {
  if (typeof data === 'string') {
    try {
      return normalizeNotification(JSON.parse(data))
    } catch {
      return { type: 'info', header: 'Notificación', body: data, timestamp: new Date().toISOString() }
    }
  }

  if (!data || typeof data !== 'object') {
    return { type: 'info', header: 'Notificación', body: 'Recibiste una notificación.', timestamp: new Date().toISOString() }
  }

  const message = data as Partial<NotificationMessage>
  return {
    type: typeof message.type === 'string' ? message.type : 'info',
    header: typeof message.header === 'string' && message.header ? message.header : 'Notificación',
    body: typeof message.body === 'string' ? message.body : '',
    timestamp: typeof message.timestamp === 'string' ? message.timestamp : new Date().toISOString(),
    data: message.data,
  }
}

function NotificationToast({ notification, onDismiss }: {
  notification: VisibleNotification
  onDismiss: (id: number) => void
}) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(notification.id), 6000)
    return () => window.clearTimeout(timeout)
  }, [notification.id, onDismiss])

  const timestamp = new Date(notification.timestamp)
  const timeLabel = Number.isNaN(timestamp.getTime())
    ? ''
    : new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(timestamp)

  return (
    <article className={`notification-toast ${notificationType(notification.type)}`} role="status">
      <div className="notification-icon" aria-hidden="true"><Bell size={17} /></div>
      <div className="notification-content">
        <strong>{notification.header}</strong>
        {notification.body && <p>{notification.body}</p>}
        {timeLabel && <small>{timeLabel}</small>}
      </div>
      <button type="button" onClick={() => onDismiss(notification.id)} aria-label="Cerrar notificación">
        <X size={16} aria-hidden="true" />
      </button>
    </article>
  )
}

export function Notifications({ token }: { token: string }) {
  const [notifications, setNotifications] = useState<VisibleNotification[]>([])
  const nextId = useRef(0)
  const dismiss = useCallback((id: number) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  useEffect(() => {
    let disposed = false
    let socket: WebSocket | null = null
    let reconnectTimeout = 0
    let reconnectAttempt = 0

    const connect = () => {
      if (disposed) return

      const connection = new WebSocket(getNotificationsWebSocketUrl(token))
      socket = connection
      connection.onopen = () => {
        reconnectAttempt = 0
      }
      connection.onmessage = (event) => {
        let payload: unknown = event.data
        if (typeof event.data === 'string') {
          try {
            payload = JSON.parse(event.data)
          } catch {
            payload = event.data
          }
        }
        const message = normalizeNotification(payload)
        nextId.current += 1
        const visible = { ...message, id: nextId.current }
        setNotifications((current) => [...current.slice(-3), visible])
      }
      connection.onclose = () => {
        if (disposed) return
        const delay = Math.min(1000 * (2 ** reconnectAttempt), 30000)
        reconnectAttempt += 1
        reconnectTimeout = window.setTimeout(connect, delay)
      }
      connection.onerror = () => connection.close()
    }

    connect()
    return () => {
      disposed = true
      window.clearTimeout(reconnectTimeout)
      socket?.close()
    }
  }, [token])

  return (
    <div className="notification-stack" aria-live="polite" aria-label="Notificaciones">
      {notifications.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} onDismiss={dismiss} />
      ))}
    </div>
  )
}
