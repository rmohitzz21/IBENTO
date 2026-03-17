import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import User from '../models/User.js'

// GET /api/messages/conversations
export const getConversations = async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name avatar role')
    .populate('bookingId', 'bookingNumber status')
    .sort({ lastMessageAt: -1 })

  res.json({ success: true, conversations })
}

// GET /api/messages/conversations/:id
export const getConversationMessages = async (req, res) => {
  const { id } = req.params
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 30
  const skip = (page - 1) * limit

  const conversation = await Conversation.findOne({
    _id: id,
    participants: req.user._id,
  })

  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Conversation not found' })
  }

  const [messages, total] = await Promise.all([
    Message.find({ conversationId: id })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversationId: id }),
  ])

  // Mark messages as read
  await Message.updateMany(
    { conversationId: id, receiverId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  )
  await Conversation.findByIdAndUpdate(id, {
    $set: { [`unreadCount.${req.user._id}`]: 0 },
  })

  res.json({
    success: true,
    conversation,
    messages: messages.reverse(),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

// POST /api/messages/send
export const sendMessage = async (req, res) => {
  const { receiverId, content, type = 'text', fileUrl, fileName, bookingId } = req.body

  const receiver = await User.findById(receiverId)
  if (!receiver) return res.status(404).json({ success: false, message: 'Recipient not found' })

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, receiverId] },
  })

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, receiverId],
      bookingId: bookingId || null,
    })
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: req.user._id,
    receiverId,
    content,
    type,
    fileUrl,
    fileName,
  })

  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: type === 'text' ? content : `[${type}]`,
    lastMessageAt: new Date(),
    $inc: { [`unreadCount.${receiverId}`]: 1 },
  })

  const populated = await message.populate('senderId', 'name avatar')

  if (req.io) {
    req.io.to(`user-${receiverId}`).emit('message:receive', {
      message: populated,
      conversationId: conversation._id,
    })
  }

  res.status(201).json({ success: true, message: populated, conversationId: conversation._id })
}

// PUT /api/messages/conversations/:id/read
export const markConversationRead = async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user._id,
  })

  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' })

  await Message.updateMany(
    { conversationId: req.params.id, receiverId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  )

  await Conversation.findByIdAndUpdate(req.params.id, {
    $set: { [`unreadCount.${req.user._id}`]: 0 },
  })

  res.json({ success: true, message: 'Conversation marked as read' })
}
