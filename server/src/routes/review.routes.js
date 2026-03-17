import { Router } from 'express'
import { body } from 'express-validator'
import {
  createReview,
  getVendorReviews,
  replyToReview,
  reactToReview,
  deleteReview,
} from '../controllers/review.controller.js'
import { protect, authorize } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()

router.get('/vendor/:vendorId', getVendorReviews)

router.use(protect)

router.post(
  '/',
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  validate,
  createReview
)

router.put('/:id/reply', authorize('vendor'), replyToReview)
router.post('/:id/react', reactToReview)
router.delete('/:id', deleteReview)

export default router
