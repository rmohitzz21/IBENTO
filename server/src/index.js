import dotenv from 'dotenv'
dotenv.config()

import 'express-async-errors'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'

// Routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import vendorRoutes from './routes/vendor.routes.js'
import serviceRoutes from './routes/service.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import messageRoutes from './routes/message.routes.js'
import reviewRoutes from './routes/review.routes.js'
import cartRoutes from './routes/cart.routes.js'
import comboRoutes from './routes/combo.routes.js'
import withdrawalRoutes from './routes/withdrawal.routes.js'
import categoryRoutes from './routes/category.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import adminRoutes from './routes/admin.routes.js'
import handlers from './socket/handlers.js'

connectDB()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// Socket.io auth middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication error'))
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    next()
  } catch {
    next(new Error('Authentication error'))
  }
})

io.on('connection', (socket) => {
  socket.join(`user-${socket.userId}`)
  console.log(`User ${socket.userId} connected via socket`)
  handlers(io, socket)
})

// Make io available in req
app.use((req, res, next) => {
  req.io = io
  next()
})

// Security & middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
)
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Apply global rate limiter (skip webhook)
app.use('/api', (req, res, next) => {
  if (req.path === '/payments/webhook') return next()
  apiLimiter(req, res, next)
})

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date(), env: process.env.NODE_ENV })
)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/combos', comboRoutes)
app.use('/api/withdrawals', withdrawalRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`iBento server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
})

export default app
