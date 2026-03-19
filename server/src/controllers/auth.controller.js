import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { saveOTP, verifyOTP } from '../services/otp.service.js'
import { sendOTPEmail } from '../services/email.service.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, phone, role } = req.body

  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' })
  }

  const user = await User.create({ name, email, phone, role })

  const otp = await saveOTP(email, 'register')
  await sendOTPEmail(email, otp, 'register')

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email with the OTP sent.',
    userId: user._id,
  })
}

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  const { email, otp, purpose = 'register' } = req.body

  await verifyOTP(email, purpose, otp)

  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  if (purpose === 'register') {
    user.isVerified = true
  }
  // 'login' purpose: just issue tokens, no extra flag needed

  const { accessToken, refreshToken } = user.generateTokens()
  const hashed = await bcrypt.hash(refreshToken, 10)
  user.refreshToken = hashed
  await user.save()

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

  res.json({
    success: true,
    message: 'OTP verified successfully',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
    },
  })
}

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password +refreshToken')
  if (!user) return res.status(401).json({ success: false, message: 'No account found with this email' })

  if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account suspended' })

  // Admin: password-based login
  if (user.role === 'admin') {
    if (!password) {
      return res.json({ success: true, requiresPassword: true })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const { accessToken, refreshToken } = user.generateTokens()
    const hashed = await bcrypt.hash(refreshToken, 10)
    user.refreshToken = hashed
    await user.save()
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    return res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        city: user.city,
        isVerified: user.isVerified,
      },
    })
  }

  // Non-admin: OTP-based login
  const otp = await saveOTP(email, 'login')
  await sendOTPEmail(email, otp, 'login')
  return res.json({
    success: true,
    message: 'OTP sent to your email. Please verify to continue.',
    requiresOTP: true,
    role: user.role,
  })
}

// POST /api/auth/logout
export const logout = async (req, res) => {
  const { refreshToken } = req.cookies
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null })
    } catch {
      // token may be expired, clear anyway
    }
  }
  res.clearCookie('refreshToken', COOKIE_OPTIONS)
  res.json({ success: true, message: 'Logged out successfully' })
}

// POST /api/auth/refresh
export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token' })

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' })
  }

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || !user.refreshToken) {
    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' })
  }

  const isValid = await bcrypt.compare(token, user.refreshToken)
  if (!isValid) return res.status(401).json({ success: false, message: 'Invalid refresh token' })

  const { accessToken, refreshToken: newRefreshToken } = user.generateTokens()
  const hashed = await bcrypt.hash(newRefreshToken, 10)
  user.refreshToken = hashed
  await user.save()

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS)

  res.json({ success: true, accessToken })
}

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    // Don't leak whether email exists
    return res.json({ success: true, message: 'If an account exists, an OTP has been sent.' })
  }

  const otp = await saveOTP(email, 'reset-password')
  await sendOTPEmail(email, otp, 'reset-password')

  res.json({ success: true, message: 'Password reset OTP sent to your email.' })
}

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body

  await verifyOTP(email, 'reset-password', otp)

  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  user.password = newPassword
  user.refreshToken = null
  await user.save()

  res.clearCookie('refreshToken', COOKIE_OPTIONS)
  res.json({ success: true, message: 'Password reset successful. Please login with your new password.' })
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('preferredCategories', 'name emoji')
    .populate('wishlist', 'businessName rating city avatar')

  res.json({ success: true, user })
}

// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  const { email, purpose = 'register' } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  const otp = await saveOTP(email, purpose)
  await sendOTPEmail(email, otp, purpose)

  res.json({ success: true, message: 'OTP resent successfully' })
}
