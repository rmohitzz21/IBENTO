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
  getMyServices,
  getMyReviews,
} from '../controllers/vendor.controller.js'
import { protect, authorize } from '../middleware/auth.js'
import { requireApprovedVendor } from '../middleware/vendorStatus.js'

const router = Router()

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/', browseVendors)
router.get('/trending', getTrendingVendors)

// ── Apply as vendor (authenticated but any role can apply) ────────────────────
router.post('/apply', protect, applyAsVendor)

// ── Vendor dashboard & profile (accessible even while pending so vendor can see status) ──
router.get('/dashboard', protect, authorize('vendor', 'admin'), getVendorDashboard)
router.put('/profile', protect, authorize('vendor'), updateVendorProfile)
router.get('/earnings', protect, authorize('vendor'), getVendorEarnings)

// ── Availability (pending vendors can set availability, but only approved ones affect bookings) ──
router.put('/availability', protect, authorize('vendor'), updateAvailability)
router.get('/calendar', protect, authorize('vendor'), getVendorCalendar)
router.get('/services', protect, authorize('vendor'), getMyServices)
router.get('/my-reviews', protect, authorize('vendor'), getMyReviews)

// ── Routes that require approved vendor status ────────────────────────────────
router.get('/bookings', protect, authorize('vendor', 'admin'), requireApprovedVendor, getVendorBookings)
router.get('/leads', protect, authorize('vendor'), requireApprovedVendor, getVendorLeads)
router.post('/leads/:id/respond', protect, authorize('vendor'), requireApprovedVendor, respondToLead)
router.post('/calendar/block', protect, authorize('vendor'), requireApprovedVendor, blockCalendarDate)
router.delete('/calendar/:dateId', protect, authorize('vendor'), requireApprovedVendor, unblockCalendarDate)

// ── Public vendor profile routes (specific before :id) ────────────────────────
router.get('/:id', getVendorById)
router.get('/:id/services', getVendorServices)
router.get('/:id/reviews', getVendorReviews)

export default router
