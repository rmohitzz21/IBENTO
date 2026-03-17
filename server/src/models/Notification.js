import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: { type: String },
    title: { type: String },
    message: { type: String },
    data: {
      bookingId: { type: mongoose.Schema.Types.ObjectId },
      vendorId: { type: mongoose.Schema.Types.ObjectId },
      extra: { type: mongoose.Schema.Types.Mixed },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
