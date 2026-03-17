import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password -refreshToken')
    if (!user) return res.status(401).json({ success: false, message: 'User not found' })
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account suspended' })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' })
  }
  next()
}
