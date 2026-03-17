import { Router } from 'express'
import {
  getProfile,
  updateProfile,
  toggleWishlist,
  getWishlist,
  getNotifications,
  markAllNotificationsRead,
  deleteNotification,
  uploadAvatar,
} from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.js'
import { uploadSingle } from '../middleware/upload.js'

const router = Router()

router.use(protect)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.post('/avatar', uploadSingle, uploadAvatar)
router.post('/wishlist/:vendorId', toggleWishlist)
router.get('/wishlist', getWishlist)
router.get('/notifications', getNotifications)
router.put('/notifications/read-all', markAllNotificationsRead)
router.delete('/notifications/:id', deleteNotification)

export default router
