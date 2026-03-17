import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { useNotificationStore } from '../stores/notificationStore'

export const useSocket = () => {
  const socketRef = useRef(null)
  const { accessToken, isAuthenticated } = useAuthStore()
  const { addMessage, updateConversationLastMessage } = useChatStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    socketRef.current = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      {
        auth: { token: accessToken },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    )

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    socket.on('message:receive', ({ message }) => {
      addMessage(message.conversationId, message)
      updateConversationLastMessage(message.conversationId, message)
    })

    socket.on('notification:push', (notification) => {
      addNotification(notification)
    })

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated, accessToken])

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
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
    socketRef,
    emit,
    joinConversation,
    sendMessage,
    sendTyping,
    isConnected: socketRef.current?.connected ?? false,
  }
}
