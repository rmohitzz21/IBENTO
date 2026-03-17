import { Router } from 'express'
import { body } from 'express-validator'
import {
  register,
  verifyOtp,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
  resendOtp,
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js'
import validate from '../middleware/validate.js'

const router = Router()

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
)

router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  verifyOtp
)

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
)

router.post('/logout', logout)

router.post('/refresh', refresh)

router.post(
  '/forgot-password',
  otpLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  validate,
  forgotPassword
)

router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  validate,
  resetPassword
)

router.get('/me', protect, getMe)

router.post(
  '/resend-otp',
  otpLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  validate,
  resendOtp
)

export default router
