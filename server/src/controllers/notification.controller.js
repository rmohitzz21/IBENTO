import Notification from '../models/Notification.js'

// GET /api/notifications
export const getNotifications = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId: req.user._id }),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ])

  res.json({
    success: true,
    notifications,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

// PUT /api/notifications/read-all
export const markAllRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true })
  res.json({ success: true, message: 'All notifications marked as read' })
}

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  })
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' })
  res.json({ success: true, message: 'Notification deleted' })
}
