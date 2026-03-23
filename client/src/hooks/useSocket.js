import { useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { useNotificationStore } from '../stores/notificationStore'

// Module-level singleton — shared across all component instances
let _socket = null
let _socketToken = null

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore()
  const { addMessage, updateConversationLastMessage } = useChatStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    // Not authenticated — disconnect and clear
    if (!isAuthenticated || !accessToken) {
      if (_socket) {
        _socket.disconnect()
        _socket = null
        _socketToken = null
      }
      return
    }

    // Already connected with the exact same token — no-op
    if (_socket?.connected && _socketToken === accessToken) return

    // Disconnect stale socket (different/expired token, or disconnected)
    if (_socket) {
      _socket.disconnect()
      _socket = null
      _socketToken = null
    }

    _socket = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      {
        auth: { token: accessToken },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    )
    _socketToken = accessToken

    _socket.on('connect', () => {
      console.log('[Socket] Connected:', _socket.id)
    })
    _socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })
    _socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
    })
    _socket.on('message:receive', ({ message }) => {
      addMessage(message.conversationId, message)
      updateConversationLastMessage(message.conversationId, message)
    })
    _socket.on('notification:push', (notification) => {
      addNotification(notification)
    })

    // Do NOT disconnect on unmount — the singleton must stay alive
    // across component mounts/unmounts. Cleanup only on auth change above.
  }, [isAuthenticated, accessToken])

  const emit = useCallback((event, data) => {
    if (_socket?.connected) _socket.emit(event, data)
  }, [])

  const joinConversation = useCallback((conversationId) => {
    emit('conversation:join', { conversationId })
  }, [emit])

  const sendMessage = useCallback((data) => {
    emit('message:send', data)
  }, [emit])

  const sendTyping = useCallback((conversationId, isTyping) => {
    emit('typing', { conversationId, isTyping })
  }, [emit])

  return {
    emit,
    joinConversation,
    sendMessage,
    sendTyping,
    isConnected: _socket?.connected ?? false,
  }
}
