import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'booking-card'],
      default: 'text',
    },
    fileUrl: { type: String },
    fileName: { type: String },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: { type: Date },
  },
  { timestamps: true }
)

messageSchema.index({ conversationId: 1, createdAt: 1 })
messageSchema.index({ receiverId: 1, isRead: 1 })

const Message = mongoose.model('Message', messageSchema)
export default Message
