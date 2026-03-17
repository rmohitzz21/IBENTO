import { Router } from 'express'
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
} from '../controllers/payment.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Webhook does not require auth (Razorpay calls it)
router.post('/webhook', handleWebhook)

router.use(protect)

router.post('/create-order', createOrder)
router.post('/verify', verifyPayment)
router.get('/history', getPaymentHistory)

export default router
