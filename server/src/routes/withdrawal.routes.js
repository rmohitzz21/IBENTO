import { Router } from 'express'
import { body } from 'express-validator'
import {
  requestWithdrawal,
  getWithdrawals,
  getAvailableBalance,
} from '../controllers/withdrawal.controller.js'
import { protect, authorize } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()

router.use(protect, authorize('vendor'))

router.get('/available-balance', getAvailableBalance)
router.get('/', getWithdrawals)
router.post(
  '/',
  [body('amount').isNumeric().withMessage('Amount must be a number').custom((v) => v > 0).withMessage('Amount must be greater than 0')],
  validate,
  requestWithdrawal
)

export default router
