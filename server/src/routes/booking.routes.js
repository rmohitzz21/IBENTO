import { Router } from 'express'
import { body } from 'express-validator'
import {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  getBookingInvoice,
} from '../controllers/booking.controller.js'
import { protect, authorize } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()

router.use(protect)

router.post(
  '/',
  [
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('eventDate').isISO8601().withMessage('Valid event date is required'),
  ],
  validate,
  createBooking
)

router.post('/payment/verify', verifyPayment)
router.get('/my', getMyBookings)
router.get('/:id', getBookingById)
router.put('/:id/accept', authorize('vendor', 'admin'), acceptBooking)
router.put('/:id/reject', authorize('vendor', 'admin'), rejectBooking)
router.put('/:id/complete', authorize('vendor', 'admin'), completeBooking)
router.put('/:id/cancel', cancelBooking)
router.get('/:id/invoice', getBookingInvoice)

export default router
