import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'

export default function handlers(io, socket) {
  // Send a message
  socket.on('message:send', async (data) => {
    try {
      const { conversationId, receiverId, content, type = 'text', fileUrl, fileName } = data

      const message = await Message.create({
        conversationId,
        senderId: socket.userId,
        receiverId,
        content,
        type,
        fileUrl,
        fileName,
      })

      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: type === 'text' ? content : `[${type}]`,
          lastMessageAt: new Date(),
          $inc: { [`unreadCount.${receiverId}`]: 1 },
        },
        { new: true }
      )

      const populatedMessage = await message.populate('senderId', 'name avatar')

      io.to(`user-${receiverId}`).emit('message:receive', { message: populatedMessage, conversation })
      socket.emit('message:sent', { message: populatedMessage, conversation })
    } catch (error) {
      console.error('message:send error:', error.message)
      socket.emit('message:error', { message: 'Failed to send message' })
    }
  })

  // Typing indicators — handle both naming conventions
  socket.on('typing:start', (data) => {
    socket.to(`conversation-${data.conversationId}`).emit('typing:indicator', {
      userId: socket.userId,
      isTyping: true,
    })
  })

  socket.on('typing:stop', (data) => {
    socket.to(`conversation-${data.conversationId}`).emit('typing:indicator', {
      userId: socket.userId,
      isTyping: false,
    })
  })

  // Client emits 'typing' with { conversationId, isTyping }
  socket.on('typing', (data) => {
    socket.to(`conversation-${data.conversationId}`).emit('typing:indicator', {
      userId: socket.userId,
      isTyping: data.isTyping,
    })
  })

  // Mark messages as read
  socket.on('message:read', async (data) => {
    try {
      await Message.updateMany(
        { conversationId: data.conversationId, receiverId: socket.userId, isRead: false },
        { isRead: true, readAt: new Date() }
      )

      await Conversation.findByIdAndUpdate(data.conversationId, {
        $set: { [`unreadCount.${socket.userId}`]: 0 },
      })

      socket.to(`conversation-${data.conversationId}`).emit('message:read-ack', {
        conversationId: data.conversationId,
        readBy: socket.userId,
      })
    } catch (error) {
      console.error('message:read error:', error.message)
    }
  })

  // Join a conversation room — handle both naming conventions
  socket.on('join:conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`)
  })

  // Client emits 'conversation:join' with { conversationId }
  socket.on('conversation:join', (data) => {
    const id = data?.conversationId || data
    socket.join(`conversation-${id}`)
  })

  // Leave a conversation room
  socket.on('leave:conversation', (conversationId) => {
    socket.leave(`conversation-${conversationId}`)
  })

  // Booking notifications
  socket.on('booking:notify', (data) => {
    io.to(`user-${data.recipientId}`).emit('booking:update', data)
  })

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`)
  })
}
