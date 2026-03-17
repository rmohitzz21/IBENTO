import { Router } from 'express'
import {
  getDashboard,
  getAllVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  getAllUsers,
  blockUser,
  getAllBookings,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getAllReviews,
  toggleReviewVisibility,
  deleteReview,
  getAnalytics,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.use(protect, authorize('admin'))

router.get('/dashboard', getDashboard)
router.get('/analytics', getAnalytics)
router.get('/settings', getSettings)
router.put('/settings', updateSettings)

// Vendors
router.get('/vendors', getAllVendors)
router.put('/vendors/:id/approve', approveVendor)
router.put('/vendors/:id/reject', rejectVendor)
router.put('/vendors/:id/suspend', suspendVendor)

// Users
router.get('/users', getAllUsers)
router.put('/users/:id/block', blockUser)

// Bookings
router.get('/bookings', getAllBookings)

// Withdrawals
router.get('/withdrawals', getAllWithdrawals)
router.put('/withdrawals/:id/approve', approveWithdrawal)
router.put('/withdrawals/:id/reject', rejectWithdrawal)

// Reviews
router.get('/reviews', getAllReviews)
router.put('/reviews/:id/visibility', toggleReviewVisibility)
router.delete('/reviews/:id', deleteReview)

export default router
