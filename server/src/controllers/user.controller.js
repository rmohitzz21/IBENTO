import User from '../models/User.js'
import Vendor from '../models/Vendor.js'
import Notification from '../models/Notification.js'
import cloudinary from '../config/cloudinary.js'

// GET /api/users/profile
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('preferredCategories', 'name emoji')
    .populate('wishlist', 'businessName rating city avatar status')

  res.json({ success: true, user })
}

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
  const { name, phone, city, dob, preferredCategories, fcmToken } = req.body

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, city, dob, preferredCategories, fcmToken },
    { new: true, runValidators: true }
  ).populate('preferredCategories', 'name emoji')

  res.json({ success: true, message: 'Profile updated', user })
}

// POST /api/users/wishlist/:vendorId (toggle)
export const toggleWishlist = async (req, res) => {
  const { vendorId } = req.params
  const user = await User.findById(req.user._id)

  const idx = user.wishlist.findIndex((id) => id.toString() === vendorId)
  let action
  if (idx > -1) {
    user.wishlist.splice(idx, 1)
    action = 'removed'
  } else {
    const vendor = await Vendor.findById(vendorId)
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' })
    user.wishlist.push(vendorId)
    action = 'added'
  }

  await user.save()
  res.json({ success: true, message: `Vendor ${action} from wishlist`, wishlist: user.wishlist })
}

// GET /api/users/wishlist
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'wishlist',
      populate: { path: 'category', select: 'name emoji' },
    })

  res.json({ success: true, wishlist: user.wishlist })
}

// GET /api/users/notifications
export const getNotifications = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const [notifications, total] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId: req.user._id }),
  ])

  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false })

  res.json({
    success: true,
    notifications,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

// PUT /api/users/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true })
  res.json({ success: true, message: 'All notifications marked as read' })
}

// DELETE /api/users/notifications/:id
export const deleteNotification = async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  })

  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' })

  res.json({ success: true, message: 'Notification deleted' })
}

// POST /api/users/avatar (upload avatar)
export const uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })

  const b64 = Buffer.from(req.file.buffer).toString('base64')
  const dataURI = `data:${req.file.mimetype};base64,${b64}`

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'ibento/avatars',
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    public_id: `user-${req.user._id}`,
    overwrite: true,
  })

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true }
  )

  res.json({ success: true, avatar: result.secure_url, user })
}
