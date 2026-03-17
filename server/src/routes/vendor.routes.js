import { Router } from 'express'
import {
  browseVendors,
  getTrendingVendors,
  getVendorById,
  getVendorServices,
  getVendorReviews,
  applyAsVendor,
  getVendorDashboard,
  updateVendorProfile,
  getVendorBookings,
  getVendorEarnings,
  updateAvailability,
  getVendorLeads,
  respondToLead,
  getVendorCalendar,
  blockCalendarDate,
  unblockCalendarDate,
} from '../controllers/vendor.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

// Public routes
router.get('/', browseVendors)
router.get('/trending', getTrendingVendors)

// Protected vendor routes (order matters — specific before :id)
router.get('/dashboard', protect, authorize('vendor', 'admin'), getVendorDashboard)
router.put('/profile', protect, authorize('vendor'), updateVendorProfile)
router.get('/bookings', protect, authorize('vendor', 'admin'), getVendorBookings)
router.get('/earnings', protect, authorize('vendor'), getVendorEarnings)
router.put('/availability', protect, authorize('vendor'), updateAvailability)
router.get('/leads', protect, authorize('vendor'), getVendorLeads)
router.post('/leads/:id/respond', protect, authorize('vendor'), respondToLead)
router.get('/calendar', protect, authorize('vendor'), getVendorCalendar)
router.post('/calendar/block', protect, authorize('vendor'), blockCalendarDate)
router.delete('/calendar/:dateId', protect, authorize('vendor'), unblockCalendarDate)

// Apply as vendor
router.post('/apply', protect, applyAsVendor)

// Public vendor profile routes
router.get('/:id', getVendorById)
router.get('/:id/services', getVendorServices)
router.get('/:id/reviews', getVendorReviews)

export default router
